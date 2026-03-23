// src/pages/Logs.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Table, Input, Select, DatePicker, Button, Space, Tag } from "antd";
import { exportLogsAsCSV, exportLogsAsJSON } from "../components/exportLogs";
import moment from "moment";
const { RangePicker } = DatePicker;
const { Option } = Select;

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [actionType, setActionType] = useState("");
  const [dateRange, setDateRange] = useState(null);

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    axios.get(`${url}/logs`).then((res) => {
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

    if (dateRange && dateRange.length === 2) {
      const [start, end] = dateRange;
      data = data.filter((log) => {
        const logDate = moment(log.time);
        return logDate.isBetween(start, end, null, "[]");
      });
    }

    setFilteredLogs(data);
  }, [logs, search, actionType, dateRange]);

  const columns = [
    {
      title: "Hành động",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Người thực hiện",
      dataIndex: "user",
      key: "user",
    },
    {
      title: "Thời gian",
      dataIndex: "timestamp",
      key: "timestamp",
    },
    {
      title: "IP",
      dataIndex: "ip",
      key: "ip",
    },
    {
      title: "Mức cảnh báo",
      dataIndex: "level",
      key: "level",
      render: (level) => {
        const colorMap = {
          normal: "green",
          warning: "gold",
          danger: "red",
        };
        const iconMap = {
          normal: "🟢",
          warning: "🟡",
          danger: "🔴",
        };
    
        const color = colorMap[level] || "default";
        const icon = iconMap[level] || "⚪";
    
        return (
          <Tag color={color}>
            {icon} {level || "Không xác định"}
          </Tag>
        );
      },
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Giám sát nhật ký hệ thống</h2>
      <Space className="mb-4 flex-wrap gap-2">
        <Input
          placeholder="Tìm theo người dùng"
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Lọc hành động"
          onChange={(value) => setActionType(value)}
          allowClear
          style={{ width: 200 }}
        >
          <Option value="login">Login</Option>
          <Option value="data change">Data Change</Option>
          <Option value="permission">Permission</Option>
          <Option value="broadcast">Broadcast</Option>
        </Select>
        <RangePicker onChange={(dates) => setDateRange(dates)} />
        <Button onClick={() => exportLogsAsCSV(filteredLogs)} type="primary">
          Tải CSV
        </Button>
        <Button onClick={() => exportLogsAsJSON(filteredLogs)} type="default">
          Tải JSON
        </Button>
      </Space>
      <Table
        dataSource={filteredLogs}
        columns={columns}
        rowKey={(record, index) => index}
      />
    </div>
  );
};

export default Logs;
