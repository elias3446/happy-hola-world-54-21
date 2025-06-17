
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/router';
import { Toaster } from '@/components/ui/toaster';
import { HelmetProvider } from '@/components/providers/HelmetProvider';

const queryClient = new QueryClient();

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
