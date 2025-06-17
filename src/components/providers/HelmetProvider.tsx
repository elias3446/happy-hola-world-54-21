
import React from 'react';
import { HelmetProvider as ReactHelmetProvider } from 'react-helmet-async';

interface HelmetProviderProps {
  children: React.ReactNode;
}

export const HelmetProvider = ({ children }: HelmetProviderProps) => {
  return (
    <ReactHelmetProvider>
      {children}
    </ReactHelmetProvider>
  );
};
