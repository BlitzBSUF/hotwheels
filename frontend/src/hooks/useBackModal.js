import { useCallback, useEffect, useState } from 'react';

export default function useBackModal(inicial = null) {
  const [valor, setValor] = useState(inicial);

  // el botón "atrás" cierra la ventana
  useEffect(() => {
    const onPop = () => setValor(inicial);
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [inicial]);

  const abrir = useCallback((v = true) => {
    if (!window.history.state?.hwModal) {
      window.history.pushState({ hwModal: true }, '');
    }
    setValor(v);
  }, []);

  const cerrar = useCallback(() => {
    if (window.history.state?.hwModal) window.history.back();  // dispara onPop
    else setValor(inicial);
  }, [inicial]);

  return [valor, abrir, cerrar];
}