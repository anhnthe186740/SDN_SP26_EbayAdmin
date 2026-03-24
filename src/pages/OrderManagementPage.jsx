import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { orderService, userService, orderItemService, notificationService } from "../services/api";

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
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes, orderItemsRes] = await Promise.all([
          orderService.getAll(),
          userService.getAll(),
          orderItemService.getAll()
        ]);
        setOrders(ordersRes.data);
        setUsers(usersRes.data);
        setOrderItems(orderItemsRes.data);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu đơn hàng:", err);
      }
    };
    fetchData();
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
    
    orderService.update(id, updatedOrder)
      .then(() => {
        setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
        console.log("Status updated successfully");
        sendNotification(id, newStatus);
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        alert("Không thể cập nhật trạng thái!");
      });
  };

  const sendNotification = (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const user = users.find((u) => u.id === order.buyerId);
      if (user) {
        const message = `Your order #${orderId} status has been updated to: ${newStatus}`;
        notificationService.create({
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
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quản lý đơn hàng</h2>
          <p className="text-muted small">Theo dõi trạng thái vận chuyển và xử lý hoàn tiền khách hàng.</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-4 border-0">
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-0 bg-transparent py-2"
                placeholder="Tìm theo ID, tên khách hàng hoặc ngày..."
                onChange={(e) => setSearch(e.target.value.trim())}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              onChange={(e) => setFilter(e.target.value)}
              className="form-select border-0 bg-light rounded-3 py-2"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">⏳ Đang xử lý (Pending)</option>
              <option value="shipped">🚚 Đã giao hàng (Shipped)</option>
              <option value="cancelled">❌ Đã hủy (Cancelled)</option>
              <option value="refunded">💰 Đã hoàn tiền (Refunded)</option>
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control border-0 bg-light rounded-3 py-2 text-muted"
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-modern">
          <thead>
            <tr>
              <th>ID Đơn</th>
              <th>Sản phẩm</th>
              <th>Khách hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted fst-italic">Không tìm thấy đơn hàng nào phù hợp.</td>
              </tr>
            ) : (
              currentOrders.map((order) => {
                const item = orderItems.find((i) => i.orderId === order.id);
                const firstProduct = item?.products?.[0];
                return (
                  <tr key={order.id}>
                    <td><span className="fw-bold text-dark">#{order.id.toString().slice(-6).toUpperCase()}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="rounded-3 overflow-hidden border bg-white" style={{ width: 48, height: 48 }}>
                           {firstProduct ? (
                              <img src={firstProduct.images[0]} alt={firstProduct.name} className="w-100 h-100 object-fit-cover" />
                           ) : <div className="w-100 h-100 bg-light d-flex align-items-center justify-content-center"><i className="bi bi-image text-muted"></i></div>}
                        </div>
                        <div className="small fw-medium text-truncate" style={{ maxWidth: 150 }}>
                           {firstProduct ? firstProduct.name : "N/A"}
                        </div>
                      </div>
                    </td>
                    <td>
                       <div className="fw-semibold">{getUserNameById(order.buyerId)}</div>
                       <div className="text-muted small">{order.orderDate}</div>
                    </td>
                    <td><span className="text-primary fw-bold">${order.totalPrice}</span></td>
                    <td>
                      <span className={`badge-modern ${
                        order.status === 'shipped' ? 'bg-success-subtle text-success' : 
                        order.status === 'pending' ? 'bg-warning-subtle text-warning' : 
                        order.status === 'cancelled' ? 'bg-danger-subtle text-danger' : 'bg-info-subtle text-info'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn-modern btn-sm bg-light text-primary"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="bi bi-eye-fill"></i> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center mt-5">
        <nav>
          <ul className="pagination gap-2 border-0">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button className="page-link border-0 rounded-circle shadow-sm" style={{ width: 40, height: 40 }} onClick={() => handlePageChange(currentPage - 1)}><i className="bi bi-chevron-left"></i></button>
            </li>
            {Array.from({ length: totalPages }, (_, index) => (
              <li key={index + 1} className={`page-item ${currentPage === index + 1 ? "active" : ""}`}>
                <button className="page-link border-0 rounded-circle shadow-sm fw-bold" style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handlePageChange(index + 1)}>{index + 1}</button>
              </li>
            ))}
            <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
              <button className="page-link border-0 rounded-circle shadow-sm" style={{ width: 40, height: 40 }} onClick={() => handlePageChange(currentPage + 1)}><i className="bi bi-chevron-right"></i></button>
            </li>
          </ul>
        </nav>
      </div>

      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content glass-card border-0 p-2 overflow-hidden">
              <div className="modal-header border-0 pb-0">
                <h4 className="fw-bold mb-0">📦 Chi tiết đơn hàng #{selectedOrder.id.toString().slice(-6).toUpperCase()}</h4>
                <button type="button" className="btn-close" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body py-4">
                <div className="row g-4">
                  <div className="col-md-7">
                    <div className="bg-light rounded-4 p-3 mb-3">
                       <h6 className="fw-bold mb-3 text-muted">Sản phẩm trong đơn</h6>
                       {orderItems.find(i => i.orderId === selectedOrder.id)?.products.map((product, idx) => (
                        <div key={idx} className="d-flex align-items-center gap-3 mb-2 bg-white p-2 rounded-3">
                          <img src={product.images[0]} alt={product.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                          <div>
                            <div className="fw-bold small">{product.name}</div>
                            <div className="text-primary small fw-bold">${product.price} x {product.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className="glass-card bg-primary-subtle border-0 p-3 mb-3 shadow-none">
                       <p className="mb-2 text-muted small fw-bold text-uppercase">Thông tin khách hàng</p>
                       <p className="mb-1 fw-bold fs-5">{getUserNameById(selectedOrder.buyerId)}</p>
                       <p className="mb-0 text-muted small">{selectedOrder.orderDate}</p>
                    </div>
                    <div className="bg-white rounded-4 p-3 border">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-2">Cập nhật trạng thái</label>
                      <select
                        className="form-select border-0 bg-light rounded-3 mb-3"
                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                        defaultValue={selectedOrder.status}
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                      <div className="d-flex justify-content-between pt-2 border-top">
                         <span className="text-muted small">Tạm tính:</span>
                         <span className="fw-bold text-primary fs-5">${selectedOrder.totalPrice}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0">
                <button className="btn-modern bg-light text-muted w-100" onClick={() => setSelectedOrder(null)}>Đóng cửa sổ</button>
              </div>
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
