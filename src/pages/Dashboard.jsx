import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Spinner, Alert } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { userService, productService, orderService, genericService } from '../services/api';

const statisticsService = genericService('statistics');

// Đăng ký các thành phần của Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Hàm xử lý dữ liệu cho biểu đồ
const processChartData = (data, period) => {
  if (!data || !Array.isArray(data)) return { labels: [], datasets: [] };
  
  const createGradient = (ctx, area) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, 'rgba(0, 210, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 210, 255, 0.2)');
    return gradient;
  };

  const labels = data.map(item => item.date);
  const revenueData = data.map(item => item.revenue);

  return {
    labels,
    datasets: [
      {
        label: 'Doanh thu ($)',
        data: revenueData,
        borderColor: '#00D2FF',
        backgroundColor: (context) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;
          if (!chartArea) return null;
          return createGradient(ctx, chartArea);
        },
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#00D2FF',
        pointHoverRadius: 6,
      },
    ],
  };
};

const processOrdersData = (data) => {
  if (!data || !Array.isArray(data)) return { labels: [], datasets: [] };
  const monthlyOrders = data.reduce((acc, item) => {
    const month = item.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + item.orders;
    return acc;
  }, {});
  return {
    labels: Object.keys(monthlyOrders),
    datasets: [
      {
        label: 'Số đơn hàng',
        data: Object.values(monthlyOrders),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };
};

const processNewUsersData = (data) => {
  if (!data || !Array.isArray(data)) return { labels: [], datasets: [] };
  const monthlyNewUsers = data.reduce((acc, item) => {
    const month = item.date.slice(0, 7);
    acc[month] = (acc[month] || 0) + item.newUsers;
    return acc;
  }, {});
  return {
    labels: Object.keys(monthlyNewUsers),
    datasets: [
      {
        label: 'Người dùng mới',
        data: Object.values(monthlyNewUsers),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
      },
    ],
  };
};

function Dashboard() {
  const [revenuePeriod, setRevenuePeriod] = useState('day');
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch dữ liệu từ API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, productsRes, ordersRes, statisticsRes] = await Promise.all([
          userService.getAll(),
          productService.getAll(),
          orderService.getAll(),
          statisticsService.getAll(),
        ]);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setStatistics(statisticsRes.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu từ server. Vui lòng thử lại sau.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Hàm xử lý chuyển hướng
  const handleUsersClick = () => {
    navigate('/admin/users');
  };
  const handleProductsClick = () => {
    navigate('/admin/products');
  };
  const handleOrdersClick = () => {
    navigate('/admin/orders');
  };

  // Dữ liệu cho biểu đồ
  const revenueData = processChartData(statistics, revenuePeriod);
  const ordersData = processOrdersData(statistics);
  const newUsersData = processNewUsersData(statistics);

  // Tùy chọn biểu đồ
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#1E293B',
        bodyColor: '#1E293B',
        borderColor: 'rgba(0, 210, 255, 0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 12,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans' } }
      },
      y: {
        grid: { color: 'rgba(0, 0, 0, 0.03)' },
        ticks: { color: '#64748B', font: { family: 'Plus Jakarta Sans' } }
      }
    }
  };

  // Hiển thị loading hoặc lỗi
  if (loading) {
    return (
      <Container fluid className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-800 text-dark mb-1" style={{ fontSize: '2.5rem' }}>Bảng Điều Khiển</h1>
          <p className="text-muted">Chào mừng trở lại, Admin. Đây là tổng quan hệ thống hôm nay.</p>
        </div>
        <div className="glass-card p-2 px-3 d-flex align-items-center gap-3">
          <div className="text-end">
            <div className="fw-bold">24 Mar 2026</div>
            <div className="small text-muted">Hệ thống ổn định</div>
          </div>
          <div className="bg-success rounded-circle" style={{ width: 10, height: 10 }}></div>
        </div>
      </div>

      {/* Thẻ thống kê */}
      <Row className="mb-5">
        <Col md={4}>
          <div className="glass-card p-4 border-0 h-100 position-relative overflow-hidden" onClick={handleUsersClick} style={{ cursor: 'pointer' }}>
             <div className="position-absolute" style={{ top: -20, right: -20, width: 100, height: 100, background: 'var(--primary-gradient)', opacity: 0.1, borderRadius: '50%' }}></div>
             <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 rounded-4" style={{ background: 'rgba(0, 210, 255, 0.1)', color: 'var(--electric-blue)' }}>
                  <i className="bi bi-people-fill fs-4"></i>
                </div>
                <span className="fw-semibold text-muted">Người dùng</span>
             </div>
             <h2 className="display-5 fw-bold mb-0">{users.length}</h2>
             <span className="text-success small fw-bold mt-2 d-block">+12% so với tháng trước</span>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 border-0 h-100 position-relative overflow-hidden" onClick={handleProductsClick} style={{ cursor: 'pointer' }}>
             <div className="position-absolute" style={{ top: -20, right: -20, width: 100, height: 100, background: 'var(--secondary-gradient)', opacity: 0.1, borderRadius: '50%' }}></div>
             <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 rounded-4" style={{ background: 'rgba(0, 255, 198, 0.1)', color: '#00FFC6' }}>
                  <i className="bi bi-box-seam-fill fs-4"></i>
                </div>
                <span className="fw-semibold text-muted">Sản phẩm</span>
             </div>
             <h2 className="display-5 fw-bold mb-0">{products.length}</h2>
             <span className="text-success small fw-bold mt-2 d-block">+5 sản phẩm mới</span>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card p-4 border-0 h-100 position-relative overflow-hidden" onClick={handleOrdersClick} style={{ cursor: 'pointer' }}>
             <div className="position-absolute" style={{ top: -20, right: -20, width: 100, height: 100, background: 'var(--primary-gradient)', opacity: 0.1, borderRadius: '50%' }}></div>
             <div className="d-flex align-items-center gap-3 mb-3">
                <div className="p-3 rounded-4" style={{ background: 'rgba(58, 123, 213, 0.1)', color: 'var(--deep-blue)' }}>
                   <i className="bi bi-cart-check-fill fs-4"></i>
                </div>
                <span className="fw-semibold text-muted">Đơn hàng</span>
             </div>
             <h2 className="display-5 fw-bold mb-0">{orders.length}</h2>
             <span className="text-warning small fw-bold mt-2 d-block">3 đơn chờ xử lý</span>
          </div>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row className="mb-5">
        <Col md={12}>
          <div className="glass-card p-4 border-0">
            <div className="d-flex justify-content-between align-items-center mb-4">
               <h4 className="mb-0 fw-bold">Thống kê doanh thu</h4>
               <Form.Select
                  className="w-auto border-0 bg-light rounded-3"
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                >
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                  <option value="quarter">Theo quý</option>
                </Form.Select>
            </div>
            <div style={{ height: '350px' }}>
              <Line data={revenueData} options={chartOptions} />
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <div className="glass-card p-4 border-0 h-100">
             <h4 className="mb-4 fw-bold">Đơn hàng gần đây</h4>
             <div style={{ height: '250px' }}>
                <Bar data={processOrdersData(statistics)} options={chartOptions} />
             </div>
          </div>
        </Col>
        <Col md={6} className="mb-4">
          <div className="glass-card p-4 border-0 h-100">
             <h4 className="mb-4 fw-bold">Người dùng tăng trưởng</h4>
             <div style={{ height: '250px' }}>
                <Bar data={processNewUsersData(statistics)} options={chartOptions} />
             </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;