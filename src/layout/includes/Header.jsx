import React from "react";
import { Container, Navbar, Nav, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <Navbar bg="dark" data-bs-theme="dark">
      <Container>
        <Col>
          <Link to="/">
            <img
              style={{ width: "100px" }}
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/EBay_logo.svg/800px-EBay_logo.svg.png"
            />
          </Link>
        </Col>

        {isAdmin ? (
          <Col>
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/dashboard">Dashboard</Nav.Link>
            </Nav>
          </Col>
        ) : (
          <>
            <Col>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/products">Product</Nav.Link>
              </Nav>
            </Col>
            <Col>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/cart">Cart</Nav.Link>
              </Nav>
            </Col>
            <Col>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/order-history">History</Nav.Link>
              </Nav>
            </Col>
          </>
        )}

        <Col>
          <Nav className="me-auto">
            {user ? (
              <Nav.Link onClick={handleLogout}>Logout ({user.username})</Nav.Link>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Col>
      </Container>
    </Navbar>
  );
}

export default Header;