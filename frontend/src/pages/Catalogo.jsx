import { useEffect, useState } from 'react';
import { Row, Col, Pagination, Spin, Button } from 'antd';
import api from '../api/client';
import Filtros from '../components/Filtros';
import HotWheelCard from '../components/HotWheelCard';
import DetalleModal from '../components/DetalleModal';

const PAGE_SIZE = 12;

export default function Catalogo() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({});
  const [loading, setLoading] = useState(true);
  const [detalle, setDetalle] = useState(null);

  const cambiarFiltros = (f) => {
    setFiltros(f);
    setPage(1);
  };

  useEffect(() => {
    setLoading(true);
    api
      .get('/hot-wheels/', { params: { page, ...filtros } })
      .then(({ data }) => {
        setItems(data.results);
        setTotal(data.count);
      })
      .finally(() => setLoading(false));
  }, [page, filtros]);

  return (
    <>
      <Filtros value={filtros} onChange={cambiarFiltros} />

      <div className="hw-results">
        {total} {total === 1 ? 'modelo' : 'modelos'}
      </div>

      <Spin spinning={loading}>
        {!loading && items.length === 0 ? (
          <div className="hw-empty">
            <p>No hay autos con esos filtros.</p>
            <Button onClick={() => cambiarFiltros({})}>Quitar filtros</Button>
          </div>
        ) : (
          <Row gutter={[14, 14]}>
            {items.map((hw) => (
              <Col key={hw.id} xs={12} md={8} lg={6}>
                <HotWheelCard hw={hw} onOpen={setDetalle} />
              </Col>
            ))}
          </Row>
        )}

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={total}
            onChange={setPage}
            showSizeChanger={false}
          />
        </div>
      </Spin>

      <DetalleModal hw={detalle} onClose={() => setDetalle(null)} />
    </>
  );
}