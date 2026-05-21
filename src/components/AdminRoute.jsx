import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from 'lucide-react';

export default function AdminRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-cosmic-900 flex items-center justify-center">
        <Loader className="animate-spin text-gold-400" size={32} />
      </div>
    );
  }

  // If not logged in, or not an admin, redirect to login
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
