import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table, Button, Input, Select, Space, Tag, Image, Popconfirm, Typography, message,Grid, List, Card,
} from 'antd';
import api from '../api/client';
import { useAuth } from '../auth/AuthContext';
import HotWheelForm from '../components/HotWheelForm';
import MovimientoModal from '../components/MovimientoModal';

const ESTADO_COLOR = { disponible: 'green', agotado: 'red', inactivo: 'default' };

export default function AdminHome() {
  const screens = Grid.useBreakpoint();
  const esMovil = screens.md === false;
  const { user, logout } = useAuth();
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [estado, setEstado] = useState();
  const [loading, setLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [movRecord, setMovRecord] = useState(null);

  const cargar = useCallback(() => {
    setLoading(true);
    api
      .get('/hot-wheels/', {
        params: { page, search: search || undefined, estado, ordering: '-creado_en' },
      })
      .then(({ data }) => {
        setData(data.results);
        setTotal(data.count);
      })
      .finally(() => setLoading(false));
  }, [page, search, estado]);

  useEffect(() => { cargar(); }, [cargar]);

  const cambiarEstado = async (id, nuevo) => {
    try {
      if (nuevo === 'inactivo') await api.delete(`/hot-wheels/${id}/`);
      else await api.patch(`/hot-wheels/${id}/`, { estado: nuevo });
      message.success(nuevo === 'inactivo' ? 'Desactivado' : 'Reactivado');
      cargar();
    } catch {
      message.error('No se pudo cambiar el estado');
    }
  };
const acciones = (r) => (
  <Space wrap>
    <Button size="small" type="primary" onClick={() => setMovRecord(r)}>Stock</Button>
    <Button size="small" onClick={() => { setEditRecord(r); setFormOpen(true); }}>
      Editar
    </Button>
    {r.estado === 'inactivo' ? (
      <Button size="small" onClick={() => cambiarEstado(r.id, 'disponible')}>
        Reactivar
      </Button>
    ) : (
      <Popconfirm
        title="¿Desactivar este Hot Wheel?"
        description="Dejará de verse en la tienda. El historial se conserva."
        okText="Sí"
        cancelText="No"
        onConfirm={() => cambiarEstado(r.id, 'inactivo')}
      >
        <Button size="small" danger>Desactivar</Button>
      </Popconfirm>
    )}
  </Space>
);
  const columns = [
    {
      title: '',
      dataIndex: 'imagen',
      width: 64,
      render: (src) =>
        src ? <Image src={src} width={48} height={48} style={{ objectFit: 'cover' }} /> : '🚗',
    },
    {
      title: 'Modelo',
      render: (_, r) => (
        <>
          <b>{r.marca_nombre} {r.modelo_nombre}</b>
          <div style={{ fontSize: 12, color: '#667' }}>
            {r.anio} · {r.serie_nombre} · #{r.numero}
          </div>
        </>
      ),
    },
    {
      title: 'Detalle',
      render: (_, r) => (
        <>
          <Tag>{r.color_nombre}</Tag>
          <Tag color="blue">{r.tipo_nombre}</Tag>
        </>
      ),
    },
    { title: 'Cant.', dataIndex: 'cantidad', width: 70 },
    {
      title: 'Precio',
      dataIndex: 'precio_venta',
      render: (v) => `Bs. ${Number(v).toFixed(2)}`,
    },
    {
      title: 'Estado',
      dataIndex: 'estado',
      render: (e) => <Tag color={ESTADO_COLOR[e]}>{e}</Tag>,
    },
    {
      title: 'Acciones',
      fixed: 'right',
      width: 230,
      render: (_, r) => acciones(r),
    },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <Typography.Title level={3} style={{ margin: 0 }}>Inventario</Typography.Title>
        <Space wrap>
          <span>Sesión: <b>{user}</b></span>
          <Link to="/"><Button>Ver catálogo</Button></Link>
          <Button onClick={logout}>Cerrar sesión</Button>
        </Space>
      </div>

      <Space wrap style={{ margin: '16px 0' }} size="small">
          <Input.Search
            placeholder="Buscar..."
            allowClear
            onSearch={(v) => { setSearch(v); setPage(1); }}
            style={{ width: esMovil ? '100%' : 260 }}
          />
        <Select
          placeholder="Estado"
          allowClear
          style={{ width: 150 }}
          value={estado}
          onChange={(v) => { setEstado(v); setPage(1); }}
          options={[
            { value: 'disponible', label: 'Disponible' },
            { value: 'agotado', label: 'Agotado' },
            { value: 'inactivo', label: 'Inactivo' },
          ]}
        />
        <Button type="primary" onClick={() => { setEditRecord(null); setFormOpen(true); }}>
          + Nuevo Hot Wheel
        </Button>
      </Space>

      {esMovil ? (
        <List
          loading={loading}
          dataSource={data}
          pagination={{
            current: page,
            pageSize: 12,
            total,
            showSizeChanger: false,
            simple: true,
            onChange: setPage,
          }}
          renderItem={(r) => (
            <Card size="small" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                {r.imagen ? (
                  <Image src={r.imagen} width={72} height={72} style={{ objectFit: 'cover', borderRadius: 8 }} />
                ) : (
                  <span style={{ fontSize: 40 }}>🚗</span>
                )}
                <div style={{ flex: 1 }}>
                  <b>{r.marca_nombre} {r.modelo_nombre}</b>
                  <div style={{ fontSize: 12, color: '#667' }}>
                    {r.anio} · {r.serie_nombre} · #{r.numero}
                  </div>
                  <div style={{ margin: '4px 0' }}>
                    <Tag>{r.color_nombre}</Tag>
                    <Tag color="blue">{r.tipo_nombre}</Tag>
                    <Tag color={ESTADO_COLOR[r.estado]}>{r.estado}</Tag>
                  </div>
                  <div>
                    <b style={{ color: '#e8590c' }}>Bs. {Number(r.precio_venta).toFixed(2)}</b>
                    {' · '}Stock: <b>{r.cantidad}</b>
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>{acciones(r)}</div>
            </Card>
          )}
        />
      ) : (
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={data}
          scroll={{ x: 900 }}
          pagination={{
            current: page,
            pageSize: 12,
            total,
            showSizeChanger: false,
            onChange: setPage,
          }}
        />
      )}

      <HotWheelForm
        open={formOpen}
        record={editRecord}
        onClose={() => setFormOpen(false)}
        onSaved={() => { setFormOpen(false); cargar(); }}
      />
      <MovimientoModal
        open={!!movRecord}
        record={movRecord}
        onClose={() => setMovRecord(null)}
        onSaved={() => { setMovRecord(null); cargar(); }}
      />
    </>
  );
}   