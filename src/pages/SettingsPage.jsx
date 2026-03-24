import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Table, Row, Col } from "react-bootstrap";
import { adminService, userService, logService } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminSettingsPage = () => {
  // State for Admin IP (single IP for the logged-in admin)
  const [adminIP, setAdminIP] = useState("");
  const [newIP, setNewIP] = useState("");

  // State for 2FA
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  // State for All Users
  const [users, setUsers] = useState([]);

  // State for Logs
  const [logs, setLogs] = useState([]);

  // Assume logged-in admin ID (hardcoded for simplicity)
  const loggedInAdminId = "1"; // admin01

  // Fetch initial data
  useEffect(() => {
    // Fetch Admin Data (IP and 2FA)
    adminService.getById(loggedInAdminId)
      .then((res) => {
        setAdminIP(res.data.ip || "");
        setIs2FAEnabled(res.data["2fa"] || false);
      })
      .catch((err) => console.error("Error fetching admin data:", err));

    // Fetch All Users
    userService.getAll()
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch Logs
    logService.getAll()
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("Error fetching logs:", err));
  }, []);

  // Update Admin IP
  const handleUpdateIP = () => {
    if (!newIP.trim() || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(newIP)) {
      alert("Vui lòng nhập IP hợp lệ (VD: 192.168.1.1)!");
      return;
    }
    adminService.update(loggedInAdminId, { ip: newIP })
      .then(() => {
        setAdminIP(newIP);
        setNewIP("");
        logAction("Update Admin IP", `IP updated to: ${newIP}`);
      })
      .catch((err) => {
        console.error("Error updating IP:", err);
        alert("Không thể cập nhật IP!");
      });
  };

  // Toggle 2FA
  const handleToggle2FA = () => {
    const new2FAStatus = !is2FAEnabled;
    adminService.update(loggedInAdminId, { "2fa": new2FAStatus })
      .then(() => {
        setIs2FAEnabled(new2FAStatus);
        logAction("Toggle 2FA", `2FA ${new2FAStatus ? "Enabled" : "Disabled"}`);
      })
      .catch((err) => {
        console.error("Error updating 2FA:", err);
        alert("Không thể cập nhật 2FA!");
      });
  };

  // Update User Role
  const handleRoleChange = (userId, newRole) => {
    userService.update(userId, { role: newRole })
      .then(() => {
        setUsers(
          users.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
        );
        logAction("Update User Role", `User ID: ${userId}, Role: ${newRole}`);
      })
      .catch((err) => {
        console.error("Error updating role:", err);
        alert("Không thể cập nhật vai trò!");
      });
  };

  // Log Action
  const logAction = (action, details) => {
    logService.create({
      action,
      user: "admin01", // Hardcoded for simplicity
      timestamp: new Date().toISOString(),
      ip: adminIP || "192.168.1.10", // Use admin's IP or fallback
      level: "info",
      details,
    })
      .then((res) => setLogs([...logs, res.data]))
      .catch((err) => console.error("Error logging:", err));
  };

  return (
    <div className="py-2">
      <div className="mb-5">
        <h2 className="fw-bold text-dark mb-1">Cài đặt Hệ thống</h2>
        <p className="text-muted small">Quản lý bảo mật, phân quyền và giám sát hoạt động quản trị viên.</p>
      </div>

      <Row className="g-4 mb-4">
        {/* Admin IP */}
        <Col lg={7}>
          <div className="glass-card p-4 border-0 h-100">
            <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
              <i className="bi bi-shield-lock-fill text-primary"></i> Bảo mật IP Admin
            </h5>
            <div className="bg-light rounded-4 p-4 mb-3 border">
              <p className="mb-1 text-muted small fw-bold text-uppercase">Địa chỉ IP hiện tại</p>
              <h3 className="fw-bold text-dark">{adminIP || "Chưa thiết lập"}</h3>
            </div>
            <div className="row g-2">
              <div className="col-md-8">
                <input
                  type="text"
                  className="form-control border-0 bg-light py-2 rounded-3"
                  placeholder="Nhập IP mới (VD: 192.168.1.1)"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </div>
              <div className="col-md-4">
                <button className="btn-modern btn-modern-primary w-100" onClick={handleUpdateIP}>
                  Cập nhật IP
                </button>
              </div>
            </div>
            <p className="mt-3 text-muted small"><i className="bi bi-info-circle me-1"></i> Chỉ địa chỉ IP này mới có quyền truy cập vào bảng quản trị cao cấp.</p>
          </div>
        </Col>

        {/* 2FA Toggle */}
        <Col lg={5}>
          <div className="glass-card p-4 border-0 h-100 d-flex flex-column justify-content-between">
            <div>
              <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
                <i className="bi bi-fingerprint text-success"></i> Xác thực 2 bước (2FA)
              </h5>
              <p className="text-muted">Tăng cường bảo mật tài khoản bằng cách yêu cầu mã xác nhận khi đăng nhập.</p>
            </div>
            <div className="d-flex align-items-center justify-content-between bg-light p-3 rounded-4 mt-auto">
               <span className={`fw-bold ${is2FAEnabled ? 'text-success' : 'text-danger'}`}>
                 {is2FAEnabled ? '✅ ĐÃ KÍCH HOẠT' : '❌ ĐANG TẮT'}
               </span>
               <div className="form-check form-switch m-0">
                 <input
                   className="form-check-input"
                   type="checkbox"
                   role="switch"
                   style={{ width: '3rem', height: '1.5rem', cursor: 'pointer' }}
                   checked={is2FAEnabled}
                   onChange={handleToggle2FA}
                 />
               </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* User Roles */}
      <div className="glass-card p-4 border-0 mb-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-people-fill text-info"></i> Phân quyền Người dùng
        </h5>
        <div className="table-responsive">
          <table className="table table-modern align-middle">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Vai trò hiện tại</th>
                <th>Điều chỉnh quyền</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="fw-bold">{user.username}</div>
                    <div className="text-muted small">ID: {user.id}</div>
                  </td>
                  <td>
                    <span className={`badge-modern ${
                      user.role === 'admin' ? 'bg-danger-subtle text-danger' : 
                      user.role === 'seller' ? 'bg-primary-subtle text-primary' : 'bg-success-subtle text-success'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <select
                      className="form-select border-0 bg-light rounded-3 py-1"
                      style={{ maxWidth: '150px' }}
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="admin">Quản trị viên</option>
                      <option value="user">Người mua</option>
                      <option value="seller">Người bán</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Access Logs */}
      <div className="glass-card p-4 border-0">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-muted"></i> Nhật ký hoạt động
        </h5>
        <div className="table-responsive">
          <table className="table table-modern table-sm">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hành động</th>
                <th>Người thực hiện</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(-10).reverse().map((log, index) => (
                <tr key={index}>
                  <td><div className="text-muted small">{new Date(log.timestamp).toLocaleString()}</div></td>
                  <td><span className="fw-bold text-dark small">{log.action}</span></td>
                  <td><span className="text-primary small">{log.user}</span></td>
                  <td><div className="text-muted x-small text-truncate" style={{ maxWidth: 300 }}>{log.details}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;