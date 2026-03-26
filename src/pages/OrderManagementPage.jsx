import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { orderService, userService, orderItemService, notificationService } from "../services/api";

// 1. TẠO BỘ TỪ ĐIỂN MAP TRẠNG THÁI (Khớp với Enum trong Backend OrderSchema)
const STATUS_MAP = {
  pending: { label: "⏳ Đang xử lý", color: "bg-warning-subtle text-warning" },
  shipped: { label: "🚚 Đang giao", color: "bg-info-subtle text-info" },
  delivered: { label: "✅ Đã giao", color: "bg-success-subtle text-success" },
  cancelled: { label: "❌ Đã hủy", color: "bg-danger-subtle text-danger" },
  returned: { label: "🔄 Hoàn trả", color: "bg-secondary text-white" }
};

// Hàm hỗ trợ format ngày tháng
const formatDate = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  return date.toLocaleDateString("vi-VN", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const OrderManagementPage = () => {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Sửa lỗi Phân trang: Tăng số lượng đơn hiển thị trên 1 trang lên 5 (Thay vì 1)
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, usersRes, orderItemsRes] = await Promise.all([
          orderService.getAll(),
          userService.getAll(),
          orderItemService.getAll()
        ]);
        // Sắp xếp đơn hàng mới nhất lên đầu
        const sortedOrders = ordersRes.data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
        setOrders(sortedOrders);
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

  // 2. VALIDATE LOGIC TRẠNG THÁI
  const updateStatus = (id, newStatus) => {
    const currentOrder = orders.find((order) => order.id === id);
    if (!currentOrder) return;

    // Chặn thay đổi nếu đơn hàng đã ở Trạng thái Cuối (Cancelled / Returned)
    const terminalStates = ['cancelled', 'returned'];
    if (terminalStates.includes(currentOrder.status) && !terminalStates.includes(newStatus)) {
      alert(`Lỗi Logic: Đơn hàng này đã bị "${STATUS_MAP[currentOrder.status].label}". Bạn không thể chuyển ngược nó lại thành "${STATUS_MAP[newStatus].label}" được!`);
      return;
    }

    const confirmMsg = `Bạn có chắc chắn muốn cập nhật đơn hàng #${id.toString().slice(-6).toUpperCase()} thành "${STATUS_MAP[newStatus].label}"?`;
    if (!window.confirm(confirmMsg)) return;

    const updatedOrder = { ...currentOrder, status: newStatus };
    
    orderService.update(id, updatedOrder)
      .then(() => {
        setOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
        
        // Cập nhật lại state của modal đang mở
        if (selectedOrder && selectedOrder.id === id) {
          setSelectedOrder(updatedOrder);
        }

        sendNotification(id, newStatus);
      })
      .catch((err) => {
        console.error("Error updating status:", err);
        alert("Không thể cập nhật trạng thái! Vui lòng kiểm tra lại kết nối.");
      });
  };

  const sendNotification = (orderId, newStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (order) {
      const user = users.find((u) => u.id === order.buyerId);
      if (user) {
        const message = `Đơn hàng #${orderId.toString().slice(-6).toUpperCase()} của bạn đã được cập nhật thành: ${STATUS_MAP[newStatus]?.label || newStatus}`;
        notificationService.create({
          title: "Cập nhật đơn hàng",
          message: message,
          userId: user.id,
          timestamp: new Date().toISOString()
        })
        .then(() => setNotificationMessage(`Đã gửi thông báo đến ${user.fullname}`))
        .catch(console.error);
      }
    }
  };

  const getUserNameById = (userId) => {
    const user = users.find((u) => u.id === userId?.toString());
    return user ? user.fullname : "Khách ẩn danh";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id?.toString().includes(search) ||
      getUserNameById(order.buyerId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filter ? order.status === filter : true;
    // Tìm kiếm theo ngày thô (nếu có)
    const matchesDate = dateFilter ? order.orderDate?.includes(dateFilter) : true;
    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  return (
    <div className="py-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-dark mb-1">Quản lý Đơn hàng</h2>
          <p className="text-muted small">Theo dõi trạng thái vận chuyển và kiểm soát vòng đời đơn hàng.</p>
        </div>
      </div>

      <div className="glass-card p-4 mb-4 border-0 shadow-sm">
        <div className="row g-3">
          <div className="col-md-5">
            <div className="input-group bg-light rounded-3 overflow-hidden border-0">
              <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-0 bg-transparent py-2 shadow-none"
                placeholder="Tìm theo Mã đơn hoặc Tên khách..."
                onChange={(e) => { setSearch(e.target.value.trim()); setCurrentPage(1); }}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select
              onChange={(e) => { setFilter(e.target.value); setCurrentPage(1); }}
              className="form-select border-0 bg-light rounded-3 py-2 shadow-none"
            >
              <option value="">Tất cả trạng thái</option>
              {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <input
              type="date"
              className="form-control border-0 bg-light rounded-3 py-2 text-muted shadow-none"
              onChange={(e) => { setDateFilter(e.target.value); setCurrentPage(1); }}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive glass-card p-3 border-0">
        <table className="table table-modern align-middle mb-0">
          <thead>
            <tr>
              <th className="text-muted text-uppercase small">ID Đơn</th>
              <th className="text-muted text-uppercase small">Sản phẩm (Đại diện)</th>
              <th className="text-muted text-uppercase small">Khách hàng</th>
              <th className="text-muted text-uppercase small">Tổng tiền</th>
              <th className="text-muted text-uppercase small">Trạng thái</th>
              <th className="text-end text-muted text-uppercase small">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-5 text-muted fst-italic">Không tìm thấy đơn hàng nào phù hợp.</td>
              </tr>
            ) : (
              currentOrders.map((order) => {
                const item = orderItems.find((i) => i.orderId === order.id);
                const firstProduct = item?.products?.[0];
                const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: "bg-light text-dark" };
                
                return (
                  <tr key={order.id}>
                    <td><span className="fw-bold text-dark">#{order.id.toString().slice(-6).toUpperCase()}</span></td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded-3 overflow-hidden border bg-white d-flex align-items-center justify-content-center shadow-sm" style={{ width: 48, height: 48 }}>
                           {firstProduct && firstProduct.images?.length > 0 ? (
                              <img src={firstProduct.images[0]} alt={firstProduct.name} className="w-100 h-100 object-fit-contain p-1" />
                           ) : <i className="bi bi-box-seam text-muted"></i>}
                        </div>
                        <div>
                           <div className="small fw-bold text-dark text-truncate" style={{ maxWidth: 180 }}>
                              {firstProduct ? firstProduct.name : "Không rõ sản phẩm"}
                           </div>
                           {item?.products?.length > 1 && (
                             <span className="badge bg-secondary rounded-pill mt-1" style={{fontSize: '0.65rem'}}>+{item.products.length - 1} sản phẩm khác</span>
                           )}
                        </div>
                      </div>
                    </td>
                    <td>
                       <div className="fw-bold text-dark">{getUserNameById(order.buyerId)}</div>
                       {/* Đã format lại ngày tháng */}
                       <div className="text-muted small"><i className="bi bi-clock me-1"></i>{formatDate(order.orderDate)}</div>
                    </td>
                    <td><span className="text-primary fw-900 fs-6">${order.totalPrice?.toLocaleString()}</span></td>
                    <td>
                      <span className={`badge-modern ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn-modern btn-sm bg-light text-primary border shadow-sm hover-elevate"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <i className="bi bi-eye-fill me-1"></i> Chi tiết
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Áp dụng class Phân trang Custom */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4 mb-3">
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

      {selectedOrder && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(5px)', zIndex: 1060 }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 p-1 shadow-lg" style={{ borderRadius: '1.5rem' }}>
              <div className="modal-header border-0 pb-0 px-4 pt-4">
                <h4 className="fw-bold mb-0 text-dark">📦 Chi tiết Đơn hàng #{selectedOrder.id.toString().slice(-6).toUpperCase()}</h4>
                <button type="button" className="btn-close shadow-none" onClick={() => setSelectedOrder(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-4">
                  <div className="col-md-7">
                    <div className="bg-light rounded-4 p-3 border h-100">
                       <h6 className="fw-bold mb-3 text-muted text-uppercase small">Sản phẩm trong đơn ({orderItems.find(i => i.orderId === selectedOrder.id)?.products.length || 0})</h6>
                       <div className="overflow-auto pe-2" style={{ maxHeight: '300px' }}>
                         {orderItems.find(i => i.orderId === selectedOrder.id)?.products.map((product, idx) => (
                          <div key={idx} className="d-flex align-items-center gap-3 mb-2 bg-white p-2 rounded-3 border shadow-sm">
                            <div className="bg-light rounded p-1" style={{ width: 60, height: 60 }}>
                              <img src={product.images?.[0]} alt={product.name} className="w-100 h-100 object-fit-contain" />
                            </div>
                            <div className="flex-grow-1">
                              <div className="fw-bold text-dark text-truncate" style={{maxWidth: '180px'}} title={product.name}>{product.name}</div>
                              <div className="text-primary small fw-bold">${product.price?.toLocaleString()} <span className="text-muted fw-normal">x {product.quantity}</span></div>
                            </div>
                            <div className="fw-bold text-success">${(product.price * product.quantity)?.toLocaleString()}</div>
                          </div>
                        ))}
                       </div>
                    </div>
                  </div>
                  
                  <div className="col-md-5 d-flex flex-column gap-3">
                    <div className="bg-primary-subtle rounded-4 p-3 border-0">
                       <p className="mb-2 text-primary small fw-bold text-uppercase"><i className="bi bi-person-lines-fill me-2"></i>Khách hàng</p>
                       <p className="mb-1 fw-bold fs-5 text-dark">{getUserNameById(selectedOrder.buyerId)}</p>
                       <p className="mb-0 text-muted small"><i className="bi bi-calendar-event me-1"></i>{formatDate(selectedOrder.orderDate)}</p>
                    </div>
                    
                    <div className="bg-white rounded-4 p-3 border flex-grow-1">
                      <label className="form-label small fw-bold text-muted text-uppercase mb-2">Cập nhật trạng thái</label>
                      <select
                        className="form-select border shadow-sm rounded-3 mb-3 fw-bold text-dark"
                        value={selectedOrder.status}
                        onChange={(e) => updateStatus(selectedOrder.id, e.target.value)}
                        // Khóa Dropdown nếu đơn hàng đã Hủy hoặc Hoàn trả
                        disabled={['cancelled', 'returned'].includes(selectedOrder.status)}
                      >
                        {Object.entries(STATUS_MAP).map(([key, { label }]) => (
                          <option key={key} value={key}>{label}</option>
                        ))}
                      </select>
                      
                      {['cancelled', 'returned'].includes(selectedOrder.status) && (
                        <div className="alert alert-danger p-2 small mb-3">
                          <i className="bi bi-lock-fill me-1"></i> Trạng thái đã bị khóa.
                        </div>
                      )}

                      <div className="d-flex justify-content-between pt-3 border-top mt-auto">
                         <span className="text-muted fw-bold text-uppercase small">Tổng thanh toán:</span>
                         <span className="fw-900 text-primary fs-4">${selectedOrder.totalPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 pt-0 px-4 pb-4">
                <button className="btn btn-light border fw-bold text-muted w-100 rounded-pill py-2 hover-elevate" onClick={() => setSelectedOrder(null)}>Đóng cửa sổ</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {notificationMessage && (
        <div className="position-fixed bottom-0 end-0 p-3" style={{ zIndex: 1100 }}>
          <div className="toast show align-items-center text-bg-success border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
            <div className="d-flex">
              <div className="toast-body fw-bold">
                <i className="bi bi-check-circle-fill me-2"></i>{notificationMessage}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagementPage;