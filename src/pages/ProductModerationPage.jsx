import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const ProductModerationPage = () => {
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [bulkCoupon, setBulkCoupon] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/products`)
      .then(res => setProducts(res.data))
      .catch(err => console.error(err));

    axios.get(`${url}/Coupons`)
      .then(res => setCoupons(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleDelete = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleToggleVisibility = (id) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
    );
  };

  const handleCouponChange = (id, voucherCode) => {
    setProducts(prev =>
      prev.map(p => p.id === id ? { ...p, voucher: voucherCode } : p)
    );
  };

  const handleCouponClick = (productId) => {
    const product = products.find(p => p.id === productId);
    if (product.voucher === "Không có voucher") {
      setPopupMessage("Sản phẩm này không có voucher để xem.");
      setSelectedCoupon(null);
    } else {
      const coupon = coupons.find(c => c.voucherCode === product.voucher);
      setSelectedCoupon(coupon || null);
      setPopupMessage('');
    }
    setShowPopup(true);
  };

  const handleBulkApply = () => {
    setProducts(prev =>
      prev.map(p =>
        filterCategory ? p.categoryId.toString() === filterCategory : true
          ? { ...p, voucher: bulkCoupon }
          : p
      )
    );
  };

  const categories = [...new Set(products.map(p => p.categoryId.toString()))];

  const filtered = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.id.toString().includes(search);
    const matchesCategory = filterCategory ? p.categoryId.toString() === filterCategory : true;
    const matchesStatus = filterStatus ? p.visible === (filterStatus === 'In Stock') : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  return (
    <div className="container py-4">
      <h2 className="mb-4 fw-bold h3">🛒 Quản lý sản phẩm</h2>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <select className="form-select" onChange={e => setFilterCategory(e.target.value)} defaultValue="">
            <option value="">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c} value={c}>Danh mục {c}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <select className="form-select" onChange={e => setBulkCoupon(e.target.value)} defaultValue="">
            <option value="">Chọn voucher áp dụng</option>
            {coupons.map(c => (
              <option key={c.id} value={c.voucherCode}>{c.description}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <button className="btn btn-success" onClick={handleBulkApply} disabled={!bulkCoupon}>
            Áp dụng voucher
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="🔍 Tìm theo tên hoặc ID..."
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" onChange={e => setFilterStatus(e.target.value)} defaultValue="">
            <option value="">Tất cả trạng thái</option>
            <option value="In Stock">In Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="row">
        {currentItems.map(p => (
          <div key={p.id} className={`col-md-4 mb-4 ${!p.visible ? 'opacity-50' : ''}`}>
            <div className="card h-100 shadow-sm">
              <div className="ratio ratio-4x3">
                <img
                  src={Array.isArray(p.images) ? p.images[0] : p.images}
                  alt={p.title}
                  className="card-img-top object-fit-contain p-2"
                />
              </div>
              <div className="card-body">
                <h5 className="card-title text-truncate">{p.title}</h5>
                <p className="card-text mb-1">📁 <strong>Danh mục:</strong> {p.categoryId}</p>
                <p className="card-text mb-1">💵 <strong>Giá:</strong> ${p.price}</p>
                <p className="card-text mb-2">📦 <strong>Trạng thái:</strong> {p.visible ? 'In Stock' : 'Out of Stock'}</p>

                <div className="d-flex justify-content-between gap-2">
                  <select
                    className={`form-select form-select-sm ${p.voucher === "Không có voucher" ? '' : 'bg-warning'}`}
                    value={p.voucher || "Không có voucher"}
                    onChange={e => handleCouponChange(p.id, e.target.value)}
                    disabled={p.voucher === "Không có voucher"}
                  >
                    <option value="Không có voucher">Không có voucher</option>
                    {coupons.map(c => (
                      <option key={c.id} value={c.voucherCode}>{c.description}</option>
                    ))}
                  </select>
                  <button className="btn btn-outline-warning btn-sm" onClick={() => handleToggleVisibility(p.id)}>
                    {p.visible ? 'Ẩn' : 'Hiện'}
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id)}>Xoá</button>
                  <button className="btn btn-info btn-sm" onClick={() => handleCouponClick(p.id)}>
                    Xem voucher
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-4">
        <nav>
          <ul className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link" onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {showPopup && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center">
          <div className="bg-white p-4 rounded shadow w-50">
            <h4 className="mb-3">Chi tiết Voucher</h4>
            {popupMessage && <p><strong>{popupMessage}</strong></p>}
            {selectedCoupon && (
              <>
                <p><strong>Mã voucher:</strong> {selectedCoupon.voucherCode}</p>
                <p><strong>Giảm giá:</strong> {selectedCoupon.discountAmount} {selectedCoupon.discountAmount < 100 ? "%" : "VNĐ"}</p>
                <p><strong>Mô tả:</strong> {selectedCoupon.description}</p>
                <p><strong>Ngày hết hạn:</strong> {selectedCoupon.expiryDate}</p>
              </>
            )}
            <div className="text-end mt-4">
              <button className="btn btn-danger" onClick={() => setShowPopup(false)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductModerationPage;
