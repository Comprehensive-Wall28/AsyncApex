import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

type ManagerRouteProps = {
  children: React.ReactNode;
};

export default function ManagerRoute({ children }: ManagerRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user?.role !== 'manager') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
