import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";
import { userService, genericService } from "../services/api";

// 1. CHUẨN HÓA TRẠNG THÁI (Đã bổ sung 'requested' và ép không xuống dòng)
const STATUS_MAP = {
  pending: { label: "⏳ Chờ xét duyệt", color: "bg-warning-subtle text-warning" },
  requested: { label: "⏳ Chờ xét duyệt", color: "bg-warning-subtle text-warning" }, // THÊM DÒNG NÀY
  approved: { label: "✅ Đã chấp nhận", color: "bg-success-subtle text-success" },
  rejected: { label: "❌ Đã từ chối", color: "bg-danger-subtle text-danger" }
};

const ReturnManagementPage = () => {
  const [returns, setReturns] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ⚠️ CHÚ Ý: Nếu DB của bạn tên là "return" (không có s), hãy đổi chữ 'returns' ở đây thành 'return'
  const returnService = genericService('returnrequests');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [returnsRes, usersRes] = await Promise.all([
          returnService.getAll(),
          userService.getAll()
        ]);

        // 🚨 MÁY DÒ LỖI: In ra màn hình xem Server có gửi dữ liệu về không
        console.log("🚀 DỮ LIỆU TRẢ HÀNG TỪ SERVER:", returnsRes.data);

        // Chống lỗi nếu server trả về undefined
        if (returnsRes.data && Array.isArray(returnsRes.data)) {
          const sortedReturns = returnsRes.data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
          setReturns(sortedReturns);
        } else {
          setReturns([]);
        }

        setUsers(usersRes.data || []);
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu trả hàng:", err);
      }
    };
    fetchData();
  }, []);

  const getUserName = (id) => users.find((u) => String(u.id) === String(id))?.fullname || "Người dùng ẩn danh";

  const handleUpdateStatus = (id, newStatus) => {
    const currentReturn = returns.find(r => r.id === id);
    if (!currentReturn) return;

    let actionName = newStatus === 'approved' ? 'Chấp nhận trả hàng' : 'Từ chối trả hàng';
    if (!window.confirm(`Bạn có chắc chắn muốn [${actionName}] cho yêu cầu #${id.toString().slice(-4)}?`)) {
      return;
    }

    const payload = { ...currentReturn, status: newStatus };
    delete payload._id;
    delete payload.__v;

    returnService.update(id, payload)
      .then(() => {
        setReturns(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
        setShowModal(false);
      })
      .catch(err => {
        console.error("Lỗi khi cập nhật trạng thái:", err);
        alert("Lỗi hệ thống! Không thể cập nhật trạng thái.");
      });
  };

  const handleViewDetails = (returnItem) => {
    setSelectedReturn(returnItem);
    setShowModal(true);
  };

  // 🛠 ĐÃ VÁ LỖI LOGIC LỌC TẠI ĐÂY: Chống sập khi thiếu trường status
  // 🛠 ĐÃ VÁ LỖI LOGIC LỌC TẠI ĐÂY: Đồng bộ 'pending' và 'requested'
  const filteredReturns = returns.filter((r) => {
    const userName = getUserName(r.userId).toLowerCase();
    const orderId = String(r.orderId || "").toLowerCase();
    const searchTerm = search.toLowerCase();
    
    const matchSearch = userName.includes(searchTerm) || orderId.includes(searchTerm);
    
    // Nếu r.status bị rỗng, mặc định coi nó là "requested"
    const currentStatus = (r.status || "requested").toLowerCase();
    
    // Logic mới: Nếu user chọn "pending" ở bộ lọc thì lấy luôn cả "requested" trong DB
    const matchStatus = 
      statusFilter === "All" || 
      currentStatus === statusFilter.toLowerCase() ||
      (statusFilter === "pending" && currentStatus === "requested");
    
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage);
  const currentReturns = filteredReturns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Xét duyệt hoàn trả đơn hàng</h2>
        <p className="text-muted small">Quản lý và xử lý các yêu cầu hoàn trả sản phẩm từ khách hàng.</p>
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
              <option value="All">Tất cả yêu cầu</option>
              <option value="pending">⏳ Chờ xét duyệt</option>
              <option value="approved">✅ Đã chấp nhận</option>
              <option value="rejected">❌ Đã từ chối</option>
            </select>
          </div>
          <div className="col-md-8">
            <label className="form-label text-muted small fw-bold text-uppercase">Tìm kiếm nhanh</label>
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                className="form-control border-0 bg-transparent py-2 shadow-none"
                placeholder="Nhập Tên khách hàng hoặc Mã đơn hàng..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-3 border-0 shadow-sm bg-white overflow-hidden">
        <div className="table-responsive">
          <table className="table table-modern align-middle mb-0">
            <thead>
              <tr>
                <th className="text-muted text-uppercase small" style={{ width: '8%' }}>ID</th>
                <th className="text-muted text-uppercase small" style={{ width: '15%' }}>Mã Đơn</th>
                <th className="text-muted text-uppercase small" style={{ width: '25%' }}>Khách hàng</th>
                <th className="text-muted text-uppercase small" style={{ width: '25%' }}>Lý do</th>
                <th className="text-muted text-uppercase small text-center" style={{ width: '15%' }}>Trạng thái</th>
                <th className="text-end text-muted text-uppercase small" style={{ width: '12%' }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {currentReturns.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">Không có yêu cầu trả hàng nào.</td></tr>
              ) : currentReturns.map((r) => {
                const rStatus = r.status ? r.status.toLowerCase() : 'pending';
                const statusInfo = STATUS_MAP[rStatus] || { label: r.status, color: "bg-light text-dark" };

                return (
                  <tr key={r.id}>
                    <td><span className="fw-bold text-dark">#{String(r.id).slice(-4).toUpperCase()}</span></td>
                    <td>
                      <code className="bg-light px-2 py-1 rounded text-dark border shadow-sm">
                        #{String(r.orderId).slice(-4).toUpperCase()}
                      </code>
                    </td>
                    <td>
                      <div className="fw-bold text-primary">{getUserName(r.userId)}</div>
                    </td>
                    <td>
                      <div className="text-dark text-truncate" style={{ maxWidth: '200px' }} title={r.reason}>
                        {r.reason || "Không ghi rõ lý do"}
                      </div>
                    </td>
                    <td className="text-center text-nowrap">
                      <span
                        className={`badge-modern ${statusInfo.color} fw-bold`}
                        style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="text-end text-nowrap">
                      <button
                        className="btn-modern btn-sm bg-light text-primary border shadow-sm hover-elevate px-3"
                        onClick={() => handleViewDetails(r)}
                      >
                        <i className="bi bi-eye-fill me-1"></i> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

      {/* MODAL CHI TIẾT */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold"><i className="bi bi-box-arrow-left text-primary me-2"></i>Chi tiết Yêu cầu Hoàn trả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedReturn && (
            <div className="bg-light p-4 rounded-4 border">
              <div className="d-flex justify-content-between border-bottom pb-3 mb-3">
                <div>
                  <span className="d-block small text-muted text-uppercase fw-bold mb-1">Mã Yêu Cầu</span>
                  <span className="fs-5 fw-bold text-dark">#{String(selectedReturn.id).slice(-4).toUpperCase()}</span>
                </div>
                <div className="text-end">
                  <span className="d-block small text-muted text-uppercase fw-bold mb-1">Mã Đơn Hàng</span>
                  <code className="bg-white px-2 py-1 border rounded text-dark fs-6">#{String(selectedReturn.orderId).slice(-4).toUpperCase()}</code>
                </div>
              </div>

              <div className="mb-3">
                <span className="d-block small text-muted text-uppercase fw-bold mb-1"><i className="bi bi-person-fill me-1"></i>Khách hàng</span>
                <span className="fw-bold text-primary fs-6">{getUserName(selectedReturn.userId)}</span>
              </div>

              <div className="mb-4">
                <span className="d-block small text-muted text-uppercase fw-bold mb-2"><i className="bi bi-chat-left-text-fill me-1"></i>Lý do hoàn trả</span>
                <div className="bg-white p-3 rounded-3 border text-dark">
                  {selectedReturn.reason || "Khách hàng không cung cấp lý do chi tiết."}
                </div>
              </div>

              <div className="text-center pt-2">
                <span className="small fw-bold text-muted text-uppercase d-block mb-2">Trạng thái hiện tại</span>
                <span className={`badge-modern px-4 py-2 fs-6 ${STATUS_MAP[selectedReturn.status?.toLowerCase() || 'pending'].color}`}>
                  {STATUS_MAP[selectedReturn.status?.toLowerCase() || 'pending'].label}
                </span>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 justify-content-center pb-4">
          {selectedReturn && (!selectedReturn.status || selectedReturn.status.toLowerCase() === 'pending') ? (
            <div className="d-flex gap-3 w-100 px-3">
              <Button variant="danger" className="flex-grow-1 fw-bold rounded-pill py-2 shadow-sm" onClick={() => handleUpdateStatus(selectedReturn.id, 'rejected')}>
                <i className="bi bi-x-circle me-1"></i> Từ chối
              </Button>
              <Button variant="success" className="flex-grow-1 fw-bold rounded-pill py-2 shadow-sm" onClick={() => handleUpdateStatus(selectedReturn.id, 'approved')}>
                <i className="bi bi-check-circle me-1"></i> Chấp nhận
              </Button>
            </div>
          ) : (
            <Button variant="light" className="w-100 fw-bold rounded-pill py-2 text-muted border shadow-sm mx-3 hover-elevate" onClick={() => setShowModal(false)}>
              Đóng cửa sổ
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReturnManagementPage;