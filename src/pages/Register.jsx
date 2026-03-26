import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService, logService } from "../services/api";


function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullname, setFullname] = useState("");
  const [role] = useState("user");
  const [email, setEmail] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      // Kiểm tra username đã tồn tại chưa
      const res = await userService.getAll();
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
        email: email || null,
        avatarURL: null,
        ...(role === "admin" && {
          permissions: {
            monitor: false,
            support: false,
            superadmin: false
          }
        })
      };

      const userRes = await userService.create(newUser);

      // Ghi log đăng ký
      await logService.create({
        action: "register",
        user: username,
        timestamp: new Date().toISOString(),
        ip: window.location.hostname,
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
