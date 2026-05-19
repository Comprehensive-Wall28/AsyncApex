import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api';

export interface AuthUser {
  userId: string;
  email: string;
  name: string;
  role: 'manager' | 'employee';
  teamId?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('idToken');

        if (!token) {
          setUser(null);
          return;
        }

        const decoded: any = jwtDecode(token);

        const dbUser = await api.users.getMe() as AuthUser;

        setUser({
          userId: dbUser.userId || decoded.sub,
          email: dbUser.email || decoded.email,
          name: dbUser.name || decoded.name || 'User',
          role: dbUser.role || decoded['custom:role'] || 'employee',
          teamId: dbUser.teamId,
        });
      } catch (error) {
        console.error('Failed to load auth user', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};