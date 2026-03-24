import React, { useState, useEffect } from 'react';
import { productService, couponService } from '../services/api';
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
  const [isSending, setIsSending] = useState(false);
  const itemsPerPage = 3;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, couponsRes] = await Promise.all([
          productService.getAll(),
          couponService.getAll()
        ]);
        setProducts(productsRes.data);
        setCoupons(couponsRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      productService.delete(id)
        .then(() => {
          setProducts(prev => prev.filter(p => p.id !== id));
        })
        .catch(err => console.error("Lỗi khi xóa sản phẩm:", err));
    }
  };

  const handleToggleVisibility = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    productService.patch(id, { visible: !product.visible })
      .then(() => {
        setProducts(prev =>
          prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p)
        );
      })
      .catch(err => console.error("Lỗi khi thay đổi hiển thị:", err));
  };

  const handleCouponChange = (id, voucherCode) => {
    productService.patch(id, { voucher: voucherCode })
      .then(() => {
        setProducts(prev =>
          prev.map(p => p.id === id ? { ...p, voucher: voucherCode } : p)
        );
      })
      .catch(err => console.error("Lỗi khi cập nhật voucher:", err));
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

  const handleBulkApply = async () => {
    const targets = products.filter(p => 
      filterCategory ? p.categoryId.toString() === filterCategory : true
    );

    if (targets.length === 0) return alert("Không có sản phẩm nào phù hợp!");
    
    if (!window.confirm(`Áp dụng voucher cho ${targets.length} sản phẩm?`)) return;

    setIsSending(true); // Reusing isSending if possible or local loading
    try {
      const promises = targets.map(p => productService.patch(p.id, { voucher: bulkCoupon }));
      await Promise.all(promises);
      
      setProducts(prev =>
        prev.map(p => {
          const isTarget = filterCategory ? p.categoryId.toString() === filterCategory : true;
          return isTarget ? { ...p, voucher: bulkCoupon } : p;
        })
      );
      alert("Đã áp dụng voucher thành công!");
    } catch (err) {
      console.error("Lỗi áp dụng voucher hàng loạt:", err);
      alert("Có lỗi xảy ra khi áp dụng voucher!");
    } finally {
      setIsSending(false);
    }
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
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-5">
        <div>
          <h2 className="fw-bold text-dark mb-1">Kiểm duyệt sản phẩm</h2>
          <p className="text-muted small">Theo dõi, ẩn/hiện và quản lý voucher cho toàn bộ hệ thống sản phẩm.</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-5 border-0">
        <h5 className="fw-bold mb-3"><i className="bi bi-lightning-charge-fill text-warning"></i> Thao tác nhanh hàng loạt</h5>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Bước 1: Chọn danh mục</label>
            <select className="form-select border-0 bg-light py-2 rounded-3" onChange={e => setFilterCategory(e.target.value)} defaultValue="">
              <option value="">Tất cả danh mục</option>
              {categories.map(c => (
                <option key={c} value={c}>Danh mục {c}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Bước 2: Chọn Voucher</label>
            <select className="form-select border-0 bg-light py-2 rounded-3" onChange={e => setBulkCoupon(e.target.value)} defaultValue="">
              <option value="">Chọn voucher áp dụng</option>
              {coupons.map(c => (
                <option key={c.id} value={c.voucherCode}>{c.description}</option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <button className="btn-modern btn-modern-primary w-100 shadow-sm" onClick={handleBulkApply} disabled={!bulkCoupon || isSending}>
              {isSending ? <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</> : <><i className="bi bi-check-all fs-5"></i> Áp dụng cho danh mục</>}
            </button>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-8">
          <div className="input-group bg-light rounded-3 overflow-hidden border-0 shadow-sm">
            <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="text"
              className="form-control border-0 bg-transparent py-2"
              placeholder="Tìm theo tên sản phẩm, mã ID hoặc thông tin mô tả..."
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select border-0 bg-light py-2 rounded-3 shadow-sm" onChange={e => setFilterStatus(e.target.value)} defaultValue="">
            <option value="">Tất cả trạng thái kho</option>
            <option value="In Stock">✅ Đang hiển thị (In Stock)</option>
            <option value="Out of Stock">❌ Đã ẩn (Out of Stock)</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {currentItems.map(p => (
          <div key={p.id} className="col-lg-4 col-md-6">
            <div className={`glass-card h-100 border-0 p-3 ${!p.visible ? 'opacity-75' : ''}`}>
              <div className="position-relative mb-3">
                <div className="ratio ratio-4x3 rounded-4 overflow-hidden bg-white p-2" style={{ boxShadow: 'inset 0 0 15px rgba(0,0,0,0.05)' }}>
                  <img
                    src={Array.isArray(p.images) ? p.images[0] : p.images}
                    alt={p.title}
                    className="object-fit-contain w-100 h-100"
                  />
                </div>
                <div className="position-absolute top-0 end-0 m-2">
                   <span className={`badge-modern ${p.visible ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                     {p.visible ? 'Visible' : 'Hidden'}
                   </span>
                </div>
              </div>
              
              <div className="px-1">
                <h6 className="fw-bold text-dark text-truncate mb-1" title={p.title}>{p.title}</h6>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-primary fw-800 fs-5">${p.price}</span>
                  <span className="text-muted small px-2 py-1 bg-light rounded">Cat: {p.categoryId}</span>
                </div>

                <div className="mb-3">
                  <label className="small text-muted mb-1 fw-bold">Voucher hiện tại:</label>
                  <select
                    className={`form-select form-select-sm border-0 rounded-3 ${p.voucher === "Không có voucher" ? 'bg-light' : 'bg-warning-subtle text-dark fw-bold'}`}
                    value={p.voucher || "Không có voucher"}
                    onChange={e => handleCouponChange(p.id, e.target.value)}
                  >
                    <option value="Không có voucher">Không có voucher</option>
                    {coupons.map(c => (
                      <option key={c.id} value={c.voucherCode}>{c.description}</option>
                    ))}
                  </select>
                </div>

                <div className="d-flex gap-2 pt-2 border-top">
                  <button className={`btn-modern btn-sm flex-grow-1 ${p.visible ? 'bg-light text-muted' : 'bg-primary-subtle text-primary fw-bold'}`} onClick={() => handleToggleVisibility(p.id)}>
                    <i className={`bi ${p.visible ? 'bi-eye-slash' : 'bi-eye'}`}></i> {p.visible ? 'Ẩn' : 'Hiện'}
                  </button>
                  <button className="btn-modern btn-sm bg-danger-subtle text-danger" onClick={() => handleDelete(p.id)}>
                    <i className="bi bi-trash3"></i>
                  </button>
                  <button className="btn-modern btn-sm bg-info-subtle text-info" onClick={() => handleCouponClick(p.id)}>
                    <i className="bi bi-ticket-perforated"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-5">
        <nav>
          <ul className="pagination gap-2 border-0">
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                <button className="page-link border-0 rounded-circle shadow-sm fw-bold" 
                        style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => setCurrentPage(index + 1)}>{index + 1}</button>
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
