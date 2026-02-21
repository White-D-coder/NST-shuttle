import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import useSocket from '../hooks/useSocket';
import api from '../services/api';
import {
    MapPin,
    Users,
    Navigation,
    LogOut,
    AlertTriangle,
    CheckCircle2,
    Activity,
    Radio,
    BusFront,
    BellRing
} from 'lucide-react';

const DriverDashboard = () => {
    const { user, logout } = useAuth();
    const { socket, isConnected } = useSocket('driver');
    const [routes, setRoutes] = useState([]);
    const [selectedRouteId, setSelectedRouteId] = useState('');
    const [stopCounts, setStopCounts] = useState({});
    const [alertData, setAlertData] = useState(null);
    const [isTracking, setIsTracking] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Select a route and start your trip.');

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const res = await api.get('/routes');
                setRoutes(res.data);
                if (res.data.length > 0) {
                    setSelectedRouteId(res.data[0]._id);
                }
            } catch (err) {
                console.error("Failed to fetch routes", err);
            }
        };
        fetchRoutes();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('stop_counts_update', (counts) => {
            console.log('Received counts:', counts);
            setStopCounts(counts);
        });

        socket.on('hotspot_alert', (data) => {
            if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
            setAlertData(data);
        });

        return () => {
            socket.off('stop_counts_update');
            socket.off('hotspot_alert');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket || !isTracking || !selectedRouteId) return;

        const geoId = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude, heading, speed } = pos.coords;
                setStatusMessage('GPS Active & Broadcasting Location');
                socket.emit('driver_location_update', {
                    routeId: selectedRouteId,
                    lat: latitude,
                    lng: longitude,
                    heading: heading || 0,
                    speed: speed || 0
                });
            },
            (err) => {
                console.error('Driver Location Error:', err);
                setStatusMessage(`GPS Error: ${err.message}`);
                setIsTracking(false);
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );

        return () => {
            navigator.geolocation.clearWatch(geoId);
            setStatusMessage('Trip paused or stopped.');
        };
    }, [socket, isTracking, selectedRouteId]);

    const startTrip = () => {
        if (!selectedRouteId) return;
        setIsTracking(true);
        setStatusMessage('Acquiring GPS signal...');
        if (socket) {
            socket.emit('start_trip', { routeId: selectedRouteId });
        }
    };

    const endTrip = () => {
        setIsTracking(false);
        setStatusMessage('Trip ended.');
        if (socket) {
            socket.emit('end_trip', { routeId: selectedRouteId });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8 relative">

                {/* Hotspot Alert Modal */}
                {alertData && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                        <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full border-t-8 border-red-500 transform transition-all">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-red-100 rounded-full animate-bounce">
                                    <BellRing className="w-8 h-8 text-red-600" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-800 tracking-tight">HOTSPOT ALERT</h3>
                            </div>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                <strong className="text-slate-800">{alertData.stopName}</strong> requires attention. There are <strong className="text-red-600 text-xl px-2 py-1 bg-red-50 rounded-md">{alertData.count}</strong> students waiting!
                            </p>
                            <button
                                onClick={() => setAlertData(null)}
                                className="w-full bg-slate-900 text-white py-4 rounded-xl hover:bg-slate-800 font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex justify-center items-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                ACKNOWLEDGE
                            </button>
                        </div>
                    </div>
                )}

                {/* Header Section */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100 gap-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-inner shadow-blue-500/20">
                            <BusFront className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Driver Control</h1>
                            <p className="text-slate-500 font-medium flex items-center gap-2 mt-1">
                                Hello, {user?.name}
                                {user?.isVerified && (
                                    <span className="inline-flex items-center justify-center p-1 bg-blue-50 text-blue-600 rounded-full" title="Verified Driver">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </span>
                                )}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors ${isConnected ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                            <Radio className={`w-4 h-4 ${isConnected ? 'animate-pulse' : ''}`} />
                            {isConnected ? 'System Online' : 'Offline'}
                        </div>
                        <button
                            onClick={logout}
                            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow active:scale-[0.98] flex items-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Sign Out</span>
                        </button>
                    </div>
                </header>

                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Control Panel */}
                    <div className="lg:col-span-5 space-y-8">
                        {/* Trip Controls Card */}
                        <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>

                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                                <Navigation className="w-5 h-5 text-blue-600" />
                                Operations
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-600 mb-2">Assigned Route</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <select
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                                            value={selectedRouteId}
                                            onChange={(e) => setSelectedRouteId(e.target.value)}
                                            disabled={isTracking}
                                        >
                                            <option value="" disabled>Select a route to start</option>
                                            {routes.map(r => (
                                                <option key={r._id} value={r._id}>{r.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    {!isTracking ? (
                                        <button
                                            onClick={startTrip}
                                            disabled={!selectedRouteId || !isConnected}
                                            className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] flex justify-center items-center gap-2 group"
                                        >
                                            <Navigation className="w-5 h-5 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                                            Commence Route
                                        </button>
                                    ) : (
                                        <button
                                            onClick={endTrip}
                                            className="w-full bg-red-500 hover:bg-red-600 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-red-500/30 hover:shadow-xl active:scale-[0.98] flex justify-center items-center gap-2 relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-red-600/20 w-full animate-pulse"></div>
                                            <AlertTriangle className="w-5 h-5 relative z-10" />
                                            <span className="relative z-10">End Operations</span>
                                        </button>
                                    )}
                                </div>

                                {/* Status Indication */}
                                <div className={`p-4 rounded-xl flex items-start gap-3 transition-colors ${isTracking ? 'bg-blue-50 border border-blue-100' : 'bg-slate-50 border border-slate-100'}`}>
                                    <Activity className={`w-5 h-5 mt-0.5 ${isTracking ? 'text-blue-600 animate-pulse' : 'text-slate-400'}`} />
                                    <div>
                                        <p className={`font-semibold text-sm ${isTracking ? 'text-blue-800' : 'text-slate-600'}`}>
                                            System Status
                                        </p>
                                        <p className={`text-sm mt-0.5 ${isTracking ? 'text-blue-600/80' : 'text-slate-500'}`}>
                                            {statusMessage}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Route Details Panel */}
                    <div className="lg:col-span-7">
                        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/40 border border-slate-100 h-full overflow-hidden flex flex-col">
                            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Users className="w-5 h-5 text-indigo-500" />
                                    Live Passenger Demand
                                </h2>
                                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Real-time
                                </span>
                            </div>

                            <div className="p-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                                {selectedRouteId ? (
                                    <div className="space-y-3">
                                        {routes.find(r => r._id === selectedRouteId)?.stops?.map((stop, idx) => {
                                            const count = stopCounts[stop._id] || stopCounts[stop.stopId] || 0;
                                            const isHotspot = count > 5;
                                            const hasWaiters = count > 0;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`group flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${isHotspot
                                                        ? 'bg-rose-50 border-rose-200 shadow-sm'
                                                        : hasWaiters
                                                            ? 'bg-white border-blue-100 shadow-sm hover:border-blue-200 hover:shadow-md'
                                                            : 'bg-slate-50/50 border-slate-100 opacity-70 hover:opacity-100'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${isHotspot ? 'bg-rose-200 text-rose-800' : hasWaiters ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                                                            }`}>
                                                            {idx + 1}
                                                        </div>
                                                        <div>
                                                            <h4 className={`font-bold ${isHotspot ? 'text-rose-900' : 'text-slate-800'}`}>
                                                                {stop.name}
                                                            </h4>
                                                            {isHotspot && (
                                                                <p className="text-xs font-semibold text-rose-600 flex items-center gap-1 mt-0.5">
                                                                    <AlertTriangle className="w-3 h-3" /> Area congested
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isHotspot
                                                        ? 'bg-white border-rose-200 text-rose-700'
                                                        : hasWaiters
                                                            ? 'bg-blue-50 border-transparent text-blue-700'
                                                            : 'bg-slate-100 border-transparent text-slate-500'
                                                        }`}>
                                                        <Users className={`w-4 h-4 ${isHotspot ? 'animate-pulse' : ''}`} />
                                                        <span className="font-bold text-lg">{count}</span>
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {(!routes.find(r => r._id === selectedRouteId)?.stops || routes.find(r => r._id === selectedRouteId).stops.length === 0) && (
                                            <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                                                <MapPin className="w-12 h-12 text-slate-300 mb-3" />
                                                <p>This route has no stops configured.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 py-16">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                            <Navigation className="w-10 h-10 text-slate-300" />
                                        </div>
                                        <p className="text-lg font-medium text-slate-500">No Route Selected</p>
                                        <p className="text-sm mt-1 max-w-[250px] text-center">Please select an assigned route from the control panel to view live demand.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
