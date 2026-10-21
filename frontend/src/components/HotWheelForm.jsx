import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Upload, Button, Row, Col, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import api from '../api/client';
import useCatalogos from '../hooks/useCatalogos';
import SelectCreable from './SelectCreable';

const opt = (arr) => arr.map((x) => ({ value: x.id, label: x.nombre }));
const req = [{ required: true, message: 'Obligatorio' }];

export default function HotWheelForm({ open, record, onClose, onSaved }) {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const cat = useCatalogos();
  const editando = !!record;
  const linea = Form.useWatch('linea', form);
  const marca = Form.useWatch('marca', form);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    if (record) {
      form.setFieldsValue({
        ...record,
        imagen: record.imagen
          ? [{ uid: '-1', name: 'imagen actual', status: 'done', url: record.imagen }]
          : [],
      });
    }
  }, [open, record, form]);

  // tras crear una opción: recargar catálogos y dejarla seleccionada
  const elegir = (campo) => async (nuevo) => {
    await cat.recargar();
    form.setFieldValue(campo, nuevo.id);
  };

  const onFinish = async (values) => {
    const fd = new FormData();
    Object.entries(values).forEach(([k, v]) => {
      if (['imagen', 'linea', 'marca'].includes(k)) return;
      if (v === undefined || v === null) return;
      if (editando && k === 'cantidad') return;
      fd.append(k, v);
    });
    const file = values.imagen?.[0]?.originFileObj;
    if (file) fd.append('imagen', file);

    setSaving(true);
    try {
      if (editando) await api.patch(`/hot-wheels/${record.id}/`, fd);
      else await api.post('/hot-wheels/', fd);
      message.success('Guardado');
      onSaved();
    } catch (e) {
      const data = e.response?.data || {};
      message.error(
        data.detail || data.non_field_errors?.[0] || Object.values(data).flat()[0] || 'No se pudo guardar'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={editando ? 'Editar Hot Wheel' : 'Nuevo Hot Wheel'}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="Guardar"
      cancelText="Cancelar"
      confirmLoading={saving}
      width={720}
      forceRender
    >
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={12}>
          <Col xs={24} md={8}>
            <Form.Item label="Línea" name="linea" rules={req}>
              <SelectCreable
                endpoint="/lineas/"
                options={opt(cat.lineas)}
                onCreated={elegir('linea')}
                onChange={() => form.setFieldValue('serie', undefined)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Serie" name="serie" rules={req}>
              <SelectCreable
                endpoint="/series/"
                extraData={{ linea }}
                bloqueado={!linea}
                options={opt(cat.series.filter((s) => s.linea === linea))}
                placeholder={linea ? 'Serie' : 'Elige una línea primero'}
                onCreated={elegir('serie')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Marca" name="marca" rules={req}>
              <SelectCreable
                endpoint="/marcas/"
                options={opt(cat.marcas)}
                onCreated={elegir('marca')}
                onChange={() => form.setFieldValue('modelo', undefined)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Modelo" name="modelo" rules={req}>
              <SelectCreable
                endpoint="/modelos/"
                extraData={{ marca }}
                bloqueado={!marca}
                options={opt(cat.modelos.filter((m) => m.marca === marca))}
                placeholder={marca ? 'Modelo' : 'Elige una marca primero'}
                onCreated={elegir('modelo')}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Color" name="color" rules={req}>
              <SelectCreable
                endpoint="/colores/"
                options={opt(cat.colores)}
                onCreated={elegir('color')}
              />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Tipo" name="tipo" rules={req}>
              <SelectCreable
                endpoint="/tipos/"
                options={opt(cat.tipos)}
                onCreated={elegir('tipo')}
              />
            </Form.Item>
          </Col>

          <Col xs={12} md={8}>
            <Form.Item label="Año" name="anio" rules={req}>
              <InputNumber min={1968} max={2100} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Número" name="numero" rules={req}>
              <Input placeholder="001" />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Cantidad" name="cantidad" initialValue={1} rules={req}>
              <InputNumber min={0} disabled={editando} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Precio de venta (Bs.)" name="precio_venta" rules={req}>
              <InputNumber min={0} step={0.5} precision={2} style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Código de barras" name="codigo_barras">
              <Input />
            </Form.Item>
          </Col>
          <Col xs={12} md={8}>
            <Form.Item label="Código de producto" name="codigo_producto">
              <Input placeholder="HRY61" />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Descripción" name="descripcion">
              <Input.TextArea rows={2} />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Imagen"
              name="imagen"
              initialValue={[]}
              valuePropName="fileList"
              getValueFromEvent={(e) => e?.fileList}
            >
              <Upload accept="image/*" maxCount={1} listType="picture" beforeUpload={() => false}>
                <Button icon={<UploadOutlined />}>
                  {editando ? 'Cambiar imagen' : 'Seleccionar imagen'}
                </Button>
              </Upload>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}