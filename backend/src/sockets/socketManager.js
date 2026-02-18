const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Trip = require('../models/Trip');

const socketManager = (io) => {
    // Middleware for Socket Auth
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = await User.findById(decoded.id);
            next();
        } catch (err) {
            console.log('Socket Auth Error:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.name} (${socket.user.role}) - ${socket.id}`);

        // Join room based on role
        if (socket.user.role === 'driver') {
            socket.join('drivers');
            // Drivers also join the general bus_tracking room to receive student updates
            socket.join('bus_tracking');
        } else if (socket.user.role === 'admin') {
            socket.join('admins');
            // Admins also join the general bus_tracking room
            socket.join('bus_tracking');
        } else if (socket.user.role === 'student') {
            // Students join the general bus_tracking room
            socket.join('bus_tracking');
        }



        socket.on('student_location_update', ({ lat, lng }) => { // userId is now socket.user._id
            const userId = String(socket.user._id); // Ensure userId is a string
            if (!userId || !lat || !lng) return;

            let assignedStopId = null;

            // Check if student is within radius of any stop
            for (const stop of stopsCache) {
                const stopLat = stop.location.coordinates[1];
                const stopLng = stop.location.coordinates[0];
                const dist = getDistance(lat, lng, stopLat, stopLng);

                if (dist <= stop.radius) {
                    assignedStopId = String(stop.stopId); // Ensure stopId is a string
                    break; // Assume student isn't at multiple stops overlap
                }
            }

            // Update Map Logic
            let needsUpdate = false;

            // Remove student from ONLY the stops they are NO LONGER at
            stopStudentMap.forEach((studentSet, sId) => {
                if (sId !== assignedStopId && studentSet.has(userId)) {
                    studentSet.delete(userId);
                    needsUpdate = true;
                }
            });

            // Add student to the new stop (if any)
            if (assignedStopId) {
                const studentSet = stopStudentMap.get(assignedStopId);
                if (studentSet && !studentSet.has(userId)) { // Check if studentSet exists
                    studentSet.add(userId);
                    needsUpdate = true;
                }
            }

            // If counts changed, broadcast to bus_tracking room (drivers, admins, other students)
            if (needsUpdate) {
                const counts = {};
                stopStudentMap.forEach((set, id) => counts[id] = set.size);

                io.to('bus_tracking').emit('stop_counts_update', counts);
                console.log('Stop counts updated:', counts);

                // FEATURE 3: Hotspot Alert
                if (assignedStopId && stopStudentMap.get(assignedStopId) && stopStudentMap.get(assignedStopId).size >= 8) {
                    const stopName = stopsCache.find(s => String(s.stopId) === assignedStopId)?.name || assignedStopId;
                    io.to('bus_tracking').emit('hotspot_alert', {
                        stopId: assignedStopId,
                        stopName: stopName,
                        count: stopStudentMap.get(assignedStopId).size
                    });
                    console.log(`Hotspot Alert: ${stopName} has ${stopStudentMap.get(assignedStopId).size} students.`);
                }
            }
        });

        // --- DRIVER EVENTS ---
        // Driver: Update Location
        socket.on('driver_location_update', async (data) => {
            // data: { routeId, lat, lng, heading, speed }
            if (socket.user.role !== 'driver') return;

            // Broadcast to students
            io.to('bus_tracking').emit('driver_location', data);

            const { routeId, lat, lng, heading, speed } = data;
            const currentBusId = socket.user._id;

            // Update Trip in DB (Optimized: maybe not every single update, or use fire & forget)
            try {
                await Trip.findOneAndUpdate(
                    { driver: socket.user._id, status: 'active' },
                    {
                        $set: {
                            'currentLocation.lat': lat,
                            'currentLocation.lng': lng,
                            'currentLocation.heading': heading,
                            'currentLocation.speed': speed,
                            'currentLocation.lastUpdated': new Date()
                        },
                        $push: {
                            locationHistory: {
                                lat, lng, heading, speed, timestamp: new Date()
                            }
                        }
                    },
                    { new: true, upsert: false } // Do not create if not found
                );
            } catch (tripErr) {
                console.error("Trip update error:", tripErr);
            }

            // FEATURE 4 & 5: Bus Geofencing & ETA
            let insideAnyStop = false;

            for (const stop of stopsCache) {
                const dist = getDistance(lat, lng, stop.location.coordinates[1], stop.location.coordinates[0]);

                // ARRIVAL DETECTION
                if (dist <= stop.radius) {
                    insideAnyStop = true;

                    if (socket.currentStopId !== stop.stopId) {
                        // Just Arrived
                        socket.currentStopId = stop.stopId;
                        console.log(`Bus arrived at ${stop.name}`);

                        // Create History Record
                        try {
                            const BusStopHistory = require('../models/BusStopHistory');
                            await BusStopHistory.create({
                                busId: currentBusId,
                                stopId: stop.stopId,
                                arrivalTime: new Date()
                            });

                            io.to('bus_tracking').emit('stop_status_update', {
                                stopId: stop.stopId,
                                status: 'ARRIVED',
                                stopName: stop.name
                            });
                        } catch (err) {
                            console.error('Error logging arrival:', err);
                        }
                    }
                }
            }

            // DEPARTURE DETECTION
            if (!insideAnyStop && socket.currentStopId) {
                console.log(`Bus left ${socket.currentStopId}`);

                // Update History Record (Find latest for this bus & stop without departure)
                try {
                    const BusStopHistory = require('../models/BusStopHistory');
                    const lastLog = await BusStopHistory.findOne({
                        busId: currentBusId,
                        stopId: socket.currentStopId,
                        departureTime: null
                    }).sort({ arrivalTime: -1 });

                    if (lastLog) {
                        lastLog.departureTime = new Date();
                        await lastLog.save();
                    }

                    io.to('bus_tracking').emit('stop_status_update', {
                        stopId: socket.currentStopId,
                        status: 'DEPARTED'
                    });
                } catch (err) {
                    console.error('Error logging departure:', err);
                }

                socket.currentStopId = null;
            }

            // FEATURE 5: ETA CALCULATION
            const effectiveSpeed = (speed && speed > 1) ? speed : 8.33; // m/s (approx 30km/h)

            const etas = stopsCache.map(stop => {
                const dist = getDistance(lat, lng, stop.location.coordinates[1], stop.location.coordinates[0]);
                const timeSeconds = dist / effectiveSpeed;
                return {
                    stopId: stop.stopId,
                    stopName: stop.name,
                    etaSeconds: Math.round(timeSeconds),
                    distanceMeters: Math.round(dist)
                };
            }).sort((a, b) => a.etaSeconds - b.etaSeconds); // Nearest first

            io.to('bus_tracking').emit('eta_update', etas);
        });

        // Start Trip
        socket.on('start_trip', async (data) => {
            if (socket.user.role !== 'driver') return;
            const { routeId } = data;
            try {
                await Trip.create({
                    driver: socket.user._id,
                    route: routeId,
                    status: 'active',
                    currentLocation: { lat: 0, lng: 0 } // Initial dummy
                });
                io.to(`route_${routeId}`).emit('trip_started', { routeId });
                console.log(`Trip started by ${socket.user.name} on route ${routeId}`);
            } catch (err) {
                console.error(err);
            }
        });

        // End Trip
        socket.on('end_trip', async (data) => {
            if (socket.user.role !== 'driver') return;
            try {
                await Trip.findOneAndUpdate(
                    { driver: socket.user._id, status: 'active' },
                    { status: 'completed', endTime: new Date() }
                );
                // Notify users?
            } catch (err) {
                console.error(err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.name}`);
        });
    });
};

module.exports = socketManager;
