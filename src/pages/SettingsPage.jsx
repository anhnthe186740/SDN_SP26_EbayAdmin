import React, { useState, useEffect } from "react";
import { Container, Card, Form, Button, Table, Row, Col } from "react-bootstrap";
import axios from "axios";
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
    const url = process.env.REACT_APP_API_PATH;
    // Fetch Admin Data (IP and 2FA)
    axios
      .get(`${url}/admins/${loggedInAdminId}`)
      .then((res) => {
        setAdminIP(res.data.ip || "");
        setIs2FAEnabled(res.data["2fa"] || false);
      })
      .catch((err) => console.error("Error fetching admin data:", err));

    // Fetch All Users
    axios
      .get(`${url}/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error("Error fetching users:", err));

    // Fetch Logs
    axios
      .get(`${url}/logs`)
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("Error fetching logs:", err));
  }, []);

  // Update Admin IP
  const handleUpdateIP = () => {
    if (!newIP.trim() || !/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(newIP)) {
      alert("Vui lòng nhập IP hợp lệ (VD: 192.168.1.1)!");
      return;
    }
    const url = process.env.REACT_APP_API_PATH;
    axios
      .patch(`${url}/admins/${loggedInAdminId}`, { ip: newIP })
      .then((res) => {
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
    const url = process.env.REACT_APP_API_PATH;
    axios
      .patch(`${url}/admins/${loggedInAdminId}`, { "2fa": new2FAStatus })
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
    const url = process.env.REACT_APP_API_PATH;
    axios
      .patch(`${url}/users/${userId}`, { role: newRole })
      .then((res) => {
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
    const url = process.env.REACT_APP_API_PATH;
    axios
      .post(`${url}/logs`, {
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
    <Container className="my-5">
      <h2 className="mb-4 text-primary">Cài đặt Bảo mật & Phân quyền</h2>

      {/* Admin IP */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="text-primary">IP Admin</h5>
          <Form.Group className="mb-3">
            <Form.Label>IP nội bộ hiện tại: {adminIP || "Chưa thiết lập"}</Form.Label>
            <Row>
              <Col md={8}>
                <Form.Control
                  type="text"
                  placeholder="Nhập IP (VD: 192.168.1.1)"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                />
              </Col>
              <Col md={4}>
                <Button variant="success" onClick={handleUpdateIP}>
                  Cập nhật IP
                </Button>
              </Col>
            </Row>
          </Form.Group>
        </Card.Body>
      </Card>

      {/* 2FA Toggle */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="text-primary">Xác minh 2 bước (2FA)</h5>
          <Form.Check
            type="switch"
            label={is2FAEnabled ? "2FA đã bật" : "2FA đã tắt"}
            checked={is2FAEnabled}
            onChange={handleToggle2FA}
          />
        </Card.Body>
      </Card>

      {/* User Roles */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="text-primary">Phân quyền Người dùng</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Vai trò</th>
                <th>Thay đổi vai trò</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.username}</td>
                  <td>{user.role}</td>
                  <td>
                    <Form.Select
                      value={user.role}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                      <option value="seller">Seller</option>
                    </Form.Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {/* Access Logs */}
      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="text-primary">Lịch sử truy cập & hoạt động</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hành động</th>
                <th>Người dùng</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.user}</td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminSettingsPage;