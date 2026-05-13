import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

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
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('idToken');
        if (token) {
          const decoded: any = jwtDecode(token);

          setUser({
            userId: decoded.sub,
            email: decoded.email,
            name: decoded.name || 'User',
            role: decoded['custom:role'] || 'employee',
            teamId: decoded['custom:teamId'],
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to decode token', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading, isAuthenticated: !!user };
};
