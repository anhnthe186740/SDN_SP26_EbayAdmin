import React, { useState } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { userService } from "../services/api";

const AddUserModal = ({ show, onHide, onSave, existingUsers }) => {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    password: "",
    email: "",
    role: "user",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Xóa lỗi khi người dùng bắt đầu gõ lại
  };

  const validateForm = () => {
    // 1. Validate độ dài và định dạng
    if (!formData.fullname.trim()) return "Họ tên không được để trống.";
    
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(formData.username)) {
      return "Tên đăng nhập viết liền không dấu, không chứa khoảng trắng hay ký tự đặc biệt.";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return "Email không đúng định dạng (VD: example@gmail.com).";
    }

    if (formData.password.length < 6) {
      return "Mật khẩu phải có ít nhất 6 ký tự để đảm bảo bảo mật.";
    }

    // 2. Validate tính duy nhất (Không trùng lặp với dữ liệu cũ)
    const isUsernameTaken = existingUsers.some(u => u.username.toLowerCase() === formData.username.toLowerCase());
    if (isUsernameTaken) return `Tên đăng nhập "${formData.username}" đã tồn tại!`;

    const isEmailTaken = existingUsers.some(u => u.email && u.email.toLowerCase() === formData.email.toLowerCase());
    if (isEmailTaken) return `Email "${formData.email}" đã được sử dụng cho một tài khoản khác!`;

    return null; // Không có lỗi
  };

  const handleSubmit = () => {
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    // Thêm trường isActive mặc định là true khi tạo mới
    const newUserPayload = { ...formData, isActive: true };

    userService.create(newUserPayload)
      .then((res) => {
        onSave(res.data);
        onHide();
        setFormData({ fullname: "", username: "", password: "", email: "", role: "user" });
      })
      .catch(err => {
        console.error("Lỗi thêm người dùng:", err);
        setError("Lỗi máy chủ! Không thể thêm người dùng mới.");
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold">Thêm người dùng mới</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger" className="py-2 small fw-bold"><i className="bi bi-exclamation-triangle-fill me-2"></i>{error}</Alert>}
        <Form>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Họ tên</Form.Label>
            <Form.Control type="text" name="fullname" value={formData.fullname} onChange={handleChange} className="bg-light border-0 py-2" placeholder="VD: Nguyễn Văn A"/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Tài khoản</Form.Label>
            <Form.Control type="text" name="username" value={formData.username} onChange={handleChange} className="bg-light border-0 py-2" placeholder="VD: nguyenvana_01"/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Email</Form.Label>
            <Form.Control type="email" name="email" value={formData.email} onChange={handleChange} className="bg-light border-0 py-2" placeholder="VD: nguyenvana@gmail.com"/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Mật khẩu (Tối thiểu 6 ký tự)</Form.Label>
            <Form.Control type="password" name="password" value={formData.password} onChange={handleChange} className="bg-light border-0 py-2" placeholder="Nhập mật khẩu..."/>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="fw-medium small text-muted text-uppercase">Vai trò</Form.Label>
            <Form.Select name="role" value={formData.role} onChange={handleChange} className="bg-light border-0 py-2">
              <option value="user">Người mua (User)</option>
              <option value="seller">Người bán (Seller)</option>
              <option value="admin">Quản trị viên (Admin)</option>
            </Form.Select>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" onClick={onHide} className="text-muted fw-bold">Hủy</Button>
        <Button variant="primary" onClick={handleSubmit} className="px-4 fw-bold" disabled={isLoading}>
          {isLoading ? "Đang xử lý..." : "Thêm tài khoản"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddUserModal;