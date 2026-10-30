import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Badge, Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from './cart/CartContext';
import CartDrawer from './components/CartDrawer';
import Hero from './components/Hero';
import Catalogo from './pages/Catalogo';
import Login from './pages/Login';
import AdminHome from './pages/AdminHome';
import ProtectedRoute from './auth/ProtectedRoute';
import useBackModal from './hooks/useBackModal';
export default function App() {
  const { count } = useCart();
  const [cartOpen, abrirCarrito, cerrarCarrito] = useBackModal(false);
  const { pathname } = useLocation();
  const esCatalogo = pathname === '/';
  const esAdmin = pathname.startsWith('/admin');

  return (
    <div className={esCatalogo ? 'hw-page hw-peg' : 'hw-page'}>
      <header className="hw-topbar">
        <div className="hw-topbar-inner">
          <Link to="/" className="hw-brand">Hot Wheels LP</Link>
          {!esAdmin && (
            <Badge count={count} color="#F26A0E" offset={[-4, 4]}>
              <Button
                shape="circle"
                size="large"
                icon={<ShoppingCartOutlined />}
                aria-label="Abrir carrito"
                onClick={() => abrirCarrito(true)}
              />
            </Badge>
          )}
        </div>
      </header>

      {esCatalogo && <Hero />}

      <main className="hw-main">
        <Routes>
          <Route path="/" element={<Catalogo />} />
          <Route path="/admin/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminHome />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      <CartDrawer open={cartOpen} onClose={cerrarCarrito} />
    </div>
  );
}