import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { userService, genericService } from "../services/api";

// 1. RÚT GỌN TỪ NGỮ ĐỂ TRÁNH TRÀN KHUNG (UI GỌN GÀNG HƠN)
const STATUS_MAP = {
  pending: { label: "⏳ Đang xử lý", color: "bg-warning-subtle text-warning" },
  resolved: { label: "✅ Đã giải quyết", color: "bg-success-subtle text-success" },
  closed: { label: "❌ Đã từ chối", color: "bg-danger-subtle text-danger" }
};

const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const DisputeManagementPage = () => {
  const [disputes, setDisputes] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const disputeService = genericService('disputes');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [disputesRes, usersRes] = await Promise.all([
          disputeService.getAll(),
          userService.getAll()
        ]);
        const sortedDisputes = disputesRes.data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setDisputes(sortedDisputes);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu khiếu nại:", err);
      }
    };
    fetchData();
  }, []);

  const getUserName = (id) => users.find((u) => String(u.id) === String(id))?.fullname || "Người dùng ẩn danh";

  const handleUpdateStatus = (id, newStatus) => {
    const currentDispute = disputes.find(d => d.id === id);
    if (!currentDispute) return;

    let actionName = newStatus === 'resolved' ? 'Giải quyết & Hoàn tiền' : 'Từ chối & Đóng khiếu nại';
    if (!window.confirm(`Bạn có chắc chắn muốn [${actionName}] cho khiếu nại #${id.toString().slice(-4)} này? Hành động này không thể hoàn tác.`)) {
      return;
    }

    const payload = { ...currentDispute, status: newStatus };
    delete payload._id;
    delete payload.__v;

    disputeService.update(id, payload)
      .then(() => {
        setDisputes(prev => prev.map(d => d.id === id ? { ...d, status: newStatus } : d));
      })
      .catch(err => {
        console.error("Lỗi khi cập nhật khiếu nại:", err);
        alert("Không thể cập nhật trạng thái! Vui lòng kiểm tra lại kết nối.");
      });
  };

  const filteredDisputes = disputes.filter((d) => {
    const userName = getUserName(d.userId).toLowerCase();
    const orderId = String(d.orderId).toLowerCase();
    const disputeId = String(d.id).toLowerCase();
    
    const matchSearch = userName.includes(search.toLowerCase()) || orderId.includes(search.toLowerCase()) || disputeId.includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || d.status === statusFilter;
    
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredDisputes.length / itemsPerPage);
  const currentDisputes = filteredDisputes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Khiếu nại & Tranh chấp</h2>
        <p className="text-muted small">Giải quyết các vấn đề giữa người mua và người bán để đảm bảo uy tín sàn.</p>
      </div>

      <div className="glass-card p-4 mb-4 border-0 shadow-sm bg-white">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold text-uppercase">Lọc trạng thái</label>
            <select
              className="form-select border-0 bg-light rounded-3 py-2 shadow-none fw-medium"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">Tất cả khiếu nại</option>
              <option value="pending">⏳ Đang chờ xử lý</option>
              <option value="resolved">✅ Đã giải quyết</option>
              <option value="closed">❌ Đã từ chối</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label text-muted small fw-bold text-uppercase">Tìm kiếm nhanh</label>
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                className="form-control border-0 bg-transparent py-2 shadow-none"
                placeholder="Nhập ID khiếu nại, Tên người dùng, hoặc Mã đơn hàng..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive glass-card p-3 border-0 shadow-sm bg-white">
        <table className="table table-modern align-middle mb-0">
          <thead>
            {/* 2. CHIA TỈ LỆ WIDTH RÕ RÀNG ĐỂ CÁC CỘT KHÔNG TRANH GIÀNH NHAU */}
            <tr>
              <th className="text-muted text-uppercase small" style={{ width: '5%' }}>ID</th>
              <th className="text-muted text-uppercase small" style={{ width: '20%' }}>Người dùng</th>
              <th className="text-muted text-uppercase small" style={{ width: '10%' }}>Mã đơn</th>
              <th className="text-muted text-uppercase small" style={{ width: '25%', minWidth: '180px' }}>Lý do & Số tiền</th>
              <th className="text-muted text-uppercase small text-nowrap" style={{ width: '15%' }}>Ngày gửi</th>
              <th className="text-muted text-uppercase small text-center text-nowrap" style={{ width: '12%' }}>Trạng thái</th>
              <th className="text-end text-muted text-uppercase small text-nowrap" style={{ width: '13%' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentDisputes.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-5 text-muted fst-italic">Không có khiếu nại nào phù hợp.</td></tr>
            ) : currentDisputes.map((d) => {
              const statusInfo = STATUS_MAP[d.status?.toLowerCase()] || { label: d.status, color: "bg-light text-dark" };
              const isResolvedOrClosed = ['resolved', 'closed'].includes(d.status?.toLowerCase());

              return (
                <tr key={d.id} className={isResolvedOrClosed ? "opacity-75 bg-light" : ""}>
                  <td><span className="fw-bold text-dark">#{String(d.id).slice(-4).toUpperCase()}</span></td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                      <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                        {getUserName(d.userId).charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '140px' }} title={getUserName(d.userId)}>
                          {getUserName(d.userId)}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Bên khiếu nại</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <code className="bg-white px-2 py-1 rounded text-dark border shadow-sm">
                      #{String(d.orderId).slice(-4).toUpperCase()}
                    </code>
                  </td>
                  <td>
                    <div className="fw-bold text-dark text-wrap">{d.reason || d.title || "Lý do không xác định"}</div>
                    {d.amount && (
                      <div className="text-danger small fw-bold mt-1">
                        Hoàn tiền: ${d.amount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  {/* 3. THÊM text-nowrap ĐỂ CHỐNG XUỐNG DÒNG LỘN XỘN */}
                  <td className="text-nowrap">
                    <div className="text-muted small"><i className="bi bi-clock me-1"></i>{formatDate(d.createdAt || d.date)}</div>
                  </td>
                  <td className="text-center text-nowrap">
                    <span className={`badge-modern ${statusInfo.color} fw-bold`} style={{ fontSize: '0.75rem' }}>
                      {statusInfo.label}
                    </span>
                  </td>
                  <td className="text-end text-nowrap">
                    {!isResolvedOrClosed ? (
                      <div className="d-flex justify-content-end gap-2 flex-nowrap">
                        <button 
                          className="btn-modern btn-sm bg-success-subtle text-success border-0 shadow-sm text-nowrap px-2"
                          onClick={() => handleUpdateStatus(d.id, 'resolved')}
                          title="Hoàn tiền"
                        >
                          <i className="bi bi-check-lg fw-bold"></i> Xử lý
                        </button>
                        <button 
                          className="btn-modern btn-sm bg-danger-subtle text-danger border-0 shadow-sm text-nowrap px-2"
                          onClick={() => handleUpdateStatus(d.id, 'closed')}
                          title="Từ chối"
                        >
                          <i className="bi bi-x-lg fw-bold"></i> Đóng
                        </button>
                      </div>
                    ) : (
                      <span className="badge bg-white text-muted border px-3 py-2 shadow-sm text-nowrap">
                        <i className="bi bi-lock-fill me-1"></i> Đã chốt
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
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
    </div>
  );
};

export default DisputeManagementPage;