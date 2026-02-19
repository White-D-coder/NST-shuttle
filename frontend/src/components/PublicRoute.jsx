import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    if (user) {
        if (user.role === 'admin') return <Navigate to="/admin" />;
        if (user.role === 'driver') return <Navigate to="/driver-dashboard" />;
        return <Navigate to="/home" />;
    }

    return children;
};

export default PublicRoute;
