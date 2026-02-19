import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import useSocket from '../hooks/useSocket';
import api from '../services/api';

// Fix Leaflet Marker Icon issue in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapComponent = () => {
    const { socket, isConnected } = useSocket('user');
    const [busLocation, setBusLocation] = useState(null);
    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);

    // Initial Location (Morning Pickup / Afternoon Drop)
    const position = [18.612041, 73.911568];

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const res = await api.get('/routes');
                setRoutes(res.data.data);
                if (res.data.data.length > 0) {
                    setSelectedRoute(res.data.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch routes", err);
            }
        };
        fetchRoutes();
    }, []);

    useEffect(() => {
        if (!socket || !isConnected) return;

        if (selectedRoute) {
            socket.emit('join_route', selectedRoute._id);
            console.log(`Joined route room: ${selectedRoute.name}`);
        }

        socket.on('driver_location', (data) => {
            console.log('Driver Location:', data);
            setBusLocation({
                position: [data.lat, data.lng],
                heading: data.heading || 0
            });
        });

        return () => {
            if (selectedRoute) {
                socket.emit('leave_route', selectedRoute._id);
            }
            socket.off('driver_location');
        };
    }, [socket, isConnected, selectedRoute]);

    return (
        <div className="h-full w-full relative">
            <div className="absolute top-4 left-4 z-[1000] bg-white p-2 rounded shadow">
                <select
                    onChange={(e) => {
                        const route = routes.find(r => r._id === e.target.value);
                        setSelectedRoute(route);
                    }}
                    className="p-1 border rounded"
                >
                    {routes.map(r => (
                        <option key={r._id} value={r._id}>{r.name}</option>
                    ))}
                </select>
                <div className="text-xs mt-1">
                    {isConnected ? <span className="text-green-500">● Live</span> : <span className="text-red-500">● Connecting...</span>}
                </div>
            </div>

            <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    attribution='&copy; Google Maps'
                />

                {/* Pickup / Dropoff Location Marker */}
                <Marker position={position}>
                    <Popup>Morning Pickup / Afternoon Drop</Popup>
                </Marker>

                {/* Second Stop Marker */}
                <Marker position={[18.61419, 73.91192]}>
                    <Popup>Second Stop</Popup>
                </Marker>

                {/* College Location Marker */}
                <Marker position={[18.621845, 73.912615]}>
                    <Popup>College (Morning Drop / Afternoon Pick)</Popup>
                </Marker>

                {/* Route Path (Polyline) */}
                <Polyline
                    positions={[
                        [18.611693, 73.911511], [18.612021, 73.911545], [18.612298, 73.911583], [18.612512, 73.911624],
                        [18.612807, 73.91168], [18.613083, 73.911746], [18.613358, 73.911812], [18.613496, 73.911843],
                        [18.61415, 73.91196], [18.614188, 73.911962], [18.614428, 73.911975], [18.614752, 73.911978],
                        [18.615016, 73.911559], [18.615336, 73.910921], [18.615364, 73.910863], [18.615436, 73.910703],
                        [18.61551, 73.910522], [18.615603, 73.910275], [18.615692, 73.910023], [18.615705, 73.909993],
                        [18.61574, 73.909955], [18.615773, 73.909952], [18.616803, 73.910232], [18.61755, 73.910411],
                        [18.61822, 73.910613], [18.618762, 73.910776], [18.618885, 73.910813], [18.618953, 73.91083],
                        [18.61899, 73.910853], [18.619014, 73.910892],

                        [18.618991, 73.910859], // Start
                        [18.619513, 73.912209], // Turn Right & Straight
                        [18.620047, 73.912007], // Turn Left & Straight
                        [18.619549, 73.910765], // Turn Left & Straight
                        [18.620781, 73.910187], // Straight to Circle Start
                        [18.621178, 73.911109], // Circle Point 1
                        [18.621405, 73.911227], // Circle Apex (Middle)
                        [18.621393, 73.911514], // Circle Point 2
                        [18.621845, 73.912615]  // Final Destination
                    ]}
                    pathOptions={{ color: '#4285F4', weight: 6, opacity: 0.6 }}
                />

                {busLocation && (
                    <Marker
                        position={busLocation.position}
                        icon={L.divIcon({
                            className: 'bus-icon',
                            html: `
                               <div style="transform: rotate(${busLocation.heading || 0}deg); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
                                   <svg viewBox="0 0 24 24" fill="#4285F4" stroke="white" stroke-width="2" style="width: 100%; height: 100%; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.3));">
                                       <path d="M12 2L2 22L12 18L22 22L12 2Z" />
                                   </svg>
                               </div>
                           `,
                            iconSize: [40, 40],
                            iconAnchor: [20, 20]
                        })}
                    >
                        <Popup>Shuttle Bus</Popup>
                    </Marker>
                )}

                {selectedRoute && selectedRoute.stops.map((stop, idx) => (
                    <Marker key={idx} position={[stop.lat, stop.lng]}>
                        <Popup>{stop.name}</Popup>
                    </Marker>
                ))}

                {/* Visualizing Stop Radius (Geofence) */}
                {selectedRoute && selectedRoute.stops.map((stop, idx) => (
                    <Circle
                        key={`circle-${idx}`}
                        center={[stop.lat, stop.lng]}
                        radius={stop.arrivalRadius || 50}
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.1, weight: 1 }}
                    />
                ))}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
