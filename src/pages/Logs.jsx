import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { genericService } from "../services/api";

// Cấu hình màu sắc cho các mức cảnh báo
const LEVEL_MAP = {
  INFO: { label: "INFO", color: "bg-info-subtle text-info", icon: "bi-info-circle-fill" },
  WARN: { label: "WARN", color: "bg-warning-subtle text-warning", icon: "bi-exclamation-triangle-fill" },
  ERROR: { label: "ERROR", color: "bg-danger-subtle text-danger", icon: "bi-x-octagon-fill" },
  CRITICAL: { label: "CRITICAL", color: "bg-dark text-white", icon: "bi-shield-fill-exclamation" }
};

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // States cho Bộ lọc
  const [searchUser, setSearchUser] = useState("");
  const [actionType, setActionType] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Gọi API (Giả sử bạn có endpoint 'logs')
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setIsLoading(true);
        // Tạm dùng setTimeout để mô phỏng độ trễ mạng, tạo cảm giác mượt mà
        setTimeout(async () => {
          const res = await genericService('logs').getAll().catch(() => ({ data: [] }));
          
          // DỮ LIỆU MẪU (Dự phòng nếu DB chưa có)
          const mockData = [
            { id: 1, action: "login", user: "seller02", time: "2025-04-24T15:45:00", ip: "192.168.1.14", level: "INFO" },
            { id: 2, action: "data_change", user: "admin02", time: "2025-04-21T16:15:00", ip: "192.168.1.11", level: "WARN" },
            { id: 3, action: "login", user: "admin01", time: "2025-04-20T21:32:00", ip: "192.168.1.10", level: "INFO" },
            { id: 4, action: "Send Broadcast Notification", user: "System", time: "2025-04-25T01:49:33", ip: "N/A", level: "INFO" },
            { id: 5, action: "delete_user", user: "admin01", time: "2025-04-26T10:05:00", ip: "192.168.1.10", level: "ERROR" },
          ];

          const finalData = (res.data && res.data.length > 0) ? res.data : mockData;
          // Sắp xếp mới nhất lên đầu
          setLogs(finalData.sort((a, b) => new Date(b.time || b.createdAt) - new Date(a.time || a.createdAt)));
          setIsLoading(false);
        }, 600);
      } catch (err) {
        console.error("Lỗi tải logs:", err);
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  // Format thời gian hiển thị (VD: 24/04/2025 15:45:00)
  const formatTime = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return d.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "medium" });
  };

  // Logic Bộ Lọc
  const filteredLogs = logs.filter(log => {
    const matchUser = log.user?.toLowerCase().includes(searchUser.toLowerCase());
    const matchAction = actionType === "All" || log.action === actionType;
    
    let matchDate = true;
    const logDate = new Date(log.time || log.createdAt).getTime();
    if (startDate) matchDate = matchDate && logDate >= new Date(startDate).getTime();
    if (endDate) {
      // Cộng thêm 1 ngày cho endDate để bao gồm cả những log diễn ra trong ngày đó
      const endD = new Date(endDate);
      endD.setDate(endD.getDate() + 1);
      matchDate = matchDate && logDate < endD.getTime();
    }

    return matchUser && matchAction && matchDate;
  });

  // Tính toán phân trang
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const currentLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Các hành động có thể xuất hiện trong log (Dùng cho Dropdown lọc)
  const uniqueActions = ["All", ...new Set(logs.map(log => log.action))];

  return (
    <div className="py-4 animation-fade-in">
      {/* HEADER */}
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>Nhật ký Hệ thống (Logs)</h2>
        <p className="text-muted small mb-0">Giám sát các hoạt động hệ thống và truy cập từ người dùng.</p>
      </div>

      {/* FILTER CARD - Đã nâng cấp UI */}
      <div className="premium-card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-lg-3 col-md-6">
            <label className="fw-bold small text-muted text-uppercase letter-spacing-1 mb-2">Tìm kiếm người dùng</label>
            <div className="input-group">
              <span className="input-group-text premium-input border-end-0 bg-white"><i className="bi bi-search text-muted"></i></span>
              <input 
                type="text" className="form-control premium-input border-start-0 ps-0" 
                placeholder="Tên tài khoản..." 
                value={searchUser} onChange={(e) => {setSearchUser(e.target.value); setCurrentPage(1);}}
              />
            </div>
          </div>
          
          <div className="col-lg-3 col-md-6">
            <label className="fw-bold small text-muted text-uppercase letter-spacing-1 mb-2">Hành động</label>
            <select 
              className="form-select premium-input" 
              value={actionType} onChange={(e) => {setActionType(e.target.value); setCurrentPage(1);}}
            >
              {uniqueActions.map(act => (
                <option key={act} value={act}>{act === "All" ? "Tất cả hành động" : act}</option>
              ))}
            </select>
          </div>

          <div className="col-lg-2 col-md-6">
            <label className="fw-bold small text-muted text-uppercase letter-spacing-1 mb-2">Từ ngày</label>
            <input 
              type="date" className="form-control premium-input" 
              value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}}
            />
          </div>

          <div className="col-lg-2 col-md-6">
            <label className="fw-bold small text-muted text-uppercase letter-spacing-1 mb-2">Đến ngày</label>
            <input 
              type="date" className="form-control premium-input" 
              value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}}
            />
          </div>

          <div className="col-lg-2 col-md-12 text-lg-end mt-3 mt-lg-0">
            <label className="fw-bold small text-muted text-uppercase letter-spacing-1 mb-2 d-none d-lg-block">Xuất dữ liệu</label>
            <div className="d-flex gap-2 justify-content-lg-end">
              <button className="btn btn-success fw-bold premium-btn-hover shadow-sm px-3" title="Xuất Excel">
                <i className="bi bi-file-earmark-excel"></i> CSV
              </button>
              <button className="btn btn-primary fw-bold premium-btn-hover shadow-sm px-3" title="Xuất PDF">
                <i className="bi bi-file-earmark-pdf"></i> PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="premium-card overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0 custom-table">
            <thead className="bg-light">
              <tr>
                <th className="text-muted text-uppercase small py-3 ps-4" style={{ width: '25%' }}>Hành động</th>
                <th className="text-muted text-uppercase small py-3" style={{ width: '20%' }}>Người thực hiện</th>
                <th className="text-muted text-uppercase small py-3" style={{ width: '25%' }}>Thời gian</th>
                <th className="text-muted text-uppercase small py-3" style={{ width: '15%' }}>IP Address</th>
                <th className="text-muted text-uppercase small py-3 text-center" style={{ width: '15%' }}>Mức cảnh báo</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : currentLogs.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-5 text-muted fst-italic">Không tìm thấy nhật ký nào phù hợp.</td></tr>
              ) : (
                currentLogs.map((log, index) => {
                  const levelInfo = LEVEL_MAP[log.level] || LEVEL_MAP['INFO'];
                  return (
                    <tr key={`log-${log.id || 'empty'}-${index}`} className="table-row-hover">
                      <td className="ps-4">
                        <span className="fw-bold text-dark">{log.action}</span>
                      </td>
                      <td>
                        <span className={`fw-bold ${log.user === 'System' ? 'text-secondary' : 'text-primary'}`}>
                          {log.user === 'System' ? <><i className="bi bi-robot me-1"></i> System</> : log.user}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small"><i className="bi bi-clock me-1"></i> {formatTime(log.time || log.createdAt)}</span>
                      </td>
                      <td>
                        <code className="bg-light px-2 py-1 rounded border text-dark fs-7">
                          {log.ip || "N/A"}
                        </code>
                      </td>
                      <td className="text-center">
                        <span className={`badge rounded-pill px-3 py-2 ${levelInfo.color} border border-opacity-25`}>
                          <i className={`${levelInfo.icon} me-1`}></i> {levelInfo.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PHÂN TRANG */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <ul className="pagination custom-pagination shadow-sm">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link border-0" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}><i className="bi bi-chevron-left"></i></button>
            </li>
            {Array.from({ length: totalPages }, (_, i) => (
              <li key={i + 1} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                <button className="page-link border-0" onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link border-0" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}><i className="bi bi-chevron-right"></i></button>
            </li>
          </ul>
        </div>
      )}

      {/* CSS CAO CẤP */}
      <style>{`
        .premium-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid rgba(0,0,0,0.05);
          box-shadow: 0 8px 24px rgba(0,0,0,0.03);
        }
        
        .premium-input {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          color: #1e293b;
          transition: all 0.2s;
        }
        .premium-input:focus, .input-group:focus-within .premium-input {
          background-color: #ffffff;
          border-color: #0d6efd;
          box-shadow: none;
        }

        .premium-btn-hover { transition: transform 0.2s, box-shadow 0.2s; border-radius: 10px; }
        .premium-btn-hover:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(0,0,0,0.1) !important; }

        .custom-table th { font-weight: 700; letter-spacing: 0.5px; border-bottom: 2px solid #f1f5f9; }
        .custom-table td { padding-top: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .table-row-hover:hover { background-color: #f8fafc !important; }

        .custom-pagination .page-link { color: #64748b; margin: 0 4px; border-radius: 8px !important; transition: all 0.2s; }
        .custom-pagination .page-item.active .page-link { background-color: #0d6efd; color: white; box-shadow: 0 4px 10px rgba(13,110,253,0.3); }
        .custom-pagination .page-link:hover:not(:disabled) { background-color: #e2e8f0; color: #0f172a; }

        .letter-spacing-1 { letter-spacing: 0.5px; }
        .animation-fade-in { animation: fadeIn 0.4s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default LogsPage;