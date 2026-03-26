import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { reviewService, productService, userService, genericService } from "../services/api";

// Hàm hỗ trợ format ngày tháng
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const AdminReviewList = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  
  // Các State cho Bộ lọc (Filters)
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All"); // THÊM BỘ LỌC TRẠNG THÁI

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 5;

  // Sử dụng genericService để gọi lệnh PUT chuẩn xác
  const reviewPutService = genericService('reviews');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, productsRes, usersRes] = await Promise.all([
          reviewService.getAll(),
          productService.getAll(),
          userService.getAll(),
        ]);
        const sortedReviews = reviewsRes.data.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setReviews(sortedReviews);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đánh giá:", err);
      }
    };
    fetchData();
  }, []);

  const getProductTitle = (id) => products.find((p) => String(p.id) === String(id))?.title || "Sản phẩm không tồn tại";
  const getProductImage = (id) => {
    const product = products.find((p) => String(p.id) === String(id));
    return product?.images?.[0] || null;
  };
  const getUserName = (id) => users.find((u) => String(u.id) === String(id))?.fullname || "Người dùng ẩn danh";

  // LOGIC LỌC DỮ LIỆU KẾP HỢP (KẾT HỢP 3 BỘ LỌC)
  const filteredReviews = reviews.filter((r) => {
    const productName = getProductTitle(r.productId).toLowerCase();
    const userName = getUserName(r.reviewerId).toLowerCase();
    
    // 1. Lọc theo chữ
    const matchSearch = productName.includes(search.toLowerCase()) || userName.includes(search.toLowerCase());
    
    // 2. Lọc theo số sao
    const matchStar = starFilter === "All" || String(r.rating) === starFilter;
    
    // 3. Lọc theo trạng thái vi phạm
    let matchStatus = true;
    if (statusFilter === "Normal") matchStatus = !r.flagged; // Chỉ lấy bài hợp lệ
    if (statusFilter === "Flagged") matchStatus = r.flagged === true; // Chỉ lấy bài vi phạm

    return matchSearch && matchStar && matchStatus;
  });

  const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
  const currentReviews = filteredReviews.slice((currentPage - 1) * reviewsPerPage, currentPage * reviewsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const toggleFlag = (id, currentFlagged) => {
    const confirmMsg = currentFlagged 
      ? "Bạn muốn gỡ cờ (Bỏ đánh dấu vi phạm) cho đánh giá này?" 
      : "Bạn muốn đánh dấu vi phạm và ẨN đánh giá này?";
      
    if (!window.confirm(confirmMsg)) return;

    const currentReview = reviews.find(r => r.id === id);
    if (!currentReview) return;

    const payload = { ...currentReview, flagged: !currentFlagged };
    delete payload._id;
    delete payload.__v;

    reviewPutService.update(id, payload)
      .then(() => {
        setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, flagged: !currentFlagged } : r)));
      })
      .catch(err => {
        console.error("Lỗi khi thay đổi flag:", err);
        alert("Không thể cập nhật trạng thái kiểm duyệt! Vui lòng kiểm tra lại kết nối.");
      });
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i key={i} className={`bi bi-star-fill ${i <= rating ? 'text-warning' : 'text-secondary opacity-25'}`} style={{ fontSize: '0.85rem', marginRight: '2px' }}></i>
      );
    }
    return stars;
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Giám sát Đánh giá & Phản hồi</h2>
        <p className="text-muted small">Quản lý, kiểm duyệt và đánh dấu vi phạm các đánh giá của người dùng.</p>
      </div>

      <div className="glass-card p-4 mb-4 border-0 shadow-sm bg-white">
        {/* CẬP NHẬT GRID LAYOUT ĐỂ CHỨA 3 BỘ LỌC */}
        <div className="row g-3">
          <div className="col-md-5">
            <label className="form-label text-muted small fw-bold text-uppercase">Tìm kiếm đánh giá</label>
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                className="form-control border-0 bg-transparent py-2 shadow-none"
                placeholder="Tên sản phẩm hoặc người dùng..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold text-uppercase">Trạng thái kiểm duyệt</label>
            <select
              className="form-select border-0 bg-light rounded-3 py-2 shadow-none fw-medium"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">Tất cả trạng thái</option>
              <option value="Normal">✅ Hợp lệ (Đang hiển thị)</option>
              <option value="Flagged">👁‍🗨 Vi phạm (Đã ẩn)</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted small fw-bold text-uppercase">Lọc theo sao</label>
            <select
              className="form-select border-0 bg-light rounded-3 py-2 shadow-none fw-medium"
              value={starFilter}
              onChange={(e) => { setStarFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="All">Tất cả sao</option>
              <option value="5">5 Sao (Tuyệt vời)</option>
              <option value="4">4 Sao (Tốt)</option>
              <option value="3">3 Sao (Bình)</option>
              <option value="2">2 Sao (Kém)</option>
              <option value="1">1 Sao (Tệ)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive glass-card p-3 border-0 shadow-sm bg-white">
        <table className="table table-modern align-middle mb-0">
          <thead>
            <tr>
              <th className="text-muted text-uppercase small">Sản phẩm</th>
              <th className="text-muted text-uppercase small">Người dùng</th>
              <th className="text-muted text-uppercase small">Đánh giá</th>
              <th className="text-muted text-uppercase small" style={{ minWidth: '250px' }}>Bình luận</th>
              <th className="text-muted text-uppercase small text-center">Tương tác</th>
              <th className="text-end text-muted text-uppercase small">Kiểm duyệt</th>
            </tr>
          </thead>
          <tbody>
            {currentReviews.length === 0 ? (
              <tr><td colSpan="6" className="text-center py-5 text-muted fst-italic">Không có đánh giá nào phù hợp với bộ lọc.</td></tr>
            ) : currentReviews.map((r) => {
              const isFlagged = r.flagged;
              
              return (
                <tr key={r.id} className={isFlagged ? "opacity-75 bg-light" : ""}>
                  <td>
                    <div className="d-flex align-items-center gap-3">
                      <div className="rounded-3 overflow-hidden border bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48 }}>
                        {getProductImage(r.productId) ? (
                          <img src={getProductImage(r.productId)} alt="product" className="w-100 h-100 object-fit-contain p-1" />
                        ) : <i className="bi bi-box-seam text-muted"></i>}
                      </div>
                      <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 150 }} title={getProductTitle(r.productId)}>
                        {getProductTitle(r.productId)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex align-items-center gap-2">
                       <div className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                          {getUserName(r.reviewerId).charAt(0).toUpperCase()}
                       </div>
                       <div>
                         <div className="fw-bold text-dark">{getUserName(r.reviewerId)}</div>
                         <div className="text-muted" style={{ fontSize: '0.75rem' }}>{formatDate(r.createdAt || r.date)}</div>
                       </div>
                    </div>
                  </td>
                  <td>
                    <div className="d-flex flex-column">
                      <div>{renderStars(r.rating)}</div>
                      <span className={`badge mt-1 w-auto align-self-start ${r.rating >= 4 ? 'bg-success-subtle text-success' : r.rating === 3 ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                        {r.rating} / 5
                      </span>
                    </div>
                  </td>
                  <td>
                     <div className={`small text-wrap ${isFlagged ? 'text-decoration-line-through text-danger' : 'text-dark fw-medium'}`} style={{ maxWidth: 300 }}>
                        {isFlagged ? "Nội dung đã bị ẩn do vi phạm tiêu chuẩn cộng đồng." : (r.comment || "Không có bình luận.")}
                     </div>
                  </td>
                  <td className="text-center">
                    <span className="badge bg-light text-secondary border rounded-pill px-3 py-2">
                      <i className="bi bi-hand-thumbs-up-fill me-1"></i> {r.helpfulVotes || 0}
                    </span>
                  </td>
                  <td className="text-end">
                    {/* Đã cập nhật Text và Icon cho nút bấm */}
                    <button
                      className={`btn-modern btn-sm border-0 shadow-sm hover-elevate px-3 py-2 ${isFlagged ? "bg-danger text-white" : "bg-light text-danger fw-medium"}`}
                      onClick={() => toggleFlag(r.id, isFlagged)}
                      title={isFlagged ? "Khôi phục lại đánh giá này" : "Đánh dấu vi phạm và Ẩn đánh giá"}
                    >
                      {isFlagged ? (
                        <><i className="bi bi-eye-slash-fill me-1"></i> Đã ẩn</>
                      ) : (
                        <><i className="bi bi-exclamation-triangle me-1"></i> Vi phạm</>
                      )}
                    </button>
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

export default AdminReviewList;