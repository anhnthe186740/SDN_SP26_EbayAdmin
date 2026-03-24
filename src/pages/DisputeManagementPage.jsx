import React, { useEffect, useState } from 'react';
import { disputeService, orderService, userService, orderItemService, logService } from '../services/api';
import 'bootstrap/dist/css/bootstrap.min.css';

const DisputeManagementPage = () => {
    const [disputes, setDisputes] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [orderItems, setOrderItems] = useState([]);
    const [filterStatus, setFilterStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDispute, setSelectedDispute] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [disputesRes, ordersRes, usersRes, orderItemsRes] = await Promise.all([
                    disputeService.getAll(),
                    orderService.getAll(),
                    userService.getAll(),
                    orderItemService.getAll()
                ]);
                setDisputes(disputesRes.data);
                setOrders(ordersRes.data);
                setUsers(usersRes.data);
                setOrderItems(orderItemsRes.data);
            } catch (error) {
                console.error('Lỗi khi tải dữ liệu khiếu nại:', error);
            }
        };
        fetchData();
    }, []);

    const handleStatusChange = (id, newStatus) => {
        const selected = disputes.find((d) => d.id.toString() === id.toString());
        if (!selected) return;

        const confirmChange = window.confirm(`Bạn có chắc chắn muốn đổi trạng thái khiếu nại #${id} thành "${newStatus}" không?`);
        if (!confirmChange) return;

        disputeService.update(id, { status: newStatus })
            .then(() => {
                const updated = disputes.map((d) =>
                    d.id.toString() === id.toString() ? { ...d, status: newStatus } : d
                );
                setDisputes(updated);
                alert('Cập nhật trạng thái thành công!');
                logService.create({
                    action: 'Update Dispute Status',
                    disputeId: id,
                    newStatus,
                    timestamp: new Date().toISOString(),
                }).catch((error) => console.error('Lỗi khi ghi log:', error));
            })
            .catch((error) => {
                console.error('Lỗi khi cập nhật trạng thái:', error);
                alert('Không thể cập nhật trạng thái. Vui lòng thử lại.');
            });
    };

    const handleApproveReject = (id, action) => {
        const newStatus = action === 'approve' ? 'resolved' : 'closed';
        handleStatusChange(id, newStatus);
    };

    const filteredDisputes = disputes
        .filter((d) => {
            const user = users.find((u) => u.id.toString() === d.raisedBy.toString());
            return user && ['user', 'seller'].includes(user.role);
        })
        .filter((d) => {
            const matchesStatus = filterStatus ? d.status === filterStatus : true;
            const matchesSearch = searchQuery
                ? d.id.toString().includes(searchQuery) ||
                  d.raisedBy.toString().includes(searchQuery) ||
                  d.orderId.toString().includes(searchQuery)
                : true;
            return matchesStatus && matchesSearch;
        });

    const getUserName = (userId) => {
        const user = users.find((u) => u.id.toString() === userId.toString());
        return user ? user.fullname || user.username : `Unknown User (${userId})`;
    };

    const getOrderDetails = (orderId) => {
        const order = orders.find((o) => o.id.toString() === orderId.toString());
        const item = orderItems.find((i) => i.orderId.toString() === orderId.toString());
        if (!order) return null;
        return {
            total: order.totalPrice,
            status: order.status,
            products: item?.products || []
        };
    };

    const getStatusBadgeAndActions = (dispute) => {
        const statusClasses = {
            pending: 'bg-warning text-dark',
            resolved: 'bg-success text-white',
            closed: 'bg-danger text-white'
        };

        const statusText = {
            pending: 'Đang xử lý',
            resolved: 'Đã giải quyết',
            closed: 'Đã đóng'
        };

        const badge = (
            <span className={`badge ${statusClasses[dispute.status]} p-2 rounded-pill`}>
                {statusText[dispute.status]}
            </span>
        );

        if (dispute.status === 'pending') {
            return (
                <div className="d-flex align-items-center gap-2">
                    {badge}
                    <button
                        onClick={() => handleApproveReject(dispute.id, 'approve')}
                        className="btn btn-sm btn-outline-success rounded-pill px-3"
                        title="Phê duyệt khiếu nại"
                    >
                        <i className="bi bi-check-circle"></i>
                    </button>
                    <button
                        onClick={() => handleApproveReject(dispute.id, 'reject')}
                        className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        title="Từ chối khiếu nại"
                    >
                        <i className="bi bi-x-circle"></i>
                    </button>
                </div>
            );
        }
        return badge;
    };

    return (
        <div className="py-2">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h2 className="fw-bold text-dark mb-1">Khiếu nại & Tranh chấp</h2>
                <p className="text-muted small">Giải quyết các vấn đề giữa người mua và người bán để đảm bảo uy tín sàn.</p>
              </div>
            </div>

            <div className="glass-card p-4 mb-4 border-0">
                <div className="row g-3">
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Lọc trạng thái</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="form-select border-0 bg-light rounded-3 py-2"
                        >
                            <option value="">Tất cả</option>
                            <option value="pending">⏳ Đang xử lý</option>
                            <option value="resolved">✅ Đã giải quyết</option>
                            <option value="closed">🔒 Đã đóng</option>
                        </select>
                    </div>
                    <div className="col-md-6">
                        <label className="form-label text-muted small fw-bold text-uppercase">Tìm kiếm nhanh</label>
                        <div className="input-group bg-light rounded-3 overflow-hidden border-0">
                          <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
                          <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="ID, User ID, mẫ đơn hàng..."
                              className="form-control border-0 bg-transparent py-2"
                          />
                        </div>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-modern">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Hội thoại</th>
                            <th>Mã đơn</th>
                            <th>Lý do & Số tiền</th>
                            <th>Ngày gửi</th>
                            <th>Trạng thái & Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredDisputes.length === 0 ? (
                          <tr><td colSpan="6" className="text-center py-5 text-muted">Không có khiếu nại nào phù hợp.</td></tr>
                        ) : filteredDisputes.map((dispute) => (
                            <tr key={dispute.id}>
                                <td><span className="fw-bold">#{dispute.id.toString().slice(-4).toUpperCase()}</span></td>
                                <td>
                                   <div className="fw-bold text-primary">{getUserName(dispute.raisedBy)}</div>
                                   <div className="small text-muted">Bên khiếu nại</div>
                                </td>
                                <td><code className="bg-light px-2 py-1 rounded text-dark">#{dispute.orderId}</code></td>
                                <td>
                                    <div className="fw-medium text-dark text-truncate" style={{ maxWidth: 200 }} title={dispute.reason}>{dispute.reason}</div>
                                    <div className="text-danger fw-bold small">Yêu cầu bồi thường: ${dispute.amountClaimed}</div>
                                </td>
                                <td><div className="text-muted small">{dispute.disputeDate}</div></td>
                                <td>
                                  <div className="d-flex align-items-center justify-content-between gap-3">
                                    <span className={`badge-modern ${
                                        dispute.status === 'resolved' ? 'bg-success-subtle text-success' : 
                                        dispute.status === 'pending' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'
                                    }`}>
                                        {dispute.status}
                                    </span>
                                    {dispute.status === 'pending' ? (
                                      <div className="d-flex gap-1">
                                          <button onClick={() => handleApproveReject(dispute.id, 'approve')} className="btn-modern btn-sm bg-success text-white px-2 py-1"><i className="bi bi-check-lg"></i></button>
                                          <button onClick={() => handleApproveReject(dispute.id, 'reject')} className="btn-modern btn-sm bg-danger text-white px-2 py-1"><i className="bi bi-x-lg"></i></button>
                                      </div>
                                    ) : (
                                      <button className="btn-modern btn-sm bg-light text-primary" onClick={() => setSelectedDispute(dispute)}><i className="bi bi-eye-fill"></i></button>
                                    )}
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedDispute && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header bg-light">
                                <h5 className="modal-title fw-bold">Chi tiết khiếu nại #{selectedDispute.id}</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedDispute(null)}></button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <p><strong>Người dùng:</strong> {getUserName(selectedDispute.raisedBy)}</p>
                                        <p><strong>Đơn hàng:</strong> {selectedDispute.orderId}</p>
                                        <p><strong>Lý do:</strong> {selectedDispute.reason}</p>
                                        <p><strong>Số tiền yêu cầu:</strong> {selectedDispute.amountClaimed}</p>
                                    </div>
                                    <div className="col-md-6">
                                        <p><strong>Ngày tranh chấp:</strong> {selectedDispute.disputeDate}</p>
                                        <p><strong>Ngày giải quyết:</strong> {selectedDispute.resolutionDate || 'Chưa giải quyết'}</p>
                                        <p><strong>Ghi chú:</strong> {selectedDispute.description || 'Không có ghi chú'}</p>
                                        <p><strong>Hướng xử lý:</strong> {selectedDispute.resolution || 'Chưa có hướng xử lý'}</p>
                                    </div>
                                </div>
                                {(() => {
                                    const order = getOrderDetails(selectedDispute.orderId);
                                    return order ? (
                                        <div className="mt-4">
                                            <h6 className="fw-bold">Thông tin đơn hàng</h6>
                                            <p><strong>Tổng tiền:</strong> {order.total}</p>
                                            <p><strong>Trạng thái:</strong> {order.status}</p>
                                            <p><strong>Sản phẩm:</strong></p>
                                            <ul className="list-group">
                                                {order.products.map((p, index) => (
                                                    <li key={index} className="list-group-item bg-light">
                                                        {p.name} - Giá: {p.price} - Số lượng: {p.quantity}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <p className="text-muted">Không tìm thấy thông tin đơn hàng</p>
                                    );
                                })()}
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary rounded-pill"
                                    onClick={() => setSelectedDispute(null)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DisputeManagementPage;