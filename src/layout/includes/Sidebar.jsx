import React, { useState } from 'react';
import { Menu, Button } from 'antd';
import { AppstoreOutlined } from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const items = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <AppstoreOutlined />,
      path: '/admin/dashboard',
    },
    {
      key: 'users',
      label: 'Quản lý người dùng',
      icon: <AppstoreOutlined />,
      path: '/admin/users',
    },
    {
      key: 'products',
      label: 'Quản lý sản phẩm',
      icon: <AppstoreOutlined />,
      path: '/admin/products',
    },
    {
      key: 'orders',
      label: 'Quản lý đơn hàng',
      icon: <AppstoreOutlined />,
      path: '/admin/orders',
    },
    {
      key: 'reviews',
      label: 'Quản lý đánh giá',
      icon: <AppstoreOutlined />,
      path: '/admin/reviews',
    },
    {
      key: 'disputes',
      label: 'Quản lý khiếu nại',
      icon: <AppstoreOutlined />,
      path: '/admin/disputes',
    },
    {
      key: 'returns',
      label: 'Yêu cầu trả hàng',
      icon: <AppstoreOutlined />,
      path: '/admin/returns',
    },
    {
      key: 'broadcast',
      label: 'Phát thông báo',
      icon: <AppstoreOutlined />,
      path: '/admin/broadcast',
    },
    {
      key: 'settings',
      label: 'Cài đặt',
      icon: <AppstoreOutlined />,
      path: '/admin/settings',
    },
    {
      key: 'logs',
      label: 'Nhật ký hệ thống',
      icon: <AppstoreOutlined />,
      path: '/admin/logs',
    },
    {
      key: 'dashboard-config',
      label: 'Cấu hình Dashboard',
      icon: <AppstoreOutlined />,
      path: '/admin/dashboard-config',
    },
  ];

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  const handleItemClick = (key) => {
    const item = items.find((item) => item.key === key);
    if (item && item.path) {
      navigate(item.path);
    }
  };

  const selectedKey = items.find((item) => location.pathname === item.path)?.key || items[0].key;

  return (
    <div className="flex flex-col border-r-2 border-b-2 bg-gray-100 min-h-screen">
      <Button
          variant="primary"
          onClick={toggleCollapsed}
          className="d-flex align-items-center justify-content-center h-12 w-12"
          style={{ zIndex: 50 }}
        >
          <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
        </Button>
      <Menu
        style={{ width: collapsed ? 80 : 300 }}
        defaultSelectedKeys={[items[0].key]}
        selectedKeys={[selectedKey]}
        mode="inline"
        className="border-none bg-gray-100 flex-1"
        items={items}
        inlineCollapsed={collapsed}
        onClick={({ key }) => handleItemClick(key)}
      />
    </div>
  );
}

export default Sidebar;