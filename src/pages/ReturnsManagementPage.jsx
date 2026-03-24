import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Card } from "react-bootstrap";
import { returnRequestService, userService, logService } from "../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminReturnsPage = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [returnsRes, logsRes] = await Promise.all([
          returnRequestService.getAll(),
          logService.getAll()
        ]);
        
        const returnData = returnsRes.data;
        const returnsWithCustomerNames = await Promise.all(
          returnData.map(async (returnRequest) => {
            try {
              const userRes = await userService.getById(returnRequest.userId);
              return {
                ...returnRequest,
                customerName: userRes.data.fullname || "N/A",
              };
            } catch (err) {
              console.error(`Error fetching user for return ${returnRequest.id}:`, err);
              return { ...returnRequest, customerName: "N/A" };
            }
          })
        );
        setReturnRequests(returnsWithCustomerNames);
        setLogs(logsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, []);

  const handleViewDetails = (returnRequest) => {
    setIsLoading(true);
    setSelectedReturn({
      ...returnRequest,
      customer: { fullname: returnRequest.customerName },
    });
    setShowDetailsModal(true);
    setIsLoading(false);
  };

  const handleUpdateStatus = (returnId, newStatus) => {
    const action = newStatus === "approved" ? "Duyệt" : "Từ chối";
    const confirm = window.confirm(`Bạn có chắc muốn ${action.toLowerCase()} yêu cầu hoàn trả này?`);
    if (!confirm) return;

    returnRequestService.update(returnId, {
      status: newStatus,
      approvalDate: new Date().toISOString().split("T")[0],
    })
      .then((res) => {
        setReturnRequests(
          returnRequests.map((r) =>
            String(r.id) === String(returnId)
              ? { ...r, status: newStatus, approvalDate: res.data.approvalDate }
              : r
          )
        );
        setSelectedReturn((prev) =>
          prev && String(prev.id) === String(returnId)
            ? { ...prev, status: newStatus, approvalDate: res.data.approvalDate }
            : prev
        );
        logAction(`${action} Return`, `Return ID: ${returnId}, Status changed to ${newStatus}`);
      })
      .catch((err) => {
        console.error(`Error ${action.toLowerCase()} return:`, err);
        alert(`Không thể ${action.toLowerCase()} yêu cầu!`);
      });
  };

  const logAction = (action, details) => {
    logService.create({
      action,
      user: "admin01", // Assume logged-in admin
      details,
      timestamp: new Date().toISOString(),
      ip: "192.168.1.10", // Example IP, adjust as needed
      level: "info",
    })
      .then((res) => setLogs([...logs, res.data]))
      .catch((err) => console.error("Error logging:", err));
  };

  return (
    <div className="py-2">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h2 className="fw-bold text-dark mb-1">Xét duyệt hoàn trả đơn hàng</h2>
          <p className="text-muted small">Quản lý và xử lý các yêu cầu hoàn trả từ khách hàng.</p>
        </div>
      </div>

      <div className="glass-card p-4 border-0 mb-4">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-arrow-return-left text-primary"></i> Danh sách yêu cầu hoàn trả
        </h5>
        <div className="table-responsive">
          <table className="table table-modern align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Mã đơn hàng</th>
                <th>Khách hàng</th>
                <th>Lý do</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {returnRequests.map((returnRequest) => (
                <tr key={returnRequest.id}>
                  <td><span className="fw-bold">#{returnRequest.id.toString().slice(-4).toUpperCase()}</span></td>
                  <td><code className="bg-light px-2 py-1 rounded text-dark">#{returnRequest.orderId}</code></td>
                  <td><div className="fw-bold text-primary">{returnRequest.customerName}</div></td>
                  <td><div className="text-muted small text-truncate" style={{ maxWidth: 200 }} title={returnRequest.reason}>{returnRequest.reason}</div></td>
                  <td>
                    <span className={`badge-modern ${
                      returnRequest.status === 'approved' ? 'bg-success-subtle text-success' : 
                      returnRequest.status === 'rejected' ? 'bg-danger-subtle text-danger' : 'bg-warning-subtle text-warning'
                    }`}>
                      {returnRequest.status === 'requested' ? 'Chờ duyệt' : returnRequest.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn-modern btn-sm bg-light text-primary"
                      onClick={() => handleViewDetails(returnRequest)}
                      disabled={isLoading}
                    >
                      <i className="bi bi-eye"></i> Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered contentClassName="border-0 rounded-4 shadow-lg">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-5 text-dark">Chi tiết yêu cầu hoàn trả</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {isLoading ? (
            <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
          ) : selectedReturn ? (
            <div className="bg-light p-4 rounded-4 mt-2">
              <div className="row g-3">
                <div className="col-md-6">
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">ID Yêu cầu</span> <span className="fw-bold">#{selectedReturn.id}</span></p>
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Khách hàng</span> <span className="text-primary fw-medium">{selectedReturn.customer?.fullname || "N/A"}</span></p>
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Trạng thái</span> 
                    <span className={`badge ${selectedReturn.status === 'approved' ? 'bg-success' : selectedReturn.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                       {selectedReturn.status}
                    </span>
                  </p>
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Số tiền hoàn</span> <span className="text-danger fw-bold">${selectedReturn.refundAmount || "N/A"}</span></p>
                </div>
                <div className="col-md-6">
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Mã đơn hàng</span> <code>#{selectedReturn.orderId}</code></p>
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Ngày yêu cầu</span> {selectedReturn.createdAt}</p>
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Lý do</span> {selectedReturn.reason}</p>
                  <p className="mb-2"><span className="text-muted small fw-bold text-uppercase d-block">Ghi chú</span> {selectedReturn.notes || "Không có ghi chú"}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted m-0">Không có dữ liệu</p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4">
          {selectedReturn && (
            <div className="d-flex w-100 justify-content-end gap-2">
              {(selectedReturn.status === "requested" || selectedReturn.status === "rejected") && (
                <button
                  className="btn-modern bg-success text-white px-4"
                  onClick={() => handleUpdateStatus(selectedReturn.id, "approved")}
                >
                  <i className="bi bi-check-circle me-1"></i> Duyệt
                </button>
              )}
              {(selectedReturn.status === "requested" || selectedReturn.status === "approved") && (
                <button
                  className="btn-modern bg-danger text-white px-4"
                  onClick={() => handleUpdateStatus(selectedReturn.id, "rejected")}
                >
                  <i className="bi bi-x-circle me-1"></i> Từ chối
                </button>
              )}
              <button className="btn-modern bg-light text-dark px-4" onClick={() => setShowDetailsModal(false)}>
                Đóng
              </button>
            </div>
          )}
        </Modal.Footer>
      </Modal>

      <div className="glass-card p-4 border-0">
        <h5 className="fw-bold mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-clock-history text-muted"></i> Lịch sử xử lý
        </h5>
        <div className="table-responsive">
          <table className="table table-modern table-sm">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hành động</th>
                <th>Người xử lý</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.slice(-10).reverse().map((log, index) => (
                <tr key={index}>
                  <td><div className="text-muted small">{new Date(log.timestamp).toLocaleString()}</div></td>
                  <td><span className="fw-bold text-dark small">{log.action}</span></td>
                  <td><span className="text-primary small">{log.user}</span></td>
                  <td><div className="text-muted x-small text-truncate" style={{ maxWidth: 300 }}>{log.details}</div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminReturnsPage;