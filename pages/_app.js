import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { CarrinhoProvider } from '../contexts/CarrinhoContext';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <Component {...pageProps} />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              icon: '✅',
              style: {
                background: '#22c55e',
                color: '#fff',
              },
            },
            error: {
              icon: '❌',
              style: {
                background: '#ef4444',
                color: '#fff',
              },
            },
          }}
        />
      </CarrinhoProvider>
    </AuthProvider>
  );
}

export default MyApp;
