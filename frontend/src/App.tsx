import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './lib/auth';
import { CarritoProvider } from './lib/carrito';
import { router } from './router';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CarritoProvider>
          <RouterProvider router={router} />
        </CarritoProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
