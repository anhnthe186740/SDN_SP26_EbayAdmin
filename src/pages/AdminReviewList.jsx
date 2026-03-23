// Đã cập nhật ở Canvas trước đó, nhưng bạn có thể dùng lại đoạn này:
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminReviewListExtended = () => {
  const [reviews, setReviews] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [starFilter, setStarFilter] = useState("All");

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    Promise.all([
      fetch(`${url}/reviews`).then((res) => res.json()),
      fetch(`${url}/products`).then((res) => res.json()),
      fetch(`${url}/users`).then((res) => res.json()),
    ]).then(([reviewsData, productsData, usersData]) => {
      setReviews(reviewsData);
      setProducts(productsData);
      setUsers(usersData);
    });
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
    const url = process.env.REACT_APP_API_PATH;
    fetch(`${url}/reviews/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagged: !currentFlagged }),
    }).then(() => {
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, flagged: !currentFlagged } : r))
      );
    });
  };

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Giám sát đánh giá & phản hồi (Mở rộng)</h2>
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            className="form-control"
            placeholder="Tìm theo sản phẩm hoặc user"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={starFilter}
            onChange={(e) => setStarFilter(e.target.value)}
          >
            <option value="All">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Sản phẩm</th>
            <th>Người dùng</th>
            <th>Đánh giá</th>
            <th>Bình luận</th>
            <th>Ngày</th>
            <th>Votes</th>
            <th>Flag</th>
          </tr>
        </thead>
        <tbody>
          {filteredReviews.map((r) => (
            <tr key={r.id}>
              <td>{getProductTitle(r.productId)}</td>
              <td>{getUserName(r.reviewerId)}</td>
              <td>{r.rating} ⭐</td>
              <td>{r.comment}</td>
              <td>{r.createdAt}</td>
              <td>{r.helpfulVotes}</td>
              <td>
                <button
                  className={`btn btn-sm ${r.flagged ? "btn-danger" : "btn-outline-secondary"}`}
                  onClick={() => toggleFlag(r.id, r.flagged)}
                >
                  {r.flagged ? "Unflag" : "Flag"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminReviewListExtended;
