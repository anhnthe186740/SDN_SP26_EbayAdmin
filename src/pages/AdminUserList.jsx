import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import EditUserModal from "../components/EditUserModal";
import AddUserModal from "../components/AddUserModal";
import { userService } from "../services/api";

const AdminUserList = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Lấy thông tin Admin đang đăng nhập từ LocalStorage
  const currentUser = JSON.parse(localStorage.getItem("user"));

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    userService.getAll().then((res) => setUsers(res.data)).catch(console.error);
  }, []);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullname?.toLowerCase().includes(search.toLowerCase()) ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleSaveUser = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const handleAddUser = (newUser) => {
    setUsers((prev) => [newUser, ...prev]);
  };

  // --- LOGIC BẢO MẬT: RESET PASSWORD ---
  const handleResetPassword = (userToReset) => {
    if (userToReset.role === 'admin') {
      return alert("Lỗi bảo mật: Không thể đặt lại mật khẩu của Quản trị viên khác!");
    }
    if (window.confirm(`Bạn có chắc chắn muốn đặt lại mật khẩu của "${userToReset.username}" về mặc định (Ebay@12345)?`)) {
      userService.update(userToReset.id, { password: "Ebay@12345" })
        .then(() => alert("Thành công! Mật khẩu đã được đặt lại."))
        .catch(() => alert("Lỗi hệ thống khi đặt lại mật khẩu!"));
    }
  };

  // --- LOGIC BẢO MẬT: KHÓA / MỞ KHÓA TÀI KHOẢN ---
  const handleToggleBan = (userToToggle) => {
    if (userToToggle.role === 'admin') {
      return alert("Lỗi bảo mật: Không thể khóa tài khoản Quản trị viên khác!");
    }

    const isCurrentlyBanned = userToToggle.isActive === false;
    const actionName = isCurrentlyBanned ? "Mở khóa" : "Khóa (Cấm đăng nhập)";
    
    if (window.confirm(`CẢNH BÁO: Bạn muốn ${actionName} tài khoản "${userToToggle.username}"?`)) {
      const newStatus = isCurrentlyBanned ? true : false;
      userService.update(userToToggle.id, { isActive: newStatus })
        .then(() => {
          setUsers(prev => prev.map(u => u.id === userToToggle.id ? { ...u, isActive: newStatus } : u));
        })
        .catch(() => alert(`Không thể thực hiện hành động ${actionName}!`));
    }
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quản lý người dùng</h2>
          <p className="text-muted small">Quản lý tài khoản, vai trò và bảo mật hệ thống.</p>
        </div>
        <button className="btn-modern btn-modern-primary shadow-sm" onClick={() => setShowAddModal(true)}>
          <i className="bi bi-person-plus-fill me-2"></i>Thêm người dùng mới
        </button>
      </div>

      <div className="glass-card p-4 mb-4 border-0">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group bg-light rounded-3 overflow-hidden border-0 shadow-sm">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                className="form-control border-0 bg-transparent py-2 shadow-none"
                placeholder="Tìm kiếm theo tên, tài khoản hoặc email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select border-0 bg-light rounded-3 py-2 shadow-sm" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
              <option value="All">Tất cả vai trò</option>
              <option value="admin">Quản trị viên (Admin)</option>
              <option value="seller">Người bán (Seller)</option>
              <option value="user">Người mua (User)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive glass-card p-3 border-0">
        <table className="table table-modern align-middle mb-0">
          <thead>
            <tr>
              <th className="text-muted text-uppercase small">Thông tin người dùng</th>
              <th className="text-muted text-uppercase small">Tài khoản</th>
              <th className="text-muted text-uppercase small">Vai trò</th>
              <th className="text-muted text-uppercase small">Trạng thái</th>
              <th className="text-end text-muted text-uppercase small">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">Không tìm thấy người dùng nào phù hợp.</td></tr>
            ) : (
              currentUsers.map((user) => {
                // Kiểm tra xem dòng này có phải là tài khoản đang đăng nhập không (Chống tự sát)
                const isMe = currentUser && currentUser.username === user.username;
                const isBanned = user.isActive === false;

                return (
                  <tr key={user.id} className={isBanned ? "opacity-50" : ""}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className={`rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm ${isBanned ? 'bg-secondary' : ''}`} 
                             style={{ width: 42, height: 42, background: isBanned ? '' : 'var(--primary-gradient)', fontSize: '1rem' }}>
                          {user.fullname?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className={`fw-bold ${isBanned ? 'text-decoration-line-through text-muted' : 'text-dark'}`}>{user.fullname}</div>
                          <div className="text-muted small"><i className="bi bi-envelope me-1"></i>{user.email || "Chưa cập nhật email"}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className={`px-2 py-1 rounded fw-bold ${isBanned ? 'bg-secondary text-light' : 'bg-primary-subtle text-primary'}`}>
                        {user.username}
                      </code>
                    </td>
                    <td>
                      <span className={`badge-modern ${
                        user.role === 'admin' ? 'text-danger bg-danger-subtle' : 
                        user.role === 'seller' ? 'text-primary bg-primary-subtle' : 'text-success bg-success-subtle'
                      }`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {isBanned ? (
                        <span className="badge bg-danger rounded-pill"><i className="bi bi-lock-fill me-1"></i> Bị khóa</span>
                      ) : (
                        <span className="badge bg-success rounded-pill"><i className="bi bi-check-circle-fill me-1"></i> Hoạt động</span>
                      )}
                    </td>
                    <td>
                      {isMe ? (
                        // Giao diện khi đây là chính mình
                        <div className="text-end text-success small fw-bold fst-italic">
                          <i className="bi bi-person-badge me-1"></i> Tài khoản của bạn
                        </div>
                      ) : (
                        // Giao diện người khác (Cho phép thao tác)
                        <div className="d-flex justify-content-end gap-2">
                          <button className="btn-modern btn-sm bg-light text-primary border" onClick={() => handleEditUser(user)}>
                            <i className="bi bi-pencil-square"></i> Sửa
                          </button>
                          <button className="btn-modern btn-sm bg-warning-subtle text-dark border-0" onClick={() => handleResetPassword(user)} title="Đặt lại mật khẩu">
                            <i className="bi bi-arrow-counterclockwise"></i> Reset
                          </button>
                          <button 
                            className={`btn-modern btn-sm border-0 ${isBanned ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`} 
                            onClick={() => handleToggleBan(user)}
                          >
                            <i className={`bi ${isBanned ? 'bi-unlock-fill' : 'bi-lock-fill'}`}></i> {isBanned ? 'Mở khóa' : 'Khóa'}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-3">
          <nav>
            <ul className="pagination custom-pagination border-0 m-0">
              <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}><i className="bi bi-chevron-left"></i></button>
              </li>
              {Array.from({ length: totalPages }, (_, index) => (
                <li key={index + 1} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                  <button className="page-link" onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}><i className="bi bi-chevron-right"></i></button>
              </li>
            </ul>
          </nav>
        </div>
      )}

      {/* Truyền thêm existingUsers vào Add Modal để check trùng */}
      <AddUserModal show={showAddModal} onHide={() => setShowAddModal(false)} onSave={handleAddUser} existingUsers={users} />
      <EditUserModal show={showEditModal} onHide={() => setShowEditModal(false)} user={editingUser} onSave={handleSaveUser} />
    </div>
  );
};

export default AdminUserList;