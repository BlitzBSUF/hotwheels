import { useEffect, useState } from 'react';
import { Row, Col, Select, Input, Switch, Button } from 'antd';
import api from '../api/client';

const selectProps = {
  allowClear: true,
  showSearch: true,
  optionFilterProp: 'label',
  style: { width: '100%' },
};

export default function Filtros({ value, onChange }) {  
  const [abierto, setAbierto] = useState(() => window.innerWidth >= 768);
  const activos = ['anio', 'serie__linea', 'serie', 'modelo__marca', 'modelo', 'color', 'tipo', 'en_stock']
  .filter((k) => value[k] !== undefined).length;
  const [cat, setCat] = useState({
    lineas: [], series: [], marcas: [], modelos: [], colores: [], tipos: [], anios: [],
  });

  useEffect(() => {
    Promise.all([
      api.get('/lineas/'),
      api.get('/series/'),
      api.get('/marcas/'),
      api.get('/modelos/'),
      api.get('/colores/'),
      api.get('/tipos/'),
      api.get('/hot-wheels/anios/'),
    ]).then(([l, s, ma, mo, c, t, a]) =>
      setCat({
        lineas: l.data, series: s.data, marcas: ma.data, modelos: mo.data,
        colores: c.data, tipos: t.data, anios: a.data,
      })
    );
  }, []);

  const set = (patch) => onChange({ ...value, ...patch });

  const marcaNombre = Object.fromEntries(cat.marcas.map((m) => [m.id, m.nombre]));

  const series = cat.series
    .filter((s) => !value.serie__linea || s.linea === value.serie__linea)
    .map((s) => ({ value: s.id, label: s.nombre }));

  const modelos = cat.modelos
    .filter((m) => !value.modelo__marca || m.marca === value.modelo__marca)
    .map((m) => ({ value: m.id, label: `${marcaNombre[m.marca] ?? ''} ${m.nombre}` }));

  const simple = (arr) => arr.map((x) => ({ value: x.id, label: x.nombre }));

  const col = { xs: 12, md: 8, lg: 6 };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 12, marginBottom: 16 }}>
      <Row gutter={[12, 12]}>
        <Col xs={24} md={16} lg={12}>
          <Input.Search
            placeholder="Buscar por modelo, marca, serie o código..."
            allowClear
            onSearch={(v) => set({ search: v || undefined })}
          />
        </Col>
              <Col xs={24} md={8} lg={12}>
        <Button onClick={() => setAbierto(!abierto)}>
          {abierto ? 'Ocultar filtros' : `Filtros${activos ? ` (${activos})` : ''}`}
        </Button>
      </Col>
 
              {abierto && (
        <>
                 <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Año"
            value={value.anio}
            options={cat.anios.map((a) => ({ value: a, label: a }))}
            onChange={(v) => set({ anio: v })}
          />
        </Col>
        <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Línea"
            value={value.serie__linea}
            options={simple(cat.lineas)}
            onChange={(v) => set({ serie__linea: v, serie: undefined })}
          />
        </Col>
        <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Serie"
            value={value.serie}
            options={series}
            onChange={(v) => set({ serie: v })}
          />
        </Col>
        <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Marca"
            value={value.modelo__marca}
            options={simple(cat.marcas)}
            onChange={(v) => set({ modelo__marca: v, modelo: undefined })}
          />
        </Col>
        <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Modelo"
            value={value.modelo}
            options={modelos}
            onChange={(v) => set({ modelo: v })}
          />
        </Col>
        <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Color"
            value={value.color}
            options={simple(cat.colores)}
            onChange={(v) => set({ color: v })}
          />
        </Col>
        <Col {...col}>
          <Select
            {...selectProps}
            placeholder="Tipo"
            value={value.tipo}
            options={simple(cat.tipos)}
            onChange={(v) => set({ tipo: v })}
          />
        </Col>

        <Col xs={24} md={8} lg={6} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <Switch
            checked={!!value.en_stock}
            onChange={(c) => set({ en_stock: c || undefined })}
          />
          <span>Solo en stock</span>
          <Button onClick={() => onChange({})}>Limpiar</Button>
        </Col>
        </>
      )}
      </Row>
    </div>
  );
}