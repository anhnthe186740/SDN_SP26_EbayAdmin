import React, { useState, useEffect } from 'react';
import { Modal, Button, Badge } from 'react-bootstrap';
import { productService, couponService } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

// 1. CẬP NHẬT LẠI MAPPING CHUẨN XÁC THEO DỮ LIỆU CỦA BẠN
// (Bạn hãy tự đối chiếu với database.json để điền cho chính xác nhé)
const CATEGORY_MAP = {
  "1": "Điện thoại & Smartphone",  // Nãy ảnh của bạn số 1 là iPhone, Samsung
  "2": "Tai nghe & Âm thanh",      // Số 2 là Sony, Bose
  "3": "Giày dép & Thể thao",      // Số 3 là Adidas, Nike
  "4": "Túi xách & Đồng hồ",       // <-- Chỗ này bạn vừa báo lỗi, số 4 là Đồng hồ/Túi xách
  "5": "Máy ảnh & Quay phim",      // Số 5 là Canon, Nikon
  "6": "Máy tính & Laptop",        // Thử gán Laptop vào số 6 (Hoặc số 7, 8 tùy database của bạn)
  "7": "Thiết bị gia dụng"         
};

// 2. HÀM DỌN DẸP DỮ LIỆU TRƯỚC KHI GỬI LÊN SERVER (TRÁNH LỖI MONGODB)
const createSafePayload = (product, updates) => {
  const payload = { ...product, ...updates };
  delete payload._id; // Xóa ID nội bộ của Mongo để tránh lỗi Immutable field
  delete payload.__v; // Xóa key version
  return payload;
};

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
  const itemsPerPage = 6;

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

  const handleDelete = (id, title) => {
    if (window.confirm(`CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn sản phẩm "${title}" không?`)) {
      productService.delete(id)
        .then(() => setProducts(prev => prev.filter(p => p.id !== id)))
        .catch(err => alert("Lỗi khi xóa sản phẩm!"));
    }
  };

  const handleToggleVisibility = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    // Sử dụng payload an toàn
    const payload = createSafePayload(product, { visible: !product.visible });
    
    productService.update(id, payload)
      .then(() => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, visible: !p.visible } : p));
      })
      .catch(err => alert("Lỗi khi thay đổi trạng thái hiển thị!"));
  };

  const handleCouponChange = (id, voucherCode) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    // Sử dụng payload an toàn
    const payload = createSafePayload(product, { voucher: voucherCode });

    productService.update(id, payload)
      .then(() => {
        setProducts(prev => prev.map(p => p.id === id ? { ...p, voucher: voucherCode } : p));
      })
      .catch(err => alert("Lỗi khi cập nhật voucher. Vui lòng kiểm tra lại kết nối!"));
  };

  const handleCouponClick = (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product.voucher || product.voucher === "Không có voucher") {
      setPopupMessage("Sản phẩm này hiện chưa được áp dụng voucher nào.");
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

    if (targets.length === 0) return alert("Không có sản phẩm nào thuộc danh mục này!");
    if (!window.confirm(`Áp dụng voucher "${bulkCoupon}" cho ${targets.length} sản phẩm?`)) return;

    setIsSending(true);
    try {
      // Gọi .update với payload an toàn
      const promises = targets.map(p => {
        const payload = createSafePayload(p, { voucher: bulkCoupon });
        return productService.update(p.id, payload);
      });
      
      await Promise.all(promises);
      
      setProducts(prev =>
        prev.map(p => {
          const isTarget = filterCategory ? p.categoryId.toString() === filterCategory : true;
          return isTarget ? { ...p, voucher: bulkCoupon } : p;
        })
      );
      alert("Đã áp dụng voucher thành công!");
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi áp dụng voucher hàng loạt! Vui lòng kiểm tra lại log.");
    } finally {
      setIsSending(false);
    }
  };

  const categories = [...new Set(products.map(p => p.categoryId?.toString()))].filter(Boolean).sort();

  const filtered = products.filter(p => {
    const matchesSearch = p.title?.toLowerCase().includes(search.toLowerCase()) || p.id?.toString().includes(search);
    const matchesCategory = filterCategory ? p.categoryId?.toString() === filterCategory : true;
    const matchesStatus = filterStatus ? p.visible === (filterStatus === 'visible') : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const currentItems = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quản lý Sản phẩm</h2>
          <p className="text-muted small">Kiểm duyệt, ẩn/hiện và quản lý chương trình khuyến mãi (Voucher).</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-4 border-0 bg-primary-subtle shadow-sm">
        <h6 className="fw-bold mb-3 text-primary"><i className="bi bi-lightning-charge-fill text-warning me-2"></i>Áp dụng Voucher hàng loạt</h6>
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Bước 1: Chọn danh mục</label>
            <select className="form-select border-0 py-2 shadow-sm" onChange={e => setFilterCategory(e.target.value)} value={filterCategory}>
              <option value="">Tất cả danh mục</option>
              {categories.map(c => <option key={c} value={c}>{CATEGORY_MAP[c] || `Danh mục ${c}`}</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label text-muted small fw-bold">Bước 2: Chọn Voucher</label>
            <select className="form-select border-0 py-2 shadow-sm" onChange={e => setBulkCoupon(e.target.value)} value={bulkCoupon}>
              <option value="">-- Chọn voucher muốn áp dụng --</option>
              <option value="Không có voucher">Xóa tất cả voucher</option>
              {coupons.map(c => <option key={c.id} value={c.voucherCode}>{c.description} ({c.voucherCode})</option>)}
            </select>
          </div>
          <div className="col-md-4">
            <button className="btn-modern btn-modern-primary w-100 shadow-sm py-2" onClick={handleBulkApply} disabled={!bulkCoupon || isSending}>
              {isSending ? <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</> : <><i className="bi bi-check2-all fs-5 me-1"></i> Áp dụng ngay</>}
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
              className="form-control border-0 bg-transparent py-2 shadow-none"
              placeholder="Tìm theo tên sản phẩm hoặc mã ID..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
        <div className="col-md-4">
          <select className="form-select border-0 bg-light py-2 rounded-3 shadow-sm" onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }} value={filterStatus}>
            <option value="">Tất cả trạng thái hiển thị</option>
            <option value="visible">✅ Đang hiển thị cho Khách</option>
            <option value="hidden">❌ Đang ẩn (Lưu nháp)</option>
          </select>
        </div>
      </div>

      <div className="row g-4">
        {currentItems.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted fst-italic">Không tìm thấy sản phẩm nào.</div>
        ) : (
          currentItems.map(p => (
            <div key={p.id} className="col-lg-4 col-md-6">
              <div className={`glass-card hover-elevate h-100 border-0 p-3 d-flex flex-column ${!p.visible ? 'opacity-75' : ''}`}>
                <div className="position-relative mb-3">
                  <div className="ratio ratio-4x3 rounded-4 overflow-hidden bg-white p-2 d-flex align-items-center justify-content-center border shadow-sm">
                    {p.images && p.images.length > 0 ? (
                      <img src={Array.isArray(p.images) ? p.images[0] : p.images} alt={p.title} className="object-fit-contain w-100 h-100" />
                    ) : (
                      <div className="text-muted d-flex flex-column align-items-center justify-content-center">
                        <i className="bi bi-image fs-1"></i>
                        <span className="small">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="position-absolute top-0 start-0 m-2 d-flex flex-column gap-1">
                    <Badge bg={p.visible ? "success" : "secondary"} className="shadow-sm">
                      {p.visible ? 'Đang hiện' : 'Đang ẩn'}
                    </Badge>
                    <Badge bg="dark" className="shadow-sm text-truncate" style={{maxWidth: '120px'}}>
                      {CATEGORY_MAP[p.categoryId] || `Cat: ${p.categoryId}`}
                    </Badge>
                  </div>
                </div>
                
                <div className="px-1 flex-grow-1 d-flex flex-column">
                  <h6 className="fw-bold text-dark text-truncate mb-1" title={p.title}>{p.title}</h6>
                  <div className="text-primary fw-800 fs-5 mb-3">${p.price}</div>

                  <div className="mb-3 mt-auto">
                    <label className="small text-muted mb-1 fw-bold"><i className="bi bi-ticket-perforated me-1"></i>Voucher áp dụng:</label>
                    <select
                      className={`form-select form-select-sm border-0 rounded-3 shadow-sm ${!p.voucher || p.voucher === "Không có voucher" ? 'bg-light text-muted' : 'bg-warning-subtle text-dark fw-bold'}`}
                      value={p.voucher || "Không có voucher"}
                      onChange={e => handleCouponChange(p.id, e.target.value)}
                    >
                      <option value="Không có voucher">Không dùng voucher</option>
                      {coupons.map(c => <option key={c.id} value={c.voucherCode}>{c.voucherCode} (-{c.discountAmount}{c.discountAmount < 100 ? '%' : '$'})</option>)}
                    </select>
                  </div>

                  <div className="d-flex gap-2 pt-3 border-top mt-2">
                    <button 
                      className={`btn-modern btn-sm flex-grow-1 ${p.visible ? 'bg-secondary text-white' : 'bg-success text-white'}`} 
                      onClick={() => handleToggleVisibility(p.id)}
                    >
                      <i className={`bi ${p.visible ? 'bi-eye-slash' : 'bi-eye'} me-1`}></i> {p.visible ? 'Ẩn đi' : 'Hiện lại'}
                    </button>
                    <button className="btn-modern btn-sm bg-info-subtle text-info border-0" onClick={() => handleCouponClick(p.id)} title="Chi tiết Voucher">
                      <i className="bi bi-info-circle-fill"></i>
                    </button>
                    <button className="btn-modern btn-sm bg-danger-subtle text-danger border-0" onClick={() => handleDelete(p.id, p.title)} title="Xóa sản phẩm">
                      <i className="bi bi-trash3-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-5 mb-3">
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

      <Modal show={showPopup} onHide={() => setShowPopup(false)} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold"><i className="bi bi-ticket-detailed text-warning me-2"></i>Chi tiết Voucher</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {popupMessage ? (
            <p className="text-muted text-center py-3">{popupMessage}</p>
          ) : selectedCoupon ? (
            <div className="bg-light p-3 rounded-4 border border-warning">
              <p className="mb-2"><span className="text-muted small fw-bold d-block text-uppercase">Mã Voucher</span> <span className="fs-5 fw-bold text-dark">{selectedCoupon.voucherCode}</span></p>
              <p className="mb-2"><span className="text-muted small fw-bold d-block text-uppercase">Mức giảm</span> <span className="text-danger fw-bold fs-5">-{selectedCoupon.discountAmount}{selectedCoupon.discountAmount < 100 ? "%" : " VNĐ"}</span></p>
              <p className="mb-2"><span className="text-muted small fw-bold d-block text-uppercase">Mô tả</span> {selectedCoupon.description}</p>
              <p className="mb-0"><span className="text-muted small fw-bold d-block text-uppercase">Ngày hết hạn</span> {new Date(selectedCoupon.expiryDate).toLocaleDateString('vi-VN')}</p>
            </div>
          ) : null}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="secondary" className="px-4 fw-bold rounded-pill" onClick={() => setShowPopup(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductModerationPage;