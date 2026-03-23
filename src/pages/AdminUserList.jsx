import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import EditUserModal from "../components/EditUserModal";
import AddUserModal from "../components/AddUserModal";
import ChangePasswordModal from "../components/ChangePasswordModal";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    fetch(`${url}/users`)
      .then((res) => res.json())
      .then(setUsers);
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleChangePassword = (user) => {
    setEditingUser(user);
    setShowPasswordModal(true);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleAddUser = (newUser) => {
    setUsers((prev) => [...prev, newUser]);
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Quản lý người dùng</h2>
        <button className="btn btn-success" onClick={() => setShowAddModal(true)}>
          + Thêm người dùng
        </button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Tìm theo tên hoặc tài khoản"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="All">Tất cả vai trò</option>
            <option value="admin">Admin</option>
            <option value="seller">Người bán</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>STT</th>
            <th>Họ tên</th>
            <th>Tài khoản</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.map((user, index) => (
            <tr key={user.id}>
              <td>{index + 1}</td>
              <td>{user.fullname}</td>
              <td>{user.username}</td>
              <td>{user.email || "—"}</td>
              <td>{user.role}</td>
              <td>
                <button className="btn btn-warning btn-sm me-2" onClick={() => handleEditUser(user)}>
                  Chỉnh sửa
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleChangePassword(user)}>
                  Đổi mật khẩu
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <EditUserModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        user={editingUser}
        onSave={handleSaveUser}
      />

      <AddUserModal
        show={showAddModal}
        onHide={() => setShowAddModal(false)}
        onSave={handleAddUser}
      />

      <ChangePasswordModal
        show={showPasswordModal}
        onHide={() => setShowPasswordModal(false)}
        user={editingUser}
      />
    </div>
  );
};

export default AdminUserList;
