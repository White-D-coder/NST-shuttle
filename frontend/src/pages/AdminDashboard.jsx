import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [routes, setRoutes] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('routes'); // 'routes' or 'users'

    // Route creation state
    const [newRoute, setNewRoute] = useState({ name: '', stops: [] });
    const [stopInput, setStopInput] = useState({ name: '', lat: '', lng: '' });

    useEffect(() => {
        fetchRoutes();
        fetchUsers();
    }, []);

    const fetchRoutes = async () => {
        try {
            const res = await api.get('/routes');
            setRoutes(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/auth/users');
            setUsers(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const addStop = () => {
        if (!stopInput.name || !stopInput.lat || !stopInput.lng) return;
        setNewRoute(prev => ({
            ...prev,
            stops: [...prev.stops, { ...stopInput, lat: parseFloat(stopInput.lat), lng: parseFloat(stopInput.lng) }]
        }));
        setStopInput({ name: '', lat: '', lng: '' });
    };

    const createRoute = async () => {
        try {
            await api.post('/routes', newRoute);
            setNewRoute({ name: '', stops: [] });
            fetchRoutes();
            alert('Route Created!');
        } catch (err) {
            console.error(err);
            alert('Failed to create route');
        }
    };

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab('routes')}
                        className={`px-4 py-2 rounded ${activeTab === 'routes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Routes & Stops
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-4 py-2 rounded ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Users
                    </button>
                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">Logout</button>
                </div>
            </div>

            {activeTab === 'routes' ? (
                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Create Route Section */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Create New Route</h2>

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Route Name</label>
                            <input
                                className="w-full p-2 border rounded"
                                placeholder="e.g. Morning Express"
                                value={newRoute.name}
                                onChange={e => setNewRoute({ ...newRoute, name: e.target.value })}
                            />
                        </div>

                        <div className="bg-gray-50 p-4 rounded mb-4">
                            <h3 className="font-bold text-sm mb-2 text-gray-600">Add Stop</h3>
                            <div className="grid grid-cols-3 gap-2 mb-2">
                                <input
                                    className="p-2 border rounded text-sm"
                                    placeholder="Stop Name"
                                    value={stopInput.name}
                                    onChange={e => setStopInput({ ...stopInput, name: e.target.value })}
                                />
                                <input
                                    className="p-2 border rounded text-sm"
                                    placeholder="Lat"
                                    value={stopInput.lat}
                                    type="number"
                                    onChange={e => setStopInput({ ...stopInput, lat: e.target.value })}
                                />
                                <input
                                    className="p-2 border rounded text-sm"
                                    placeholder="Lng"
                                    value={stopInput.lng}
                                    type="number"
                                    onChange={e => setStopInput({ ...stopInput, lng: e.target.value })}
                                />
                            </div>
                            <button onClick={addStop} className="bg-blue-500 text-white px-3 py-1 rounded text-sm w-full">Add Stop</button>
                        </div>

                        {newRoute.stops.length > 0 && (
                            <div className="mb-4">
                                <h4 className="font-bold text-sm mb-2">Stops Preview:</h4>
                                <ul className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-40 overflow-auto">
                                    {newRoute.stops.map((s, i) => (
                                        <li key={i} className="flex justify-between border-b py-1">
                                            <span>{i + 1}. {s.name}</span>
                                            <span>{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            onClick={createRoute}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded font-bold shadow"
                            disabled={!newRoute.name || newRoute.stops.length === 0}
                        >
                            Save Route
                        </button>
                    </div>

                    {/* Existing Routes List */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-bold mb-4 border-b pb-2">Existing Routes</h2>
                        <div className="space-y-4 max-h-[500px] overflow-auto">
                            {routes.map(route => (
                                <div key={route._id} className="border p-4 rounded hover:bg-gray-50">
                                    <h3 className="font-bold text-lg">{route.name}</h3>
                                    <p className="text-sm text-gray-500">{route.stops.length} stops</p>
                                    <div className="mt-2 text-xs text-gray-400">
                                        Stops: {route.stops.map(s => s.name).join(' → ')}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                /* Users Tab */
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">Registered Users</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <div className="flex items-center">
                                                <div className="ml-3">
                                                    <p className="text-gray-900 whitespace-no-wrap font-bold">{u.name}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <span className={`relative inline-block px-3 py-1 font-semibold leading-tight 
                                                ${u.role === 'admin' ? 'text-purple-900' : u.role === 'driver' ? 'text-orange-900' : 'text-green-900'}`}>
                                                <span aria-hidden className={`absolute inset-0 opacity-50 rounded-full 
                                                    ${u.role === 'admin' ? 'bg-purple-200' : u.role === 'driver' ? 'bg-orange-200' : 'bg-green-200'}`}></span>
                                                <span className="relative uppercase text-xs">{u.role}</span>
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{u.email || '-'}</p>
                                        </td>
                                        <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                            <p className="text-gray-900 whitespace-no-wrap">{new Date(u.createdAt).toLocaleDateString()}</p>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
