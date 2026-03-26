import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Form, Spinner } from "react-bootstrap";

const SettingsPage = () => {
  // 1. STATE LƯU DỮ LIỆU CẤU HÌNH (Lấy từ localStorage)
  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? JSON.parse(saved) : {
      siteName: "eBay Admin",
      contactEmail: "support@ebay-clone.com",
      currency: "USD",
      taxRate: "10",
      maintenanceMode: false,
      maxLoginAttempts: "5",
    };
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Tắt Toast sau 3 giây
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // 2. LOGIC BẮT LỖI (VALIDATION)
  const validateForm = () => {
    const newErrors = {};
    if (!formData.siteName.trim()) newErrors.siteName = "Tên hệ thống không được để trống.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contactEmail.trim()) newErrors.contactEmail = "Email liên hệ không được để trống.";
    else if (!emailRegex.test(formData.contactEmail)) newErrors.contactEmail = "Email không đúng định dạng.";

    const tax = Number(formData.taxRate);
    if (formData.taxRate === "" || isNaN(tax) || tax < 0 || tax > 100) newErrors.taxRate = "Phí giao dịch từ 0 - 100%.";

    const attempts = Number(formData.maxLoginAttempts);
    if (formData.maxLoginAttempts === "" || isNaN(attempts) || attempts < 1 || attempts > 10) newErrors.maxLoginAttempts = "Giới hạn từ 1 - 10 lần.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors({ ...errors, [name]: null });
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setToast({ show: true, message: "Vui lòng kiểm tra lại các trường báo lỗi!", type: "danger" });
      return;
    }

    setIsSaving(true);
    // Giả lập lưu API
    setTimeout(() => {
      localStorage.setItem('appSettings', JSON.stringify(formData));
      window.dispatchEvent(new Event('configUpdated')); // Báo cho toàn app biết cấu hình đã đổi
      setToast({ show: true, message: "Đã áp dụng cấu hình lên toàn hệ thống!", type: "success" });
      setIsSaving(false);
    }, 800);
  };

  return (
    <div className="py-4">
      {/* HEADER KHU VỰC CÀI ĐẶT */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Cấu hình Hệ thống</h2>
          <p className="text-muted small mb-0">Quản lý các thông số cốt lõi và trạng thái hoạt động của sàn.</p>
        </div>
        <button 
          className="btn btn-primary premium-btn px-4 py-2 fw-bold d-flex align-items-center justify-content-center shadow-sm" 
          onClick={handleSave} 
          disabled={isSaving}
        >
          {isSaving ? (
            <><Spinner size="sm" className="me-2"/> Đang lưu...</>
          ) : (
            <><i className="bi bi-floppy-fill me-2"></i> Lưu Cấu Hình</>
          )}
        </button>
      </div>

      <div className="row g-4">
        {/* ==========================================
            BÊN TRÁI: MENU TABS CHUYỂN HƯỚNG
            ========================================== */}
        <div className="col-md-3">
          <div className="premium-card p-3 position-sticky" style={{ top: '80px' }}>
            <div className="nav flex-column gap-2">
              <button 
                className={`btn text-start premium-tab ${activeTab === 'general' ? 'active' : ''}`}
                onClick={() => setActiveTab('general')}
              >
                <i className="bi bi-globe me-2 fs-5"></i> Thông tin chung
              </button>
              <button 
                className={`btn text-start premium-tab ${activeTab === 'payment' ? 'active' : ''}`}
                onClick={() => setActiveTab('payment')}
              >
                <i className="bi bi-wallet2 me-2 fs-5"></i> Tài chính & Tiền tệ
              </button>
              <button 
                className={`btn text-start premium-tab ${activeTab === 'system' ? 'active' : ''}`}
                onClick={() => setActiveTab('system')}
              >
                <i className="bi bi-shield-lock me-2 fs-5"></i> Bảo mật & Trạng thái
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            BÊN PHẢI: NỘI DUNG TƯƠNG ỨNG TỪNG TAB
            ========================================== */}
        <div className="col-md-9">
          <div className="premium-card p-4 p-md-5" style={{ minHeight: '450px' }}>
            
            {/* TAB: THÔNG TIN CHUNG */}
            {activeTab === 'general' && (
              <div className="tab-animation">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom d-flex align-items-center">
                  <i className="bi bi-globe text-primary me-2"></i> Thông tin chung
                </h5>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Tên hệ thống / Website</Form.Label>
                  <Form.Control 
                    type="text" name="siteName" value={formData.siteName} onChange={handleChange}
                    className={`premium-input ${errors.siteName ? 'is-invalid border-danger' : ''}`}
                    placeholder="VD: Siêu thị của tôi"
                  />
                  {errors.siteName && <div className="invalid-feedback fw-bold mt-2">{errors.siteName}</div>}
                  <Form.Text className="text-muted small mt-2 d-block">
                    <i className="bi bi-info-circle me-1"></i> Tên này sẽ hiển thị trên Header và các email gửi cho khách hàng.
                  </Form.Text>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Email liên hệ (Support)</Form.Label>
                  <Form.Control 
                    type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange}
                    className={`premium-input ${errors.contactEmail ? 'is-invalid border-danger' : ''}`}
                    placeholder="support@domain.com"
                  />
                  {errors.contactEmail && <div className="invalid-feedback fw-bold mt-2">{errors.contactEmail}</div>}
                </Form.Group>
              </div>
            )}

            {/* TAB: TÀI CHÍNH */}
            {activeTab === 'payment' && (
              <div className="tab-animation">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom d-flex align-items-center">
                  <i className="bi bi-wallet2 text-primary me-2"></i> Tài chính & Tiền tệ
                </h5>
                <div className="row g-4">
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Tiền tệ mặc định</Form.Label>
                      <Form.Select 
                        name="currency" value={formData.currency} onChange={handleChange}
                        className="premium-input form-select"
                      >
                        <option value="USD">USD ($) - Đô la Mỹ</option>
                        <option value="VND">VND (₫) - Việt Nam Đồng</option>
                        <option value="EUR">EUR (€) - Euro</option>
                      </Form.Select>
                    </Form.Group>
                  </div>
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Phí giao dịch sàn (%)</Form.Label>
                      <div className="input-group">
                        <Form.Control 
                          type="number" name="taxRate" value={formData.taxRate} onChange={handleChange}
                          className={`premium-input border-end-0 ${errors.taxRate ? 'is-invalid border-danger' : ''}`}
                        />
                        <span className="input-group-text premium-input bg-transparent border-start-0 text-muted fw-bold">%</span>
                      </div>
                      {errors.taxRate && <div className="text-danger small fw-bold mt-2">{errors.taxRate}</div>}
                    </Form.Group>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BẢO MẬT & HỆ THỐNG */}
            {activeTab === 'system' && (
              <div className="tab-animation">
                <h5 className="fw-bold text-dark mb-4 pb-2 border-bottom d-flex align-items-center">
                  <i className="bi bi-shield-lock text-primary me-2"></i> Bảo mật & Trạng thái
                </h5>
                
                <div className="maintenance-box p-4 rounded-4 mb-4">
                  <Form.Check 
                    type="switch" id="maintenance-switch" name="maintenanceMode"
                    checked={formData.maintenanceMode} onChange={handleChange}
                    className="custom-switch-danger"
                    label={<span className="fw-bold text-danger ms-2 fs-6">Bật chế độ bảo trì (Maintenance)</span>}
                  />
                  <p className="small text-danger mt-2 mb-0 ms-5 opacity-75">
                    Khi kích hoạt, toàn bộ website sẽ tạm ngưng hoạt động đối với khách hàng. Chỉ Admin mới có quyền truy cập.
                  </p>
                </div>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-muted text-uppercase letter-spacing-1">Giới hạn đăng nhập sai</Form.Label>
                  <div className="input-group w-50">
                    <Form.Control 
                      type="number" name="maxLoginAttempts" value={formData.maxLoginAttempts} onChange={handleChange}
                      className={`premium-input border-end-0 ${errors.maxLoginAttempts ? 'is-invalid border-danger' : ''}`}
                    />
                    <span className="input-group-text premium-input bg-transparent border-start-0 text-muted fw-bold">Lần</span>
                  </div>
                  {errors.maxLoginAttempts ? (
                    <div className="text-danger small fw-bold mt-2">{errors.maxLoginAttempts}</div>
                  ) : (
                    <Form.Text className="text-muted small mt-2 d-block">
                      Bảo vệ hệ thống khỏi tấn công Brute-force bằng cách khóa IP nếu đăng nhập sai quá số lần quy định.
                    </Form.Text>
                  )}
                </Form.Group>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* TOAST THÔNG BÁO GÓC DƯỚI */}
      {toast.show && (
        <div className="position-fixed bottom-0 end-0 p-4" style={{ zIndex: 1100 }}>
          <div className={`toast show align-items-center text-bg-${toast.type} border-0 shadow-lg rounded-4`} role="alert">
            <div className="d-flex p-2">
              <div className="toast-body fw-bold fs-6">
                <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2 fs-5`}></i>
                {toast.message}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS CAO CẤP TÍCH HỢP */}
      <style>{`
        /* Card Cao cấp */
        .premium-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.04);
          box-shadow: 0 10px 30px rgba(0,0,0,0.03);
        }

        /* Nút Tab Bên trái */
        .premium-tab {
          border-radius: 12px;
          padding: 14px 20px;
          font-weight: 600;
          color: #64748b;
          border: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
        }
        .premium-tab:hover:not(.active) {
          background-color: #f1f5f9;
          color: #0f172a;
          transform: translateX(4px);
        }
        .premium-tab.active {
          background: linear-gradient(135deg, #0d6efd 0%, #0052cc 100%);
          color: white;
          box-shadow: 0 8px 16px rgba(13,110,253,0.25);
        }

        /* Ô Nhập liệu (Inputs) */
        .premium-input {
          background-color: #f8fafc;
          border: 2px solid transparent;
          border-radius: 12px;
          padding: 12px 16px;
          font-weight: 500;
          color: #1e293b;
          transition: all 0.2s ease;
        }
        .premium-input:focus {
          background-color: #ffffff;
          border-color: #0d6efd;
          box-shadow: 0 0 0 4px rgba(13,110,253,0.1);
          outline: none;
        }

        /* Nút Lưu Cấu Hình */
        .premium-btn {
          border-radius: 12px;
          background: linear-gradient(135deg, #0d6efd 0%, #0052cc 100%);
          border: none;
          transition: all 0.2s ease;
        }
        .premium-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(13,110,253,0.3);
        }

        /* Hộp Cảnh báo Bảo trì */
        .maintenance-box {
          background-color: #fff1f2;
          border: 1px solid #ffe4e6;
          border-left: 5px solid #e11d48;
        }
        .custom-switch-danger .form-check-input:checked {
          background-color: #e11d48;
          border-color: #e11d48;
        }

        /* Utilities */
        .letter-spacing-1 { letter-spacing: 0.5px; }
        
        .tab-animation {
          animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default SettingsPage;