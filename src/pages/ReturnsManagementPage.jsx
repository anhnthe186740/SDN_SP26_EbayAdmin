import React, { useState, useEffect } from "react";
import { Container, Table, Button, Modal, Card } from "react-bootstrap";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminReturnsPage = () => {
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    // Fetch return requests and enrich with customer names
    axios
      .get(`${url}/returnRequests`)
      .then(async (res) => {
        const returnData = res.data;
        const returnsWithCustomerNames = await Promise.all(
          returnData.map(async (returnRequest) => {
            try {
              const userId = String(returnRequest.userId);
              const userRes = await axios.get(`${url}/users/${userId}`);
              return {
                ...returnRequest,
                customerName: userRes.data.fullname || "N/A",
              };
            } catch (err) {
              console.error(`Error fetching user for return ${returnRequest.id}:`, err);
              return {
                ...returnRequest,
                customerName: "N/A",
              };
            }
          })
        );
        setReturnRequests(returnsWithCustomerNames);
      })
      .catch((err) => console.error("Error fetching return requests:", err));

    // Fetch logs
    axios
      .get(`${url}/logs`)
      .then((res) => setLogs(res.data))
      .catch((err) => console.error("Error fetching logs:", err));
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

    const url = process.env.REACT_APP_API_PATH;
    axios
      .patch(`${url}/returnRequests/${returnId}`, {
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
    const url = process.env.REACT_APP_API_PATH;
    axios
      .post(`${url}/logs`, {
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
    <Container className="my-5">
      <h2 className="mb-4 text-primary">Xét duyệt hoàn trả đơn hàng</h2>

      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h5 className="text-primary">Danh sách yêu cầu hoàn trả</h5>
          <Table bordered hover>
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
                  <td>{returnRequest.id}</td>
                  <td>{returnRequest.orderId}</td>
                  <td>{returnRequest.customerName}</td>
                  <td>{returnRequest.reason}</td>
                  <td>{returnRequest.status}</td>
                  <td>
                    <Button
                      variant="info"
                      size="sm"
                      onClick={() => handleViewDetails(returnRequest)}
                      disabled={isLoading}
                    >
                      Xem chi tiết
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết yêu cầu hoàn trả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading ? (
            <p>Đang tải thông tin...</p>
          ) : selectedReturn ? (
            <>
              <h5>Thông tin yêu cầu</h5>
              <p><strong>ID:</strong> {selectedReturn.id}</p>
              <p><strong>Mã đơn hàng:</strong> {selectedReturn.orderId}</p>
              <p><strong>Khách hàng:</strong> {selectedReturn.customer?.fullname || "N/A"}</p>
              <p><strong>Lý do:</strong> {selectedReturn.reason}</p>
              <p><strong>Trạng thái:</strong> {selectedReturn.status}</p>
              <p><strong>Ngày yêu cầu:</strong> {selectedReturn.createdAt}</p>
              <p><strong>Số tiền hoàn:</strong> ${selectedReturn.refundAmount || "N/A"}</p>
              <p><strong>Ghi chú:</strong> {selectedReturn.notes || "Không có ghi chú"}</p>
            </>
          ) : (
            <p>Không có dữ liệu</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedReturn && (
            <>
              {(selectedReturn.status === "requested" || selectedReturn.status === "rejected") && (
                <Button
                  variant="success"
                  onClick={() => handleUpdateStatus(selectedReturn.id, "approved")}
                >
                  Duyệt
                </Button>
              )}
              {(selectedReturn.status === "requested" || selectedReturn.status === "approved") && (
                <Button
                  variant="danger"
                  onClick={() => handleUpdateStatus(selectedReturn.id, "rejected")}
                >
                  Từ chối
                </Button>
              )}
            </>
          )}
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            Đóng
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="shadow-sm">
        <Card.Body>
          <h5 className="text-primary">Lịch sử xử lý</h5>
          <Table bordered hover>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Hành động</th>
                <th>Người dùng</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <tr key={index}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.action}</td>
                  <td>{log.user}</td>
                  <td>{log.details}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AdminReturnsPage;