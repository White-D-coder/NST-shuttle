const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Route = require('./src/models/Route');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const seedData = async () => {
    try {
        await User.deleteMany();
        await Route.deleteMany();

        console.log('Data Destroyed...');

        const users = await User.create([
            {
                name: 'Admin User',
                email: 'admin@nst.com',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Driver One',
                email: 'driver1@nst.com',
                password: 'password123',
                role: 'driver'
            },
            {
                name: 'Student User',
                email: 'student@nst.com',
                password: 'password123',
                role: 'user'
            }
        ]);

        console.log('Users Created...');

        const routes = await Route.create([
            {
                name: 'Morning Route A',
                stops: [
                    { name: 'Hostel 1', lat: 12.9716, lng: 77.5946 },
                    { name: 'Main Gate', lat: 12.9720, lng: 77.5950 },
                    { name: 'Academic Block', lat: 12.9730, lng: 77.5960 }
                ],
                schedule: ['08:00', '08:30', '09:00']
            },
            {
                name: 'Evening Route B',
                stops: [
                    { name: 'Academic Block', lat: 12.9730, lng: 77.5960 },
                    { name: 'Hostel 1', lat: 12.9716, lng: 77.5946 }
                ],
                schedule: ['17:00', '17:30', '18:00']
            }
        ]);

        console.log('Routes Created...');

        await require('./src/models/Stop').deleteMany();

        const stops = await require('./src/models/Stop').create([
            {
                stopId: 'STOP_001',
                name: 'Main Road Start',
                location: { type: 'Point', coordinates: [73.910859, 18.618991] }, // lng, lat
                sequence: 1
            },
            {
                stopId: 'STOP_002',
                name: 'Roundabout Circle',
                location: { type: 'Point', coordinates: [73.911227, 18.621405] },
                sequence: 2
            },
            {
                stopId: 'STOP_003',
                name: 'NST College Main Gate',
                location: { type: 'Point', coordinates: [73.912615, 18.621845] },
                sequence: 3
            }
        ]);

        console.log('Stops Created...');

        process.exit();

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedData();
