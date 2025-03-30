import { RootState } from '@/redux/store';
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

interface PublicUserRouteProps {
  children: React.ReactNode;
}

export function PublicUserRoute({ children }: PublicUserRouteProps) {
  const userData = useSelector((state: RootState) => {
    return state?.user?.userDatas;
  });

  if (userData?.role === 'tutor') {
    return <Navigate to={`/${userData.role}/home`} />;
  } else if (userData?.role === 'user') {
    return <Navigate to={'/'} />;
  }

  return children;
}
