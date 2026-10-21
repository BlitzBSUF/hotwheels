import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import esES from 'antd/locale/es_ES';
import App from './App.jsx';
import './index.css';
import { CartProvider } from './cart/CartContext';
import { AuthProvider } from './auth/AuthContext';

const theme = {
  token: {
    colorPrimary: '#C94F00',   // naranja oscuro: el texto blanco se lee bien
    colorInfo: '#1747C9',
    borderRadius: 10,
    fontFamily: "'Barlow', system-ui, sans-serif",
  },
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider locale={esES} theme={theme}>
      <BrowserRouter>
          <AuthProvider>
              <CartProvider>
                <App />
              </CartProvider>
          </AuthProvider>
      </BrowserRouter>
    </ConfigProvider>
  </StrictMode>
);