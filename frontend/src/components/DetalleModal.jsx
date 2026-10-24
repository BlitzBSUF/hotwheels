import { Modal, Descriptions, Image, Button } from 'antd';
import { useCart } from '../cart/CartContext';
import { nombreHW } from '../utils/nombre';

export default function DetalleModal({ hw, onClose }) {
  const { agregar, items } = useCart();
  const enCarrito = items.find((i) => i.id === hw?.id)?.cantidad || 0;
  const agotado = hw?.cantidad === 0;
  const lleno = hw ? enCarrito >= hw.cantidad : false;

  const datos = hw
    ? [
        { key: 'anio', label: 'Año', children: hw.anio },
        { key: 'linea', label: 'Línea', children: hw.linea_nombre },
        { key: 'serie', label: 'Serie', children: hw.serie_nombre },
        { key: 'num', label: 'Número', children: hw.numero },
        { key: 'marca', label: 'Marca', children: hw.marca_nombre },
        { key: 'modelo', label: 'Modelo', children: hw.modelo_nombre },
        { key: 'color', label: 'Color', children: hw.color_nombre },
        { key: 'tipo', label: 'Tipo', children: hw.tipo_nombre },
        ...(hw.codigo_producto
          ? [{ key: 'cod', label: 'Código', children: hw.codigo_producto }]
          : []),
      ]
    : [];

  return (
    <Modal open={!!hw} onCancel={onClose} footer={null} width={760} centered>
      {hw && (
        <div className="hw-detail">
          <div className="hw-detail-img">
            {hw.imagen ? (
              <Image src={hw.imagen} alt={nombreHW(hw)} />
            ) : (
              <div className="hw-noimg" style={{ padding: 40, textAlign: 'center' }}>Sin foto</div>
            )}
          </div>

          <div>
            <h2 className="hw-detail-title">{nombreHW(hw)}</h2>
            <Descriptions column={1} size="small" colon={false} items={datos} />
            {hw.descripcion && <p style={{ marginTop: 10 }}>{hw.descripcion}</p>}

            <div className="hw-detail-buy">
              <span className="hw-price">Bs. {Number(hw.precio_venta).toFixed(2)}</span>
              <Button
                type="primary"
                size="large"
                disabled={agotado || lleno}
                onClick={() => agregar(hw)}
              >
                {agotado ? 'Agotado' : lleno ? 'En tu carrito' : 'Agregar al carrito'}
              </Button>
            </div>
            <p className={`hw-stock${!agotado && hw.cantidad <= 3 ? ' low' : ''}`}>
              {agotado
                ? 'Sin stock por ahora'
                : hw.cantidad <= 3
                ? `Quedan ${hw.cantidad}`
                : `${hw.cantidad} disponibles`}
              {enCarrito > 0 && ` · ya llevas ${enCarrito}`}
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}