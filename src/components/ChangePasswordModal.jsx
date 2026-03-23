import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";

const ChangePasswordModal = ({ show, onHide, user }) => {
  const [newPassword, setNewPassword] = useState("");

  const handleSubmit = () => {
    if (!newPassword.trim()) return alert("Vui lòng nhập mật khẩu mới");

    const url = process.env.REACT_APP_API_PATH;
    fetch(`${url}/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword }),
    })
      .then((res) => res.json())
      .then(() => {
        alert("Đổi mật khẩu thành công!");
        setNewPassword("");
        onHide();
      });
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Đổi mật khẩu</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Mật khẩu mới</Form.Label>
            <Form.Control
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Nhập mật khẩu mới..."
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Hủy
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Cập nhật
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ChangePasswordModal;
