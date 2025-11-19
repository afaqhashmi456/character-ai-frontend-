import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '@/shared/types';
import { ROUTES } from '@/shared/constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth();

  // Not authenticated - redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  // No role requirement - allow access
  if (!requiredRole) {
    return <>{children}</>;
  }

  // Check if user has required role
  if (user.role === requiredRole) {
    return <>{children}</>;
  }

  // User doesn't have required role - redirect based on their actual role
  if (user.role === UserRole.ADMIN) {
    return <Navigate to={ROUTES.ADMIN.USERS} replace />;
  }
  
  return <Navigate to={ROUTES.CHAT} replace />;
};