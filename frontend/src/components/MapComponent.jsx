import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
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

    // Student Location Tracking
    useEffect(() => {
        if (!socket || !isConnected) return;

        const geoId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                // Emit location to server for counting
                socket.emit('student_location_update', {
                    lat: latitude,
                    lng: longitude
                });
                console.log('Sent Location:', latitude, longitude);
            },
            (err) => console.error('Location Error:', err),
            { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
        );

        return () => navigator.geolocation.clearWatch(geoId);
    }, [socket, isConnected]);

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

                {/* Polyline would go here based on route coordinates */}
            </MapContainer>
        </div>
    );
};

export default MapComponent;
