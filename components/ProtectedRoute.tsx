import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireInstructor?: boolean;
  requireStudent?: boolean;
}

export function ProtectedRoute({ children, requireInstructor = false, requireStudent = false }: ProtectedRouteProps) {
  const { isAuthenticated, isInstructor, user, authLoading } = useAuth();

  if (authLoading) {
    return <div className="p-6 text-slate-600">Restoring session...</div>;
  }

  // For student-only routes: allow non-authenticated users, students, and instructors
  if (requireStudent) {
    if (isAuthenticated && user?.role === 'admin') {
      return <Navigate to="/instructor/dashboard" replace />;
    }
    // Allow non-authenticated users and students to proceed
    return <>{children}</>;
  }

  // For general protected routes (not student-specific)
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireInstructor && !isInstructor) {
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
}
