import React, { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
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
          <Container fluid className="flex-grow-1">
            <Row className="h-100">
              <Col md={3} className="bg-light h-100">
                <Sidebar />
              </Col>
              <Col md={9} className="p-4 bg-white">
                <main>{children}</main>
              </Col>
            </Row>
          </Container>
        ) : (
          <Container fluid className="flex-grow-1 p-4 bg-white">
            <main>{children}</main>
            <Footer />
          </Container>
        )}
      </div>
    </Suspense>
  );
}

export default MainLayout;