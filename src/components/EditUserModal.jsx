import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { userService } from "../services/api";

const EditUserModal = ({ show, onHide, user, onSave }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    role: "user"
  });

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || "",
        username: user.username || "",
        email: user.email || "",
        role: user.role || "user",
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    userService.update(user.id, formData)
      .then((res) => {
        onSave(res.data);
        onHide();
      })
      .catch(err => {
        console.error("Lỗi cập nhật người dùng:", err);
        alert("Không thể cập nhật thông tin!");
      });
  };

  // LOGIC BẢO MẬT: Khóa việc sửa Role nếu người đó là Admin
  const isEditingAdmin = user?.role === "admin";

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Chỉnh sửa thông tin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Họ tên</Form.Label>
            <Form.Control type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="bg-light border-0 py-2" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Tài khoản</Form.Label>
            <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} className="bg-light border-0 py-2" disabled title="Không thể đổi tên đăng nhập" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} className="bg-light border-0 py-2" />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase d-flex justify-content-between">
              <span>Vai trò</span>
              {isEditingAdmin && <span className="text-danger x-small"><i className="bi bi-shield-lock-fill"></i> Không thể giáng chức Admin</span>}
            </Form.Label>
            <Form.Select 
              name="role" 
              value={formData.role} 
              onChange={handleChange} 
              className="bg-light border-0 py-2"
              disabled={isEditingAdmin} // Khóa Dropdown nếu là Admin
            >
              {isEditingAdmin && <option value="admin">Quản trị viên (Admin)</option>}
              <option value="seller">Người bán (Seller)</option>
              <option value="user">Người mua (User)</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} className="text-muted fw-bold">Hủy</Button>
        <Button variant="primary" onClick={handleSubmit} className="px-4 fw-bold">Lưu thay đổi</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUserModal;