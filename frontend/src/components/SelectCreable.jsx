import { useState } from 'react';
import { Select, Divider, Space, Input, Button, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import api from '../api/client';

export default function SelectCreable({
  endpoint, extraData = {}, bloqueado = false, onCreated, ...props
}) {
  const [nombre, setNombre] = useState('');
  const [saving, setSaving] = useState(false);

  const crear = async () => {
    const n = nombre.trim();
    if (!n) return;
    setSaving(true);
    try {
      const { data } = await api.post(endpoint, { nombre: n, ...extraData });
      setNombre('');
      await onCreated(data);
    } catch (e) {
      const d = e.response?.data || {};
      message.error(d.detail || Object.values(d).flat()[0] || 'No se pudo crear');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Select
      showSearch
      optionFilterProp="label"
      style={{ width: '100%' }}
      {...props}
      popupRender={(menu) => (
        <>
          {menu}
          <Divider style={{ margin: '8px 0' }} />
          <Space style={{ padding: '0 8px 4px' }}>
            <Input
              placeholder="Nueva opción"
              value={nombre}
              disabled={bloqueado}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === 'Enter') crear();
              }}
            />
            <Button
              type="text"
              icon={<PlusOutlined />}
              loading={saving}
              disabled={bloqueado}
              onClick={crear}
            >
              Agregar
            </Button>
          </Space>
        </>
      )}
    />
  );
}