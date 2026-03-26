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
    // {
    //   key: 'broadcast',
    //   label: 'Phát thông báo',
    //   icon: <AppstoreOutlined />,
    //   path: '/admin/broadcast',
    // },
    // {
    //   key: 'settings',
    //   label: 'Cài đặt',
    //   icon: <AppstoreOutlined />,
    //   path: '/admin/settings',
    // },
  //   {
  //     key: 'logs',
  //     label: 'Nhật ký hệ thống',
  //     icon: <AppstoreOutlined />,
  //     path: '/admin/logs',
  //   },
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
    <div className="sidebar-acrylic d-flex flex-column h-100 shadow-sm" style={{ minHeight: '100vh', width: collapsed ? 80 : 280, transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
      <div className="p-4 d-flex justify-content-between align-items-center">
        {!collapsed && <span className="fw-bold text-primary" style={{ fontSize: '1.2rem', letterSpacing: '-0.5px' }}>EBAY ADMIN</span>}
        <Button
            type="text"
            onClick={toggleCollapsed}
            className="d-flex align-items-center justify-content-center p-0 ms-auto me-2"
            style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(0,0,0,0.05)' }}
          >
            <i className={`bi ${collapsed ? 'bi-chevron-right' : 'bi-chevron-left'}`}></i>
          </Button>
      </div>
      <Menu
        defaultSelectedKeys={[items[0].key]}
        selectedKeys={[selectedKey]}
        mode="inline"
        theme="light"
        className="border-none bg-transparent px-2"
        inlineCollapsed={collapsed}
        onClick={({ key }) => handleItemClick(key)}
        items={items.map(item => ({
          ...item,
          className: selectedKey === item.key ? 'sidebar-item-active' : 'mb-1 rounded-3'
        }))}
        style={{ borderRight: 0 }}
      />
    </div>
  );
}

export default Sidebar;