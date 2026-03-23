import React, { useEffect, useState } from 'react';
import axios from 'axios';
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
        const url = process.env.REACT_APP_API_PATH;
        axios.get(`${url}/disputes`)
            .then((response) => setDisputes(response.data))
            .catch((error) => console.error('Lỗi khi tải khiếu nại:', error));

        axios.get(`${url}/orderTable`)
            .then((response) => setOrders(response.data))
            .catch((error) => console.error('Lỗi khi tải đơn hàng:', error));

        axios.get(`${url}/users`)
            .then((response) => setUsers(response.data))
            .catch((error) => console.error('Lỗi khi tải người dùng:', error));

        axios.get(`${url}/orderItem`)
            .then((response) => setOrderItems(response.data))
            .catch((error) => console.error('Lỗi khi tải sản phẩm trong đơn hàng:', error));
    }, []);

    const handleStatusChange = (id, newStatus) => {
        const selected = disputes.find((d) => d.id.toString() === id.toString());
        if (!selected) return;

        const confirmChange = window.confirm(`Bạn có chắc chắn muốn đổi trạng thái khiếu nại #${id} thành "${newStatus}" không?`);
        if (!confirmChange) return;

        const url = process.env.REACT_APP_API_PATH;
        axios.patch(`${url}/disputes/${id}`, { status: newStatus })
            .then(() => {
                const updated = disputes.map((d) =>
                    d.id.toString() === id.toString() ? { ...d, status: newStatus } : d
                );
                setDisputes(updated);
                alert('Cập nhật trạng thái thành công!');
                const url = process.env.REACT_APP_API_PATH;
                axios.post(`${url}/logs`, {
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
        <div className="container-fluid py-4">
            <h2 className="mb-4 fw-bold text-primary">Quản lý khiếu nại</h2>

            <div className="card mb-4 shadow-sm border-0">
                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Lọc theo trạng thái:</label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="form-select rounded-pill"
                            >
                                <option value="">Tất cả</option>
                                <option value="pending">Đang xử lý</option>
                                <option value="resolved">Đã giải quyết</option>
                                <option value="closed">Đã đóng</option>
                            </select>
                        </div>
                        <div className="col-md-6">
                            <label className="form-label fw-medium">Tìm kiếm:</label>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Tìm theo ID, User ID, Order ID"
                                className="form-control rounded-pill"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="card shadow-sm border-0">
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover table-bordered mb-0">
                            <thead className="table-light text-center">
                                <tr>
                                    <th>ID</th>
                                    <th>Người dùng</th>
                                    <th>Đơn hàng</th>
                                    <th>Lý do</th>
                                    <th>Số tiền yêu cầu</th>
                                    <th>Ngày tranh chấp</th>
                                    <th>Trạng thái & Hành động</th>
                                    <th>Chi tiết</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDisputes.map((dispute) => (
                                    <tr key={dispute.id} className="text-center align-middle">
                                        <td>{dispute.id}</td>
                                        <td>{getUserName(dispute.raisedBy)}</td>
                                        <td>{dispute.orderId}</td>
                                        <td>{dispute.reason}</td>
                                        <td>{dispute.amountClaimed}</td>
                                        <td>{dispute.disputeDate}</td>
                                        <td>{getStatusBadgeAndActions(dispute)}</td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-outline-primary rounded-pill px-3"
                                                onClick={() => setSelectedDispute(dispute)}
                                            >
                                                <i className="bi bi-eye"></i> Xem
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
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