import { useEffect, useState } from 'react';
import api from '../api/client';

function Auto() {
  return (
    <svg className="hw-car" viewBox="0 0 120 44" aria-hidden="true">
      <path
        d="M4 32 L8 24 Q10 21 16 20 L34 17 Q42 8 56 8 L74 8 Q86 9 94 19 L108 21 Q116 23 116 30 L116 34 L4 34 Z"
        fill="#1747C9"
      />
      <path d="M40 18 Q46 11 56 11 L62 11 L62 18 Z M67 11 L74 11 Q82 12 88 18 L67 18 Z" fill="#cfe0ff" />
      <circle cx="32" cy="34" r="9" fill="#1B1917" />
      <circle cx="32" cy="34" r="4" fill="#c5ccd6" />
      <circle cx="92" cy="34" r="9" fill="#1B1917" />
      <circle cx="92" cy="34" r="4" fill="#c5ccd6" />
    </svg>
  );
}

export default function Hero() {
  const [n, setN] = useState(null);

  useEffect(() => {
    api
      .get('/hot-wheels/', { params: { en_stock: true } })
      .then(({ data }) => setN(data.count))
      .catch(() => {});
  }, []);

  return (
    <section className="hw-hero">
      <div className="hw-hero-inner">
        <h1>Variedad de HotWheels</h1>
        <p>
          {n !== null && `Hoy hay ${n} ${n === 1 ? 'modelo' : 'modelos'} en stock. `}
          Elige los tuyos y arma tu carrito.
        </p>
      </div>
      <div className="hw-track">
        <Auto />
      </div>
    </section>
  );
}