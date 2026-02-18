import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import api from '../services/api';

const DriverDashboard = () => {
    const { user, logout } = useAuth();
    const { socket, isConnected } = useSocket('driver');
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [stopCounts, setStopCounts] = useState({});
    const [alertData, setAlertData] = useState(null);

    // ... (existing effects)

    useEffect(() => {
        if (!socket) return;

        socket.on('stop_counts_update', (counts) => {
            console.log('Received counts:', counts);
            setStopCounts(counts);
        });

        socket.on('hotspot_alert', (data) => {
            // Play sound or vibrate here if possible
            if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
            setAlertData(data);
        });

        return () => {
            socket.off('stop_counts_update');
            socket.off('hotspot_alert');
        };
    }, [socket]);

    return (
        <div className="p-6 max-w-4xl mx-auto relative">
            {/* Hotspot Alert Modal */}
            {alertData && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full border-l-8 border-red-600 animate-pulse">
                        <h3 className="text-2xl font-bold text-red-600 mb-2">🔥 HOTSPOT ALERT!</h3>
                        <p className="text-lg text-gray-700 mb-4">
                            <strong>{alertData.stopName}</strong> has <strong>{alertData.count}</strong> students waiting!
                        </p>
                        <button
                            onClick={() => setAlertData(null)}
                            className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 font-bold"
                        >
                            ACKNOWLEDGE
                        </button>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded shadow">
                {/* ... existing header ... */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Driver Dashboard</h1>
                    <p className="text-gray-600">Welcome, {user?.name}</p>
                </div>
                <button
                    onClick={logout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition"
                >
                    Logout
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* ... (existing trip controls) ... */}
                <div className="bg-white p-6 rounded shadow border-l-4 border-blue-500">
                    <h2 className="text-xl font-bold mb-4">Trip Controls</h2>

                    {/* ... (existing controls) ... */}
                    <div className="mb-4">
                        <label className="block text-gray-700 mb-2">Select Route</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedRouteId}
                            onChange={(e) => setSelectedRouteId(e.target.value)}
                            disabled={isTracking}
                        >
                            {routes.map(r => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-4">
                        {!isTracking ? (
                            <button
                                onClick={startTrip}
                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded font-bold transition shadow-md"
                            >
                                Start Trip
                            </button>
                        ) : (
                            <button
                                onClick={endTrip}
                                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-3 rounded font-bold transition shadow-md"
                            >
                                End Trip
                            </button>
                        )}
                    </div>

                    <div className="mt-4 p-3 bg-gray-100 rounded text-center">
                        <p className={`font-mono text-sm ${isTracking ? 'text-green-600' : 'text-gray-500'}`}>
                            {statusMessage || 'Ready to start'}
                        </p>
                        <div className="text-xs text-gray-400 mt-1">
                            Socket: {isConnected ? 'Connected' : 'Disconnected'}
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded shadow">
                    <h2 className="text-xl font-bold mb-4">Route Info & Passengers</h2>
                    {selectedRouteId && (
                        <div>
                            {routes.find(r => r._id === selectedRouteId)?.stops.map((stop, idx) => {
                                // Match stop by ID or Name (since we are using seeded stops which might match by name for now)
                                // In a real scenario, route stops should link to Stop IDs.
                                // For now, let's try to match by ID if available, or fall back (our seed data for routes needs update to link to Stops)
                                // Assuming we passed Stop IDs or names mesh.
                                const count = stopCounts[stop._id] || stopCounts[stop.stopId] || 0;

                                return (
                                    <div key={idx} className="flex items-center justify-between mb-2 p-3 border-b last:border-0 bg-gray-50 rounded hover:bg-gray-100 transition">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-1 rounded-full">{idx + 1}</span>
                                            <span className="font-medium text-gray-700">{stop.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <span className={`text-sm font-bold px-2 py-1 rounded ${count > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                                {count} 👤
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
