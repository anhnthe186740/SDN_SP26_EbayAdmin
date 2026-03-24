import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { reviewService, productService, userService } from "../services/api";

const AdminReviewListExtended = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reviewsRes, productsRes, usersRes] = await Promise.all([
          reviewService.getAll(),
          productService.getAll(),
          userService.getAll(),
        ]);
        setReviews(reviewsRes.data);
        setProducts(productsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đánh giá:", err);
      }
    };
    fetchData();
  }, []);

  const getProductTitle = (id) =>
    products.find((p) => String(p.id) === String(id))?.title || "Unknown";

  const getUserName = (id) =>
    users.find((u) => String(u.id) === String(id))?.fullname || "Unknown";

  const filteredReviews = reviews.filter((r) => {
    const productName = getProductTitle(r.productId).toLowerCase();
    const userName = getUserName(r.reviewerId).toLowerCase();
    const matchSearch =
      productName.includes(search.toLowerCase()) ||
      userName.includes(search.toLowerCase());
    const matchStar = starFilter === "All" || String(r.rating) === starFilter;
    return matchSearch && matchStar;
  });

  const toggleFlag = (id, currentFlagged) => {
    reviewService.update(id, { flagged: !currentFlagged })
      .then(() => {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, flagged: !currentFlagged } : r))
        );
      })
      .catch(err => console.error("Lỗi khi thay đổi flag:", err));
  };

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Giám sát Đánh giá & Phản hồi</h2>
        <p className="text-muted small">Quản lý và kiểm duyệt các đánh giá của người dùng về sản phẩm.</p>
      </div>

      <div className="glass-card p-4 mb-4 border-0">
        <div className="row g-3">
          <div className="col-md-8">
            <label className="form-label text-muted small fw-bold text-uppercase">Tìm kiếm đánh giá</label>
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                className="form-control border-0 bg-transparent py-2"
                placeholder="Tên sản phẩm hoặc người dùng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold text-uppercase">Lọc theo sao</label>
            <select
              className="form-select border-0 bg-light rounded-3 py-2"
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
            >
              <option value="All">Tất cả sao</option>
              <option value="5">⭐⭐⭐⭐⭐ (5 sao)</option>
              <option value="4">⭐⭐⭐⭐ (4 sao)</option>
              <option value="3">⭐⭐⭐ (3 sao)</option>
              <option value="2">⭐⭐ (2 sao)</option>
              <option value="1">⭐ (1 sao)</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-modern align-middle">
          <thead>
            <tr>
              <th>Sản phẩm</th>
              <th>Người dùng</th>
              <th>Đánh giá</th>
              <th style={{ minWidth: '250px' }}>Bình luận</th>
              <th>Ngày</th>
              <th>Helpful</th>
              <th>Kiểm duyệt</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.length === 0 ? (
              <tr><td colSpan="7" className="text-center py-5 text-muted">Không có đánh giá nào.</td></tr>
            ) : filteredReviews.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="fw-bold text-dark text-truncate" style={{ maxWidth: 150 }} title={getProductTitle(r.productId)}>
                    {getProductTitle(r.productId)}
                  </div>
                </td>
                <td>
                  <div className="fw-medium text-primary">{getUserName(r.reviewerId)}</div>
                </td>
                <td>
                  <span className={`badge ${r.rating >= 4 ? 'bg-success' : r.rating === 3 ? 'bg-warning text-dark' : 'bg-danger'} rounded-pill`}>
                    {r.rating} <i className="bi bi-star-fill small"></i>
                  </span>
                </td>
                <td>
                   <div className="text-muted small text-wrap break-word" style={{ maxWidth: 300 }}>{r.comment}</div>
                </td>
                <td><div className="text-muted small">{r.createdAt}</div></td>
                <td><span className="badge bg-light text-dark shadow-sm border"><i className="bi bi-hand-thumbs-up-fill text-muted me-1"></i> {r.helpfulVotes}</span></td>
                <td>
                  <button
                    className={`btn-modern btn-sm ${r.flagged ? "bg-danger text-white" : "bg-light text-dark"}`}
                    onClick={() => toggleFlag(r.id, r.flagged)}
                  >
                    {r.flagged ? <><i className="bi bi-flag-fill"></i> Đã cắm cờ</> : <><i className="bi bi-flag"></i> Cắm cờ</>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReviewListExtended;
