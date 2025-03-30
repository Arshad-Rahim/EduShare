import { RootState } from '@/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface ProtectedUserRouteProps {
  children: React.ReactNode;
}

export function ProtectedUserRoute({ children }: ProtectedUserRouteProps) {
  const userData = useSelector((state: RootState) => {
    return state?.user?.userDatas;
  });

  if (!userData) {
    return <Navigate to={'/auth'} />;
  }
  return children;
}
