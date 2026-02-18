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
            <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow flex flex-col items-end gap-2">
                <div className="text-right">
                    <p className="font-bold">{user.name}</p>
                    <button onClick={logout} className="text-red-500 text-sm hover:underline">Logout</button>
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
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />

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
