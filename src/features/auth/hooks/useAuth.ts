import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { setCredentials, logout as logoutAction, setLoading, setError } from '../store/authSlice';
import { authApi } from '../utils/authApi';
import { LoginCredentials, RegisterData, UserRole } from '@/shared/types';
import { ROUTES } from '@/shared/constants';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      try {
        dispatch(setLoading(true));
        const data = await authApi.login(credentials);
        dispatch(setCredentials(data));
        
        // Redirect based on role
        if (data.user.role === UserRole.ADMIN) {
          navigate(ROUTES.ADMIN.USERS);
        } else {
          navigate(ROUTES.CHAT);
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Login failed';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (data: RegisterData) => {
      try {
        dispatch(setLoading(true));
        const result = await authApi.register(data);
        dispatch(setCredentials(result));
        navigate(ROUTES.CHAT);
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed';
        dispatch(setError(message));
        throw err;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      dispatch(logoutAction());
      navigate(ROUTES.LOGIN);
    }
  }, [dispatch, navigate]);

  const isAdmin = useCallback(() => {
    return user?.role === UserRole.ADMIN;
  }, [user]);

  const isMember = useCallback(() => {
    return user?.role === UserRole.MEMBER;
  }, [user]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    isAdmin,
    isMember,
  };
};