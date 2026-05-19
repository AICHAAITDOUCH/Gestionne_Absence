import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

const AuthLayout = () => {
  const { user, isLoading, fetchUser } = useAuthStore();

  React.useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background">Chargement...</div>;

  if (user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'formateur') return <Navigate to="/formateur" replace />;
    return <Navigate to="/stagiaire" replace />;
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex items-center justify-center p-8 bg-background">
        <Outlet />
      </div>
      <div className="hidden md:flex flex-col justify-center p-12 bg-primary text-primary-foreground">
        <h1 className="text-4xl font-bold mb-6 tracking-tight">Gérez les absences avec élégance.</h1>
        <p className="text-xl text-primary-foreground/80 max-w-md">
          SmartAbsence SaaS simplifie le suivi de la présence pour les établissements de formation avec une interface moderne et intuitive.
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
