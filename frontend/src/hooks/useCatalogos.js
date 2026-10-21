import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';

export default function useCatalogos() {
  const [cat, setCat] = useState({
    lineas: [], series: [], marcas: [], modelos: [], colores: [], tipos: [],
  });

  const cargar = useCallback(async () => {
    const [l, s, ma, mo, c, t] = await Promise.all([
      api.get('/lineas/'),
      api.get('/series/'),
      api.get('/marcas/'),
      api.get('/modelos/'),
      api.get('/colores/'),
      api.get('/tipos/'),
    ]);
    setCat({
      lineas: l.data, series: s.data, marcas: ma.data,
      modelos: mo.data, colores: c.data, tipos: t.data,
    });
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  return { ...cat, recargar: cargar };
}