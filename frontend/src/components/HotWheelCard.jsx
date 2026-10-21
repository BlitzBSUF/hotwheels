import { Button } from 'antd';
import { ShoppingCartOutlined } from '@ant-design/icons';
import { useCart } from '../cart/CartContext';

export default function HotWheelCard({ hw, onOpen }) {
  const { agregar, items } = useCart();
  const enCarrito = items.find((i) => i.id === hw.id)?.cantidad || 0;
  const agotado = hw.cantidad === 0;
  const lleno = enCarrito >= hw.cantidad;
  const premium = /premium/i.test(hw.linea_nombre || '');
  const pocas = !agotado && hw.cantidad <= 3;

  const textoStock = agotado
    ? 'Sin stock por ahora'
    : pocas
    ? `Quedan ${hw.cantidad}`
    : `${hw.cantidad} disponibles`;

  return (
    <article className={`hw-card${premium ? ' is-premium' : ''}${agotado ? ' is-out' : ''}`}>
      <div className="hw-card-head">
        <span>{hw.serie_nombre}</span>
        <span>{hw.anio}</span>
      </div>

      <button
        type="button"
        className="hw-card-visual"
        onClick={() => onOpen(hw)}
        aria-label={`Ver detalle de ${hw.marca_nombre} ${hw.modelo_nombre}`}
      >
        <span className="hw-bubble">
          {hw.imagen ? (
            <img src={hw.imagen} alt={`${hw.marca_nombre} ${hw.modelo_nombre}`} loading="lazy" />
          ) : (
            <span className="hw-noimg">Sin foto</span>
          )}
        </span>
        {agotado && <span className="hw-sold">Agotado</span>}
      </button>

      <div className="hw-card-body">
        <h3>{hw.marca_nombre} {hw.modelo_nombre}</h3>
        <div>
          <span className="hw-chip">{hw.color_nombre}</span>
          <span className="hw-chip">{hw.tipo_nombre}</span>
          <span className="hw-chip">Nº {hw.numero}</span>
        </div>

        <div className="hw-card-foot">
          <div>
            <span className="hw-price">Bs. {Number(hw.precio_venta).toFixed(2)}</span>
            {enCarrito > 0 && <span className="hw-incart">Ya llevas {enCarrito}</span>}
          </div>
          <p className={`hw-stock${pocas ? ' low' : ''}`}>{textoStock}</p>
          <Button
            type="primary"
            block
            icon={<ShoppingCartOutlined />}
            disabled={agotado || lleno}
            onClick={() => agregar(hw)}
          >
            {agotado ? 'Agotado' : lleno ? 'En tu carrito' : 'Agregar'}
          </Button>
        </div>
      </div>
    </article>
  );
}