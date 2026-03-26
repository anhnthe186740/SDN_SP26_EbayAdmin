import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Spinner, Alert, Form } from 'react-bootstrap';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import { userService, productService, orderService, genericService } from '../services/api';

const statisticsService = genericService('statistics');

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, Title, Tooltip, Legend, Filler
);

// HÀM LÕI: SẮP XẾP VÀ GỘP DỮ LIỆU
const aggregateData = (data, period, dataKey) => {
  if (!data || !Array.isArray(data) || data.length === 0) return { labels: [], values: [] };

  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));
  const grouped = {};

  sortedData.forEach(item => {
    const dateObj = new Date(item.date);
    let label = "";

    if (period === 'day') {
      label = dateObj.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else if (period === 'month') {
      label = `Tháng ${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
    } else if (period === 'quarter') {
      const quarter = Math.ceil((dateObj.getMonth() + 1) / 3);
      label = `Quý ${quarter}/${dateObj.getFullYear()}`;
    }

    grouped[label] = (grouped[label] || 0) + (item[dataKey] || 0);
  });

  return { labels: Object.keys(grouped), values: Object.values(grouped) };
};

// CÁC HÀM TẠO DATASET
const processRevenueChart = (data, period) => {
  const { labels, values } = aggregateData(data, period, 'revenue');
  const createGradient = (ctx, area) => {
    const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
    gradient.addColorStop(0, 'rgba(0, 210, 255, 0)');
    gradient.addColorStop(1, 'rgba(0, 210, 255, 0.4)');
    return gradient;
  };

  return {
    labels,
    datasets: [{
      label: 'Doanh thu',
      data: values,
      borderColor: '#00D2FF',
      backgroundColor: (context) => {
        const chart = context.chart;
        const { ctx, chartArea } = chart;
        if (!chartArea) return null;
        return createGradient(ctx, chartArea);
      },
      fill: true,
      tension: 0.4,
      pointRadius: 5,
      pointBackgroundColor: '#fff',
      pointBorderColor: '#00D2FF',
      pointBorderWidth: 2,
      pointHoverRadius: 7,
    }],
  };
};

const processBarChart = (data, period, key, label, color) => {
  const { labels, values } = aggregateData(data, period, key);
  return {
    labels,
    datasets: [{ label: label, data: values, backgroundColor: color, borderRadius: 6 }],
  };
};

function Dashboard() {
 
 
  // 1. Đưa cấu hình vào State để React có thể Re-render khi dữ liệu đổi
  const [appSettings, setAppSettings] = useState(() => {
    return JSON.parse(localStorage.getItem('appSettings')) || { currency: 'USD', siteName: 'Bảng Điều Khiển' };
  });

  // 2. Đặt "tai nghe" chờ tín hiệu 'configUpdated' từ trang Cấu Hình
  useEffect(() => {
    const handleConfigChange = () => {
      setAppSettings(JSON.parse(localStorage.getItem('appSettings')) || { currency: 'USD', siteName: 'Bảng Điều Khiển' });
    };
    
    // Lắng nghe sự kiện
    window.addEventListener('configUpdated', handleConfigChange);
    
    // Dọn dẹp bộ nhớ khi chuyển trang
    return () => window.removeEventListener('configUpdated', handleConfigChange);
  }, []);

  // 3. Tự động đổi ký hiệu tiền tệ theo cấu hình mới
  const currencySymbol = appSettings.currency === 'VND' ? '₫' : appSettings.currency === 'EUR' ? '€' : '$';

  const [timePeriod, setTimePeriod] = useState('day');
  const [dateFilter, setDateFilter] = useState('all');

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersRes, productsRes, ordersRes, statisticsRes] = await Promise.all([
          userService.getAll(), productService.getAll(),
          orderService.getAll(), statisticsService.getAll(),
        ]);
        setUsers(usersRes.data);
        setProducts(productsRes.data);
        setOrders(ordersRes.data);
        setStatistics(statisticsRes.data);
        setError(null);
      } catch (err) {
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // HÀM LỌC DỮ LIỆU THỐNG KÊ THEO KHOẢNG THỜI GIAN
  const getFilteredStats = () => {
    if (dateFilter === 'all') return statistics;
    const now = new Date();
    const cutoff = new Date();

    if (dateFilter === '7') cutoff.setDate(now.getDate() - 7);
    else if (dateFilter === '30') cutoff.setDate(now.getDate() - 30);
    else if (dateFilter === 'year') cutoff.setFullYear(now.getFullYear(), 0, 1); // Từ 1/1 năm nay

    return statistics.filter(stat => new Date(stat.date) >= cutoff);
  };

  const activeStats = getFilteredStats();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        padding: 12, cornerRadius: 8, displayColors: false,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              // DÙNG BIẾN currencySymbol THAY CHO DẤU $ CỨNG
              label += label.includes('Doanh thu')
                ? `${currencySymbol}${context.parsed.y.toLocaleString()}`
                : context.parsed.y.toLocaleString();
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748B' } },
      y: { grid: { color: 'rgba(0, 0, 0, 0.04)', borderDash: [5, 5] }, ticks: { color: '#64748B' } }
    }
  };

  const currentHour = new Date().getHours();
  let greeting = "Chào buổi sáng";
  if (currentHour >= 12 && currentHour < 18) greeting = "Chào buổi chiều";
  else if (currentHour >= 18) greeting = "Chào buổi tối";

  if (loading) return <Container fluid className="py-5 text-center"><Spinner animation="border" variant="primary" /></Container>;
  if (error) return <Container fluid className="py-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container fluid className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h1 className="fw-900 text-dark mb-1" style={{ fontSize: '2.2rem', letterSpacing: '-1px' }}>
            Tổng quan {appSettings.siteName}
          </h1>
          <p className="text-muted">{greeting}, Admin. Dưới đây là báo cáo tổng quan hệ thống.</p>
        </div>
        <div className="glass-card p-2 px-3 d-flex align-items-center gap-3 shadow-sm border-0">
          <div className="text-end">
            <div className="fw-bold text-dark">
              {new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </div>
            <div className="small text-success fw-bold"><i className="bi bi-check-circle-fill me-1"></i>Hệ thống ổn định</div>
          </div>
        </div>
      </div>

      <Row className="mb-4 g-4">
        <Col md={4}>
          <div className="glass-card hover-elevate p-4 border-0 h-100 position-relative overflow-hidden" onClick={() => navigate('/admin/users')} style={{ cursor: 'pointer' }}>
            <div className="position-absolute" style={{ top: -20, right: -20, width: 120, height: 120, background: 'var(--primary-gradient)', opacity: 0.1, borderRadius: '50%' }}></div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-3 rounded-4 shadow-sm" style={{ background: 'rgba(0, 82, 255, 0.1)', color: '#0052FF' }}>
                <i className="bi bi-people-fill fs-4"></i>
              </div>
              <span className="fw-bold text-muted text-uppercase small">Tổng người dùng</span>
            </div>
            <h2 className="display-5 fw-900 mb-0 text-dark">{users.length}</h2>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card hover-elevate p-4 border-0 h-100 position-relative overflow-hidden" onClick={() => navigate('/admin/products')} style={{ cursor: 'pointer' }}>
            <div className="position-absolute" style={{ top: -20, right: -20, width: 120, height: 120, background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', opacity: 0.1, borderRadius: '50%' }}></div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-3 rounded-4 shadow-sm" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981' }}>
                <i className="bi bi-box-seam-fill fs-4"></i>
              </div>
              <span className="fw-bold text-muted text-uppercase small">Sản phẩm đang bán</span>
            </div>
            <h2 className="display-5 fw-900 mb-0 text-dark">{products.length}</h2>
          </div>
        </Col>
        <Col md={4}>
          <div className="glass-card hover-elevate p-4 border-0 h-100 position-relative overflow-hidden" onClick={() => navigate('/admin/orders')} style={{ cursor: 'pointer' }}>
            <div className="position-absolute" style={{ top: -20, right: -20, width: 120, height: 120, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', opacity: 0.1, borderRadius: '50%' }}></div>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="p-3 rounded-4 shadow-sm" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B' }}>
                <i className="bi bi-cart-check-fill fs-4"></i>
              </div>
              <span className="fw-bold text-muted text-uppercase small">Đơn hàng hệ thống</span>
            </div>
            <h2 className="display-5 fw-900 mb-0 text-dark">{orders.length}</h2>
          </div>
        </Col>
      </Row>

      {/* BỘ LỌC KÉP: KHOẢNG THỜI GIAN & NHÓM THEO */}
      <div className="d-flex justify-content-end mb-3">
        <div className="d-flex align-items-center gap-2 bg-white p-2 rounded-pill shadow-sm border">

          {/* Lọc Khoảng thời gian */}
          <div className="d-flex align-items-center px-2 border-end">
            <i className="bi bi-calendar-range text-primary me-2"></i>
            <span className="small fw-bold text-muted d-none d-md-inline">Thời gian:</span>
            <Form.Select
              className="border-0 bg-transparent fw-bold text-dark shadow-none py-0"
              style={{ width: 'auto', cursor: 'pointer' }}
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="all">Tất cả</option>
              <option value="7">7 ngày qua</option>
              <option value="30">30 ngày qua</option>
              <option value="year">Năm nay</option>
            </Form.Select>
          </div>

          {/* Gom nhóm Ngày/Tháng/Quý */}
          <div className="d-flex align-items-center px-2">
            <i className="bi bi-bar-chart-line text-success me-2"></i>
            <span className="small fw-bold text-muted d-none d-md-inline">Hiển thị theo:</span>
            <Form.Select
              className="border-0 bg-transparent fw-bold text-dark shadow-none py-0 pe-4"
              style={{ width: 'auto', cursor: 'pointer' }}
              value={timePeriod}
              onChange={(e) => setTimePeriod(e.target.value)}
            >
              <option value="day">Ngày</option>
              <option value="month">Tháng</option>
              <option value="quarter">Quý</option>
            </Form.Select>
          </div>

        </div>
      </div>

      {/* TRUYỀN activeStats VÀO BIỂU ĐỒ */}
      <Row className="mb-4">
        <Col md={12}>
          <div className="glass-card p-4 border-0 shadow-sm">
            <h5 className="mb-4 fw-bold text-dark"><i className="bi bi-graph-up-arrow text-primary me-2"></i>Biểu đồ Doanh Thu</h5>
            <div style={{ height: '350px' }}>
              {activeStats.length > 0 ? (
                <Line data={processRevenueChart(activeStats, timePeriod)} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted fst-italic">Không có dữ liệu trong khoảng thời gian này</div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        <Col md={6} className="mb-4">
          <div className="glass-card p-4 border-0 h-100 shadow-sm">
            <h6 className="mb-4 fw-bold text-dark"><i className="bi bi-bag-check text-warning me-2"></i>Lượng Đơn Hàng</h6>
            <div style={{ height: '250px' }}>
              {activeStats.length > 0 ? (
                <Bar data={processBarChart(activeStats, timePeriod, 'orders', 'Số đơn hàng', 'rgba(245, 158, 11, 0.8)')} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted fst-italic">Trống</div>
              )}
            </div>
          </div>
        </Col>
        <Col md={6} className="mb-4">
          <div className="glass-card p-4 border-0 h-100 shadow-sm">
            <h6 className="mb-4 fw-bold text-dark"><i className="bi bi-person-plus text-success me-2"></i>Người Dùng Đăng Ký Mới</h6>
            <div style={{ height: '250px' }}>
              {activeStats.length > 0 ? (
                <Bar data={processBarChart(activeStats, timePeriod, 'newUsers', 'Tài khoản mới', 'rgba(16, 185, 129, 0.8)')} options={chartOptions} />
              ) : (
                <div className="h-100 d-flex align-items-center justify-content-center text-muted fst-italic">Trống</div>
              )}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;