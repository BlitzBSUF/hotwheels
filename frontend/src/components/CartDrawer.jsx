import { useState } from 'react';
import { Drawer, List, InputNumber, Button, Input, Typography, Empty, Space } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useCart } from '../cart/CartContext';

const WHATSAPP = import.meta.env.VITE_WHATSAPP;

export default function CartDrawer({ open, onClose }) {
  const { items, cambiarCantidad, quitar, vaciar, total } = useCart();
  const [nombre, setNombre] = useState('');

  const enviar = () => {
    const lineas = items.map(
      (i) =>
        `• ${i.cantidad} x ${i.nombre} (${i.detalle}) - Bs. ${(i.precio * i.cantidad).toFixed(2)}`
    );
    const texto = [
      `Hola, quiero hacer este pedido${nombre ? ` a nombre de ${nombre}` : ''}:`,
      '',
      ...lineas,
      '',
      `Total: Bs. ${total.toFixed(2)}`,
    ].join('\n');

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`, '_blank');
  };

  return (
    <Drawer title="Tu pedido" open={open} onClose={onClose} width={420}>
      {items.length === 0 ? (
        <Empty description="Tu carrito está vacío" />
      ) : (
        <>
          <List
            dataSource={items}
            renderItem={(i) => (
              <List.Item
                actions={[
                  <Button
                    key="q"
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => quitar(i.id)}
                  />,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    i.imagen ? (
                      <img src={i.imagen} alt="" width={56} height={56}
                           style={{ objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      <span style={{ fontSize: 32 }}>🚗</span>
                    )
                  }
                  title={i.nombre}
                  description={
                    <>
                      <div style={{ fontSize: 12 }}>{i.detalle}</div>
                      <Space style={{ marginTop: 4 }}>
                        <InputNumber
                          size="small"
                          min={1}
                          max={i.stock}
                          value={i.cantidad}
                          onChange={(v) => cambiarCantidad(i.id, v || 1)}
                        />
                        <b>Bs. {(i.precio * i.cantidad).toFixed(2)}</b>
                      </Space>
                    </>
                  }
                />
              </List.Item>
            )}
          />

          <Typography.Title level={4} style={{ textAlign: 'right' }}>
            Total: Bs. {total.toFixed(2)}
          </Typography.Title>

          <Input
            placeholder="Tu nombre (opcional)"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <Button type="primary" size="large" block onClick={enviar}>
            Enviar pedido por WhatsApp
          </Button>
          <Button block style={{ marginTop: 8 }} onClick={vaciar}>
            Vaciar carrito
          </Button>
          <Typography.Paragraph type="secondary" style={{ marginTop: 12, fontSize: 12 }}>
            El pedido se confirma por WhatsApp. El stock se reserva cuando el vendedor
            confirma tu compra.
          </Typography.Paragraph>
        </>
      )}
    </Drawer>
  );
}