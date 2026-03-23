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
import axios from 'axios';

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
  if (period === 'day') {
    return {
      labels: data.map(item => item.date),
      datasets: [
        {
          label: 'Doanh thu ($)',
          data: data.map(item => item.revenue),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
  } else if (period === 'month') {
    const monthlyData = data.reduce((acc, item) => {
      const month = item.date.slice(0, 7);
      acc[month] = (acc[month] || 0) + item.revenue;
      return acc;
    }, {});
    return {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Doanh thu ($)',
          data: Object.values(monthlyData),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
  } else if (period === 'quarter') {
    const quarterlyData = data.reduce((acc, item) => {
      const quarter = `Q${Math.ceil(parseInt(item.date.slice(5, 7)) / 3)}-${item.date.slice(0, 4)}`;
      acc[quarter] = (acc[quarter] || 0) + item.revenue;
      return acc;
    }, {});
    return {
      labels: Object.keys(quarterlyData),
      datasets: [
        {
          label: 'Doanh thu ($)',
          data: Object.values(quarterlyData),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          fill: true,
        },
      ],
    };
  }
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
        const url = process.env.REACT_APP_API_PATH;
        const [usersRes, productsRes, ordersRes, statisticsRes] = await Promise.all([
          axios.get(`${url}/users`),
          axios.get(`${url}/products`),
          axios.get(`${url}/orderTable`),
          axios.get(`${url}/statistics`),
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
        position: 'top',
      },
    },
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
    <Container fluid className="py-4">
      <h1 className="mb-4">Bảng Điều Khiển</h1>

      {/* Thẻ thống kê */}
      <Row className="mb-4">
        <Col md={4} className="mb-4">
          <Card
            bg="primary"
            text="white"
            className="cursor-pointer"
            onClick={handleUsersClick}
          >
            <Card.Body>
              <Card.Title>Tổng Người Dùng</Card.Title>
              <Card.Text className="display-6">{users.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card
            bg="success"
            text="white"
            className="cursor-pointer"
            onClick={handleProductsClick}
          >
            <Card.Body>
              <Card.Title>Tổng Sản Phẩm</Card.Title>
              <Card.Text className="display-6">{products.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card
            bg="info"
            text="white"
            className="cursor-pointer"
            onClick={handleOrdersClick}
          >
            <Card.Body>
              <Card.Title>Tổng Đơn Hàng</Card.Title>
              <Card.Text className="display-6">{orders.length}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Thống Kê Doanh Thu</Card.Title>
              <Form.Group className="mb-3">
                <Form.Label>Chọn khoảng thời gian:</Form.Label>
                <Form.Select
                  value={revenuePeriod}
                  onChange={(e) => setRevenuePeriod(e.target.value)}
                >
                  <option value="day">Theo ngày</option>
                  <option value="month">Theo tháng</option>
                  <option value="quarter">Theo quý</option>
                </Form.Select>
              </Form.Group>
              <div style={{ height: '300px' }}>
                <Line data={revenueData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Đơn Hàng Mỗi Tháng</Card.Title>
              <div style={{ height: '300px' }}>
                <Bar data={ordersData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={12}>
          <Card>
            <Card.Body>
              <Card.Title>Người Dùng Mới Mỗi Tháng</Card.Title>
              <div style={{ height: '300px' }}>
                <Bar data={newUsersData} options={chartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;