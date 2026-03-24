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

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Chỉnh sửa người dùng</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Họ tên</Form.Label>
            <Form.Control
              type="text"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tài khoản</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Vai trò</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="seller">Người bán</option>
              <option value="user">Người dùng</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Lưu thay đổi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EditUserModal;
