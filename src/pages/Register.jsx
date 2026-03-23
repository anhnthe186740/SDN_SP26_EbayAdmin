// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";


function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [role, setRole] = useState("user");
  const [email, setEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const url = process.env.REACT_APP_API_PATH;
      // Kiểm tra username đã tồn tại chưa
      const res = await axios.get(`${url}/users`);
      const existingUser = res.data.find((user) => user.username === username);

      if (existingUser) {
        alert("Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.");
        return;
      }

      // Tạo user mới
      const newUser = {
        username,
        password,
        fullname,
        role,
        email: null,
        avatarURL: null,
        ...(role === "admin" && {
          permissions: {
            monitor: false,
            support: false,
            superadmin: false
          }
        })
      };

      const userRes = await axios.post(`${url}/users`, newUser);

      // Ghi log đăng ký
      await axios.post(`${url}/logs`, {
        action: "register",
        user: username,
        timestamp: new Date().toISOString(),
        ip: window.location.hostname, // hoặc IP giả định như "127.0.0.1"
        level: "info"
      });

      // Tự động đăng nhập
      localStorage.setItem("user", JSON.stringify(userRes.data));
      alert("Đăng ký thành công!");

      if (userRes.data.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      alert("Đăng ký thất bại. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center">Đăng ký tài khoản</h3>
      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label>Họ tên</label>
          <input
            type="text"
            className="form-control"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            className="form-control"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-3">
          <label>Mật khẩu</label>
          <input
            type="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {/* <div className="mb-3">
          <label>Vai trò</label>
          <select
            className="form-control"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="user">Người dùng</option>
            <option value="seller">Người bán hàng</option>
            <option value="admin">Admin</option>
          </select>
        </div> */}
        <button className="btn btn-success w-100" type="submit">
          Đăng ký
        </button>
      </form>
    </div>
  );
}

export default Register;
