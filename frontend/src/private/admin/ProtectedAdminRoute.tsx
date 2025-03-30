import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import React from 'react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const adminData = useSelector((state: RootState) => {
    return state?.admin?.adminDatas;
  });

  if (!adminData) {
    return <Navigate to={'/admin/login'} />;
  }
  return children;
}
