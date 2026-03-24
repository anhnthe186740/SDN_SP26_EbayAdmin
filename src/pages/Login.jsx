import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { userService, logService } from "../services/api";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await userService.getAll();
      const users = res.data;

      const foundUser = users.find(
        (u) => u.username === username && u.password === password
      );

      if (foundUser) {
        localStorage.setItem("user", JSON.stringify(foundUser));
      
        // 📝 Ghi log đăng nhập
        await logService.create({
          action: "login",
          user: foundUser.username,
          timestamp: new Date().toISOString(),
          ip: "127.0.0.1",
          level: "info"
        });
      
        alert("Đăng nhập thành công!");
        if (foundUser.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        alert("Sai tên đăng nhập hoặc mật khẩu!");
      }
    } catch (err) {
      alert("Lỗi server. Vui lòng thử lại.");
      console.error(err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h3 className="text-center">Đăng nhập</h3>
      <form onSubmit={handleLogin}>
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
        <button className="btn btn-primary w-100" type="submit">
          Đăng nhập
        </button>
      </form>
      <p className="text-center mt-3">
        Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
      </p>
    </div>
  );
}

export default Login;