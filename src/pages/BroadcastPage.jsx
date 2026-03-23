import React, { useEffect, useState } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';

const BroadcastPage = () => {
  const [users, setUsers] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [recipientType, setRecipientType] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [templates, setTemplates] = useState([
    { title: 'Khuyến mãi hôm nay', content: 'Nhanh tay nhận ưu đãi giảm giá lên đến 50%!' },
    { title: 'Thông báo bảo trì', content: 'Hệ thống sẽ bảo trì từ 2h đến 5h sáng mai.' },
    { title: 'Thông tin hoàn tiền', content: 'Bạn đã được hoàn tiền thành công đơn hàng #XYZ.' },
  ]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/users`)
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Lỗi khi tải người dùng:', err));
  }, []);

  const fetchNotificationHistory = () => {
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/notifications`)
      .then((res) => {
        const sorted = res.data.sort(
          (a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0)
        );
        setNotifications(sorted);
        setShowHistory(true);
      })
      .catch((err) => {
        console.error('Lỗi khi tải lịch sử:', err);
        alert('Không thể tải lịch sử thông báo!');
      });
  };

  const handleSendNotification = () => {
    if (!title.trim() || !content.trim()) {
      alert('Vui lòng nhập tiêu đề và nội dung!');
      return;
    }

    const timestamp = new Date().toISOString();
    setIsSending(true);

    const url = process.env.REACT_APP_API_PATH;
    if (recipientType === 'all') {
      axios.post(`${url}/notifications`, {
        title,
        content,
        type: 'broadcast',
        timestamp,
      })
        .then(() => {
          alert('Gửi thông báo broadcast thành công!');
          setTitle('');
          setContent('');
          setRecipientType('all');
          setSelectedUsers([]);
          setShowHistory(false);
          setIsSending(false);
        })
        .catch((err) => {
          console.error('Lỗi gửi broadcast:', err);
          alert('Không thể gửi thông báo broadcast!');
          setIsSending(false);
        });
      return; // Tránh chạy phần còn lại của hàm
    }

    let recipients = [];

    if (recipientType === 'custom') {
      recipients = users.filter(u => selectedUsers.includes(u.id));
    } else {
      recipients = users.filter(u => {
        const role = u.role?.toLowerCase();
        if (recipientType === 'user') return role === 'user';
        if (recipientType === 'seller') return role === 'seller';
        return false;
      });
    }

    if (recipients.length > 0) {
      const confirmSend = window.confirm(`Bạn có chắc gửi thông báo đến ${recipients.length} người nhận?`);
      if (!confirmSend) {
        setIsSending(false);
        return;
      }

      const promises = recipients.map(user =>
        axios.post(`${url}/notifications`, {
          title,
          content,
          userId: user.id,
          timestamp,
          type: 'personal'
        })
      );

      Promise.allSettled(promises)
        .then((results) => {
          const successCount = results.filter(r => r.status === 'fulfilled').length;
          alert(`Đã gửi thành công ${successCount}/${recipients.length} người.`);
          setTitle('');
          setContent('');
          setRecipientType('all');
          setSelectedUsers([]);
          setShowHistory(false);
          setIsSending(false);

          axios.post(`${url}/logs`, {
            action: 'Send Broadcast Notification',
            details: `Sent to ${successCount} recipients (${recipientType})`,
            timestamp
          }).catch((err) => console.error('Lỗi log:', err));
        })
        .catch((err) => {
          console.error('Lỗi gửi thông báo:', err);
          alert('Không thể gửi thông báo!');
          setIsSending(false);
        });
    } else if (recipientType !== 'all') {
      alert('Không có người nhận phù hợp!');
      setIsSending(false);
    }
  };

  const handleTemplateSelect = (e) => {
    const selected = templates.find(t => t.title === e.target.value);
    if (selected) {
      setTitle(selected.title);
      setContent(selected.content);
    }
  };

  const toggleSelectedUser = (id) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="container my-5">
      <h2 className="mb-4 text-primary">Gửi Thông Báo</h2>

      <div className="card shadow-sm border-primary mb-4">
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label fw-bold">Mẫu thông báo</label>
            <select className="form-select" onChange={handleTemplateSelect} defaultValue="">
              <option value="">Chọn mẫu...</option>
              {templates.map((t, index) => (
                <option key={index} value={t.title}>{t.title}</option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Tiêu đề thông báo</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="form-control"
              placeholder="Nhập tiêu đề..."
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Nội dung thông báo</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="form-control"
              placeholder="Nhập nội dung..."
              rows="4"
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Đối tượng nhận</label>
            <select
              value={recipientType}
              onChange={(e) => setRecipientType(e.target.value)}
              className="form-select"
            >
              <option value="all">Tất cả (Broadcast)</option>
              <option value="user">Chỉ Người dùng</option>
              <option value="seller">Chỉ Người bán</option>
              <option value="custom">Tùy chọn người nhận</option>
            </select>
          </div>

          {recipientType === 'custom' && (
            <div className="mb-3">
              <label className="form-label fw-bold">Chọn người nhận cụ thể</label>
              <div className="list-group overflow-auto" style={{ maxHeight: '200px' }}>
                {users.map(user => (
                  <label key={user.id} className="list-group-item">
                    <input
                      type="checkbox"
                      className="form-check-input me-2"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleSelectedUser(user.id)}
                    />
                    {user.fullname || user.username} ({user.role})
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="d-flex gap-3">
            <button onClick={handleSendNotification} className="btn btn-success" disabled={isSending}>
              {isSending ? 'Đang gửi...' : 'Gửi thông báo'}
            </button>
            <button onClick={fetchNotificationHistory} className="btn btn-outline-dark">
              Xem lịch sử
            </button>
          </div>
        </div>
      </div>

      {showHistory && (
        <div className="card border-info shadow-sm">
          <div className="card-body">
            <h5 className="mb-3 text-info">Lịch sử thông báo đã gửi</h5>
            {notifications.length === 0 ? (
              <p className="text-muted">Không có thông báo nào.</p>
            ) : (
              <ul className="list-group">
                {notifications.map((noti, index) => (
                  <li key={index} className="list-group-item">
                    <strong className="text-primary">{noti.title}</strong><br />
                    <span>{noti.content || noti.message || 'Không có nội dung.'}</span><br />
                    <small className="text-muted">
                      Gửi đến: {noti.userId ? `User ID ${noti.userId}` : 'Broadcast'} — {new Date(noti.timestamp).toLocaleString()}
                    </small>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BroadcastPage;