import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Form, Input, Button, Alert, Typography } from 'antd';
import { useAuth } from '../auth/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const onFinish = async ({ username, password }) => {
    setLoading(true);
    setError(null);
    try {
      await login(username, password);
      navigate('/admin', { replace: true });
    } catch (e) {
      setError(
        e.response?.data?.detail ||
        (e.response?.data?.non_field_errors?.[0]) ||
        'No se pudo iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'grid', placeItems: 'center', minHeight: '70vh' }}>
      <Card style={{ width: 360, maxWidth: '100%' }}>
        <Typography.Title level={4} style={{ textAlign: 'center' }}>
          Acceso de vendedores
        </Typography.Title>
        {error && <Alert type="error" message={error} style={{ marginBottom: 16 }} />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item label="Usuario" name="username" rules={[{ required: true }]}>
            <Input autoFocus />
          </Form.Item>
          <Form.Item label="Contraseña" name="password" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Ingresar
          </Button>
        </Form>
      </Card>
    </div>
  );
}       