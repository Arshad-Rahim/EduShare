import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import React from 'react';

interface PublicAdminRouteProps {
  children: React.ReactNode; 
}

export function PublicAdminRoute({ children }: PublicAdminRouteProps) {
  const adminData = useSelector((state:RootState) => {
    return state?.admin?.adminDatas;
  });

  if (adminData) {
    return <Navigate to={'/admin/home'} />;
  }
  return children;
}

