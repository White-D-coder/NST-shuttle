import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import HistoryPage from './pages/HistoryPage';
import PrivateRoute from './components/PrivateRoute';
import MapComponent from './components/MapComponent';

import PublicRoute from './components/PublicRoute';

const ButtonLink = ({ to, children }) => (
    <Link to={to} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs py-1 px-2 rounded border border-gray-300">
        {children}
    </Link>
);

const Home = () => {
    const { user, logout } = useAuth();

    if (!user) return <Navigate to="/login" />;

    // If driver, go to driver dashboard
    if (user.role === 'driver') return <Navigate to="/driver-dashboard" />;
    if (user.role === 'admin') return <Navigate to="/admin" />;

    return (
        <div className="relative h-screen w-full">
            <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow flex flex-col items-end gap-2 max-w-[45%] md:max-w-xs">
                <div className="text-right">
                    <p className="font-bold flex items-center justify-end gap-1 text-sm md:text-base truncate">
                        {user.name}
                        {user.isVerified && (
                            <span className="text-blue-500" title="Verified Student">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                                </svg>
                            </span>
                        )}
                    </p>
                    <button onClick={logout} className="text-red-500 text-xs md:text-sm hover:underline">Logout</button>
                </div>
                <ButtonLink to="/history">View Bus History</ButtonLink>
            </div>
            {/* User View of Map */}
            <div className="h-full w-full">
                <MapComponent />
            </div>
        </div>
    );
};



function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/" element={
                        <PublicRoute>
                            <LandingPage />
                        </PublicRoute>
                    } />
                    <Route path="/login" element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } />
                    <Route path="/signup" element={
                        <PublicRoute>
                            <Signup />
                        </PublicRoute>
                    } />

                    <Route path="/driver-dashboard" element={
                        <PrivateRoute roles={['driver']}>
                            <DriverDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/history" element={
                        <PrivateRoute roles={['admin', 'driver', 'user']}>
                            <HistoryPage />
                        </PrivateRoute>
                    } />

                    <Route path="/admin" element={
                        <PrivateRoute roles={['admin']}>
                            <AdminDashboard />
                        </PrivateRoute>
                    } />

                    <Route path="/home" element={
                        <PrivateRoute roles={['user', 'driver', 'admin']}>
                            <Home />
                        </PrivateRoute>
                    } />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
