import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Loading from '../components/Loading';

const Header = lazy(() => import('./includes/Header'));
const Footer = lazy(() => import('./includes/Footer'));
const Sidebar = lazy(() => import('./includes/Sidebar'));

function MainLayout({ children }) {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <Suspense fallback={<Loading />}>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        {isAdminRoute ? (
          <div className="d-flex flex-grow-1 overflow-hidden main-layout-wrapper">

            {/* 1. THÊM CLASS admin-sidebar VÀO ĐÂY */}
            <div className="admin-sidebar shadow-sm" style={{ width: 'auto', minHeight: '100vh', zIndex: 100 }}>
              <Sidebar />
            </div>

            <main className="flex-grow-1 p-4 overflow-auto" style={{ height: '100vh' }}>
              <div className="container-fluid">
                {children}
              </div>
            </main>

          </div>
        ) : (
          <Container fluid className="flex-grow-1 p-4" style={{ background: 'var(--bg-main)' }}>
            <main>{children}</main>
            <Footer />
          </Container>
        )}
      </div>
    </Suspense>
  );
}

export default MainLayout;