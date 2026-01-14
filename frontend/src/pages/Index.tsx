import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Auth from './Auth';
import Workspaces from './Workspaces';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center animate-pulse">
          <span className="text-primary-foreground font-bold text-lg">PM</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth />;
  }

  return <Workspaces />;
};

export default Index;
