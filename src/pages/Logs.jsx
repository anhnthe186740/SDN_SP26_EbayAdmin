import React, { useEffect, useState } from "react";
import { logService } from "../services/api";
import { exportLogsAsCSV, exportLogsAsJSON } from "../components/exportLogs";
import moment from "moment";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    logService.getAll().then((res) => {
      setLogs(res.data);
      setFilteredLogs(res.data);
    });
  }, []);

  useEffect(() => {
    let data = [...logs];

    if (actionType) {
      data = data.filter((log) => log.action.toLowerCase().includes(actionType.toLowerCase()));
    }

    if (search) {
      data = data.filter((log) =>
        log.user?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (startDate && endDate) {
      data = data.filter((log) => {
        const logDate = moment(log.timestamp || log.time);
        return logDate.isBetween(moment(startDate).startOf('day'), moment(endDate).endOf('day'), null, "[]");
      });
    }

    setFilteredLogs(data);
  }, [logs, search, actionType, startDate, endDate]);

  return (
    <div className="py-2">
      <div className="mb-4">
        <h2 className="fw-bold text-dark mb-1">Nhật ký Hệ thống (Logs)</h2>
        <p className="text-muted small">Giám sát các hoạt động hệ thống và truy cập từ người dùng.</p>
      </div>

      <div className="glass-card p-4 mb-4 border-0">
        <div className="row g-3">
          <div className="col-md-3">
             <label className="form-label text-muted small fw-bold text-uppercase">Tìm kiếm người dùng</label>
             <div className="input-group bg-light rounded-3 overflow-hidden border-0">
                <span className="input-group-text bg-transparent border-0"><i className="bi bi-search text-muted"></i></span>
                <input
                  type="text"
                  className="form-control border-0 bg-transparent py-2"
                  placeholder="Tên tài khoản..."
                  onChange={(e) => setSearch(e.target.value)}
                />
             </div>
          </div>
          <div className="col-md-3">
            <label className="form-label text-muted small fw-bold text-uppercase">Hành động</label>
            <select
              className="form-select border-0 bg-light rounded-3 py-2"
              onChange={(e) => setActionType(e.target.value)}
            >
              <option value="">Tất cả</option>
              <option value="login">Login</option>
              <option value="data change">Data Change</option>
              <option value="permission">Permission</option>
              <option value="broadcast">Broadcast</option>
            </select>
          </div>
          <div className="col-md-2">
             <label className="form-label text-muted small fw-bold text-uppercase">Từ ngày</label>
             <input type="date" className="form-control border-0 bg-light py-2 rounded-3" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-2">
             <label className="form-label text-muted small fw-bold text-uppercase">Đến ngày</label>
             <input type="date" className="form-control border-0 bg-light py-2 rounded-3" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-2">
             <label className="form-label text-muted small fw-bold text-uppercase">Xuất dữ liệu</label>
             <div className="d-flex gap-2">
                <button onClick={() => exportLogsAsCSV(filteredLogs)} className="btn-modern bg-success text-white w-50 py-2" title="Tải CSV">
                  <i className="bi bi-filetype-csv mx-auto"></i>
                </button>
                <button onClick={() => exportLogsAsJSON(filteredLogs)} className="btn-modern bg-primary text-white w-50 py-2" title="Tải JSON">
                  <i className="bi bi-filetype-json mx-auto"></i>
                </button>
             </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-modern align-middle">
          <thead>
            <tr>
              <th>Hành động</th>
              <th>Người thực hiện</th>
              <th>Thời gian</th>
              <th>IP</th>
              <th>Mức cảnh báo</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.length === 0 ? (
               <tr><td colSpan="5" className="text-center py-5 text-muted">Không có nhật ký nào phù hợp.</td></tr>
            ) : filteredLogs.map((log, index) => {
                const colorMap = {
                  normal: "bg-success-subtle text-success",
                  warning: "bg-warning-subtle text-warning",
                  danger: "bg-danger-subtle text-danger",
                };
                const iconMap = {
                  normal: "bi-check-circle-fill",
                  warning: "bi-exclamation-triangle-fill",
                  danger: "bi-shield-fill-x",
                };
                const badgeClass = colorMap[log.level] || "bg-light text-dark";
                const iconClass = iconMap[log.level] || "bi-info-circle-fill";

                return (
                  <tr key={index}>
                    <td><span className="fw-bold text-dark">{log.action}</span></td>
                    <td><span className="text-primary">{log.user || "System"}</span></td>
                    <td><div className="text-muted small">{moment(log.time || log.timestamp).format("YYYY-MM-DD HH:mm:ss")}</div></td>
                    <td><code className="bg-light px-2 py-1 rounded text-dark">{log.ip || "N/A"}</code></td>
                    <td>
                      <span className={`badge-modern ${badgeClass}`}>
                         <i className={`bi ${iconClass} me-1`}></i>
                         {log.level || "Unknown"}
                      </span>
                    </td>
                  </tr>
                );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;
