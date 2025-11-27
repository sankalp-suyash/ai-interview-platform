import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children }) => {

  const { isAuthenticated, loading } = useAuth();
  console.log('Protected route - loading: ', loading, 'isAuthenticated: ', isAuthenticated);

  if (loading) {
    // Show loading spinner while checking auth status
    console.log("🛡 ProtectedRoute - Still loading, showing spinner");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("🛡 ProtectedRoute - Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />
  }

  console.log("🛡 ProtectedRoute - Authenticated, rendering content");

  // Return just Outlet for nested routes
  return <Outlet />;


};


export default ProtectedRoute;