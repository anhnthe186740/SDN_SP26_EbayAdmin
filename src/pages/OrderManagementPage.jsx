import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 1;

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/orderTable`)
      .then(res => setOrders(res.data))
      .catch(err => console.error(err));

    axios.get(`${url}/users`)
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));

    axios.get(`${url}/orderItem`)
      .then(res => setOrderItems(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (notificationMessage) {
      const timer = setTimeout(() => setNotificationMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [notificationMessage]);

  const updateStatus = (id, newStatus) => {
    const currentOrder = orders.find((order) => order.id === id);
    if (!currentOrder) return;

    const updatedOrder = { ...currentOrder, status: newStatus };
    setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));

    const url = process.env.REACT_APP_API_PATH;
    axios.put(`${url}/orderTable/${id}`, updatedOrder)
      .then(() => {
        console.log("Status updated successfully");
        sendNotification(id, newStatus);
      })
      .catch((err) => console.error("Error updating status:", err));
  };

  const sendNotification = (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const user = users.find((u) => u.id === order.buyerId);
      if (user) {
        const message = `Your order #${orderId} status has been updated to: ${newStatus}`;
        const url = process.env.REACT_APP_API_PATH;
        axios.post(`${url}/notifications`, {
          title: "Order Status Update",
          message: message,
          userId: user.id,
        })
        .then(() => {
          setNotificationMessage(`Thông báo đã gửi đến ${user.fullname}`);
        })
        .catch((err) => console.error("Error sending notification:", err));
      }
    }
  };

  const getUserNameById = (userId) => {
    const user = users.find((u) => u.id === userId.toString());
    return user ? user.fullname : "Unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "shipped": return "bg-success text-white";
      case "pending": return "bg-warning text-dark";
      case "cancelled": return "bg-danger text-white";
      case "refunded": return "bg-info text-white";
      default: return "";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toString().includes(search) ||
      getUserNameById(order.buyerId).toLowerCase().includes(search.toLowerCase()) ||
      order.orderDate.includes(search);
    const matchesStatus = filter ? order.status === filter : true;
    const matchesDate = dateFilter ? order.orderDate.includes(dateFilter) : true;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="h3 fw-bold mb-4">📦 Quản lý đơn hàng</h2>

      <div className="mb-4 d-flex">
        <input
          type="text"
          className="form-control w-25 me-3"
          placeholder="Tìm theo ID, khách hàng, ngày..."
          onChange={(e) => setSearch(e.target.value.trim())}
        />
        <select
          onChange={(e) => setFilter(e.target.value)}
          className="form-select w-25 me-3"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="pending">Pending</option>
          <option value="shipped">Shipped</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
        <input
          type="date"
          className="form-control w-25"
          onChange={(e) => setDateFilter(e.target.value)}
        />
      </div>

      <table className="table table-bordered text-center align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Ảnh</th>
            <th>Khách hàng</th>
            <th>Tổng</th>
            <th>Trạng thái</th>
            <th>Ngày</th>
            <th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredOrders.length === 0 ? (
            <tr>
              <td colSpan="7">Không có đơn hàng nào để hiển thị.</td>
            </tr>
          ) : (
            currentOrders.map((order) => {
              const item = orderItems.find((i) => i.orderId === order.id);
              const firstProduct = item?.products?.[0];
              return (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>
                    {firstProduct ? (
                      <img
                        src={firstProduct.images[0]}
                        alt={firstProduct.name}
                        style={{ width: "10vw", height: "15vh", objectFit: "cover" }}
                      />
                    ) : "No image"}
                  </td>
                  <td>{getUserNameById(order.buyerId)}</td>
                  <td>{order.totalPrice}</td>
                  <td className={getStatusColor(order.status)}>{order.status}</td>
                  <td>{order.orderDate}</td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => setSelectedOrder(order)}
                    >
                      Xem
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      <div className="d-flex justify-content-center mt-3">
        <nav>
          <ul className="pagination">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage - 1)}>Trước</button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li
                key={index + 1}
                className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
              >
                <button className="page-link" onClick={() => handlePageChange(index + 1)}>
                  {index + 1}
                </button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link" onClick={() => handlePageChange(currentPage + 1)}>Tiếp</button>
            </li>
          </ul>
        </nav>
      </div>

      {selectedOrder && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center" style={{ zIndex: 1050 }}>
          <div className="bg-white p-4 rounded shadow w-50">
            <h4 className="mb-3">📋 Chi tiết đơn hàng #{selectedOrder.id}</h4>
            <p><strong>Khách hàng:</strong> {getUserNameById(selectedOrder.buyerId)}</p>
            <p><strong>Tổng tiền:</strong> ${selectedOrder.totalPrice}</p>
            <p><strong>Trạng thái:</strong> {selectedOrder.status}</p>
            <p><strong>Ngày:</strong> {selectedOrder.orderDate}</p>
            <div>
              <h5>Ảnh sản phẩm:</h5>
              {orderItems.find(i => i.orderId === selectedOrder.id)?.products.map((product, idx) => (
                <img
                  key={idx}
                  src={product.images[0]}
                  alt={product.name}
                  style={{
                    width: "100px",
                    height: "100px",
                    objectFit: "cover",
                    marginRight: "10px",
                  }}
                />
              ))}
            </div>
            <div className="mt-3">
              <label className="form-label me-2">Cập nhật trạng thái:</label>
              <select
                className="form-select w-50 d-inline"
                onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                defaultValue={selectedOrder.status}
              >
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>
            <div className="text-end mt-4">
              <button className="btn btn-danger" onClick={() => setSelectedOrder(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {notificationMessage && (
        <div className="alert alert-info mt-4" style={{ zIndex: 10 }}>
          {notificationMessage}
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;
