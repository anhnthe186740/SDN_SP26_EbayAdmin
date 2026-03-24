import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import EditUserModal from "../components/EditUserModal";
import AddUserModal from "../components/AddUserModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import { userService } from "../services/api";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    userService.getAll()
      .then((res) => setUsers(res.data));
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
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quản lý người dùng</h2>
          <p className="text-muted small">Quản lý tài khoản, vai trò và bảo mật hệ thống.</p>
        </div>
        <button className="btn-modern btn-modern-primary shadow-sm" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus-fill"></i> Thêm người dùng mới
        </button>
      </div>

      <div className="glass-card p-4 mb-4 border-0">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                className="form-control border-0 bg-transparent py-2"
                placeholder="Tìm kiếm theo tên, tài khoản hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              className="form-select border-0 bg-light rounded-3 py-2"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="All">Tất cả vai trò</option>
              <option value="admin">Quản trị viên</option>
              <option value="seller">Người bán</option>
              <option value="user">Người mua</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-modern">
          <thead>
            <tr>
              <th>ID</th>
              <th>Thông tin người dùng</th>
              <th>Tài khoản</th>
              <th>Vai trò</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user, index) => (
              <tr key={user.id}>
                <td className="text-muted fw-medium">#{user.id.toString().slice(-4)}</td>
                <td>
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white" 
                         style={{ width: 40, height: 40, background: 'var(--primary-gradient)', fontSize: '0.8rem' }}>
                      {user.fullname?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <div className="fw-bold">{user.fullname}</div>
                      <div className="text-muted small">{user.email || "Chưa cập nhật email"}</div>
                    </div>
                  </div>
                </td>
                <td><code className="text-primary bg-light px-2 py-1 rounded">{user.username}</code></td>
                <td>
                  <span className={`badge-modern ${
                    user.role === 'admin' ? 'text-danger bg-danger-subtle' : 
                    user.role === 'seller' ? 'text-primary bg-primary-subtle' : 'text-success bg-success-subtle'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <div className="d-flex justify-content-end gap-2">
                    <button className="btn-modern btn-sm bg-light text-dark" onClick={() => handleEditUser(user)}>
                      <i className="bi bi-pencil-square me-1"></i> Sửa
                    </button>
                    <button className="btn-modern btn-sm bg-light text-muted" onClick={() => handleChangePassword(user)}>
                      <i className="bi bi-shield-lock me-1"></i> Khóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
