import React from 'react';
import { QueryClient } from 'react-query';
import { RouterProvider } from 'react-router-dom';
import { router } from '@/router/router';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { HelmetProvider } from '@/components/providers/HelmetProvider';

function App() {
  return (
    <HelmetProvider>
      <QueryClient>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClient>
    </HelmetProvider>
  );
}

export default App;
