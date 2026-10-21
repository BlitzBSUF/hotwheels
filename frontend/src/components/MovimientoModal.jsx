import { useEffect, useState } from 'react';
import { Modal, Form, Select, InputNumber, Input, message } from 'antd';
import api from '../api/client';

const TIPOS = [
  { value: 'venta', label: 'Venta (resta)' },
  { value: 'ingreso', label: 'Ingreso (suma)' },
  { value: 'baja', label: 'Baja (resta)' },
  { value: 'ajuste', label: 'Ajuste (stock final)' },
];

export default function MovimientoModal({ open, record, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const tipo = Form.useWatch('tipo', form);

  useEffect(() => {
    if (open) form.setFieldsValue({ tipo: 'venta', cantidad: 1, nota: '' });
  }, [open, form]);

  const onFinish = async (values) => {
    setSaving(true);
    try {
      await api.post(`/hot-wheels/${record.id}/movimientos/`, values);
      message.success('Movimiento registrado');
      onSaved();
    } catch (e) {
      const data = e.response?.data || {};
      message.error(data.detail || Object.values(data).flat()[0] || 'No se pudo registrar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={record ? `Stock: ${record.marca_nombre} ${record.modelo_nombre}` : ''}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Registrar"
      cancelText="Cancelar"
      confirmLoading={saving}
      forceRender
    >
      <p>Stock actual: <b>{record?.cantidad}</b></p>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item label="Tipo" name="tipo" rules={[{ required: true }]}>
          <Select options={TIPOS} />
        </Form.Item>
        <Form.Item
          label={tipo === 'ajuste' ? 'Stock final' : 'Cantidad'}
          name="cantidad"
          rules={[{ required: true }]}
        >
          <InputNumber min={tipo === 'ajuste' ? 0 : 1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label="Nota (opcional)" name="nota">
          <Input maxLength={200} />
        </Form.Item>
      </Form>
    </Modal>
  );
}