import React, { useState, useEffect } from "react";
import { Container, Navbar, Nav, Dropdown, Form, InputGroup } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { notificationService } from "../../services/api"; // Lùi 2 cấp nếu file ở src/layout/includes

// Hàm format thời gian gọn gàng cho thông báo
const formatTime = (isoString) => {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit' });
};

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  // ==========================================
  // 1. CÁC STATE CỦA ỨNG DỤNG (BẮT BUỘC ĐẶT TRONG HÀM NÀY)
  // ==========================================
  const [globalSearch, setGlobalSearch] = useState("");
  const [notifications, setNotifications] = useState([]);

  // State Quản lý Dark Mode
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  // ==========================================
  // 2. CÁC HIỆU ỨNG (EFFECTS)
  // ==========================================
  // Effect chạy Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.setAttribute('data-bs-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-bs-theme', 'light');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Effect kéo dữ liệu thông báo thật từ Backend
  useEffect(() => {
    if (isAdmin) {
      const fetchNotifs = async () => {
        try {
          const res = await notificationService.getAll();
          const sorted = res.data.sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt)).slice(0, 5);
          setNotifications(sorted);
        } catch (err) {
          console.error("Lỗi tải thông báo:", err);
        }
      };
      fetchNotifs();
    }
  }, [isAdmin]);

  const unreadCount = notifications.filter(n => !n.isRead).length || notifications.length;

  // ==========================================
  // 3. CÁC HÀM XỬ LÝ (HANDLERS)
  // ==========================================
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleGlobalSearch = (e) => {
    e.preventDefault();
    if (globalSearch.trim()) {
      alert(`Đang tìm kiếm toàn hệ thống từ khóa: ${globalSearch}`);
    }
  };

  return (
    <Navbar expand="lg" className="shadow-sm py-2 sticky-top" style={{ backgroundColor: "#1e1e24", zIndex: 1050 }}>
      <Container fluid className="px-4">

        {/* LOGO SỬ DỤNG ẢNH SVG CHUẨN */}
        <Navbar.Brand as={Link} to="/" className="me-4 d-flex align-items-end text-decoration-none">
          <img
            style={{ height: "36px", objectFit: "contain" }}
            src="https://upload.wikimedia.org/wikipedia/commons/1/1b/EBay_logo.svg"
            alt="eBay logo"
          />
          {isAdmin && (
            <span className="ms-2 pb-1 text-white fs-6 fw-medium opacity-75 border-start border-secondary ps-2" style={{ lineHeight: '1' }}>
              Admin
            </span>
          )}
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-secondary text-white">
          <i className="bi bi-list text-white fs-2"></i>
        </Navbar.Toggle>

        <Navbar.Collapse id="basic-navbar-nav">

          {/* Ô TÌM KIẾM TOÀN CỤC */}
          <Nav className="mx-auto w-100 justify-content-center" style={{ maxWidth: '600px' }}>
            {isAdmin && (
              <Form onSubmit={handleGlobalSearch} className="w-100 d-none d-lg-block">
                <InputGroup size="md">
                  <InputGroup.Text className="border-0 text-white" style={{ backgroundColor: "rgba(255, 255, 255, 0.1)", borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                    <i className="bi bi-search"></i>
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Tìm mã đơn hàng, tài khoản..."
                    className="border-0 text-white shadow-none"
                    value={globalSearch}
                    onChange={(e) => setGlobalSearch(e.target.value)}
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      borderTopRightRadius: '8px',
                      borderBottomRightRadius: '8px'
                    }}
                  />
                </InputGroup>
              </Form>
            )}
          </Nav>

          {/* MENU BÊN PHẢI & PROFILE */}
          <Nav className="ms-auto fw-medium align-items-center gap-3 mt-3 mt-lg-0">

            {/* Nav cho User bình thường */}
            {!isAdmin && (
              <>
                <Nav.Link as={Link} to="/products" className="text-light px-2">Product</Nav.Link>
                <Nav.Link as={Link} to="/cart" className="text-light px-2">Cart</Nav.Link>
                <Nav.Link as={Link} to="/order-history" className="text-light px-2">History</Nav.Link>
              </>
            )}

            {isAdmin && (
              <div className="d-flex align-items-center gap-3">
                
                {/* 🌟 NÚT BẬT/TẮT DARK MODE ĐÃ ĐƯỢC THÊM VÀO ĐÂY */}
                <button 
                  className="btn btn-link text-white p-0 border-0 shadow-none position-relative"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title={isDarkMode ? "Chuyển sang giao diện Sáng" : "Chuyển sang giao diện Tối"}
                >
                  <i className={`bi ${isDarkMode ? 'bi-moon-stars-fill text-warning' : 'bi-sun-fill text-warning'} fs-5`} style={{ transition: 'all 0.3s' }}></i>
                </button>

                {/* THÔNG BÁO CHO ADMIN */}
                <Dropdown align="end">
                  <Dropdown.Toggle variant="link" className="text-white p-0 border-0 shadow-none position-relative" id="dropdown-notifications">
                    <i className="bi bi-bell-fill" style={{ fontSize: '1.4rem' }}></i>
                    {unreadCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-dark" style={{ fontSize: '0.65rem', padding: '0.25em 0.4em' }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow-lg mt-3 border-0" style={{ width: '350px', zIndex: 1050 }}>
                    <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center bg-light">
                      <span className="fw-bold text-dark">Thông báo hệ thống</span>
                      <span className="badge bg-primary-subtle text-primary rounded-pill">{unreadCount} Mới</span>
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: '350px' }}>
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted small fst-italic">Chưa có thông báo nào.</div>
                      ) : (
                        notifications.map((notif, idx) => (
                          <Dropdown.Item key={idx} className="text-wrap py-3 border-bottom custom-hover-item">
                            <div className="d-flex align-items-start gap-3">
                              <i className={`bi mt-1 fs-5 ${notif.title?.toLowerCase().includes('đơn hàng') ? 'bi-box-seam-fill text-warning' : 'bi-info-circle-fill text-primary'}`}></i>
                              <div>
                                <span className="d-block small fw-bold text-dark">{notif.title || "Thông báo mới"}</span>
                                <span className="d-block small text-muted mb-1" style={{ whiteSpace: 'normal' }}>{notif.message}</span>
                                <span className="d-block text-secondary" style={{ fontSize: '0.7rem' }}>
                                  <i className="bi bi-clock me-1"></i>{formatTime(notif.timestamp || notif.createdAt)}
                                </span>
                              </div>
                            </div>
                          </Dropdown.Item>
                        ))
                      )}
                    </div>
                    <Dropdown.Item as={Link} to="/admin/broadcast" className="text-center small text-primary fw-bold py-2 bg-light">
                      Xem tất cả thông báo
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            )}

            {/* PROFILE DROPDOWN */}
            {user ? (
              <Dropdown align="end">
                <Dropdown.Toggle variant="link" className="d-flex align-items-center gap-2 text-white text-decoration-none shadow-none border-0 p-0" id="dropdown-profile">
                  <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: '36px', height: '36px', fontSize: '1rem', fontWeight: 'bold' }}>
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="d-none d-md-block fw-medium">{user.username}</span>
                  <i className="bi bi-chevron-down small text-white-50"></i>
                </Dropdown.Toggle>

                <Dropdown.Menu className="shadow-lg mt-3 border-0 py-2" style={{ width: '220px' }}>
                  <div className="px-3 py-2 border-bottom mb-1">
                    <span className="d-block fw-bold text-dark">Xin chào, {user.fullname || user.username}!</span>
                    <span className="d-block small text-muted">{user.role === 'admin' ? 'Administrator' : 'Khách hàng'}</span>
                  </div>
                  {isAdmin && (
                    <>
                      <Dropdown.Item as={Link} to="/admin/settings" className="py-2 small fw-medium"><i className="bi bi-gear me-2"></i> Cài đặt hệ thống</Dropdown.Item>
                      <Dropdown.Item as={Link} to="/admin/logs" className="py-2 small fw-medium"><i className="bi bi-journal-text me-2"></i> Nhật ký hoạt động</Dropdown.Item>
                    </>
                  )}
                  <Dropdown.Divider />
                  <Dropdown.Item onClick={handleLogout} className="py-2 small fw-bold text-danger">
                    <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="btn btn-primary text-white px-4 rounded-pill btn-sm fw-bold shadow-sm">
                Đăng nhập
              </Nav.Link>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>

      {/* CSS Fix đổi màu placeholder của ô search */}
      <style>{`
        input::placeholder { color: rgba(255, 255, 255, 0.6) !important; }
        .custom-hover-item:hover { background-color: #f8f9fa !important; }
      `}</style>
    </Navbar>
  );
}

export default Header;