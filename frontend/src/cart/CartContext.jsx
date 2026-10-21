import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'carrito';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  });

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(items)); } catch { /* sin storage */ }
  }, [items]);

  const agregar = (hw) =>
    setItems((prev) => {
      const existe = prev.find((i) => i.id === hw.id);
      if (existe) {
        return prev.map((i) =>
          i.id === hw.id
            ? { ...i, stock: hw.cantidad, precio: Number(hw.precio_venta),
                cantidad: Math.min(i.cantidad + 1, hw.cantidad) }
            : i
        );
      }
      return [
        ...prev,
        {
          id: hw.id,
          nombre: `${hw.marca_nombre} ${hw.modelo_nombre}`,
          detalle: `${hw.anio} · ${hw.serie_nombre} · #${hw.numero} · ${hw.color_nombre}`,
          imagen: hw.imagen,
          precio: Number(hw.precio_venta),
          stock: hw.cantidad,
          cantidad: 1,
        },
      ];
    });

  const cambiarCantidad = (id, cantidad) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, cantidad } : i)));

  const quitar = (id) => setItems((prev) => prev.filter((i) => i.id !== id));
  const vaciar = () => setItems([]);

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const count = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, agregar, cambiarCantidad, quitar, vaciar, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);