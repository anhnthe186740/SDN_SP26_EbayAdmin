import React from "react";
import { Container, Row, Col } from "react-bootstrap";

function CartHeader() {
  return (
    <Container>
      <Row className="d-flex align-items-center justify-content-center">
        <Col lg={1} className="d-flex align-items-center justify-content-center">Select</Col>
        <Col lg={4}>Product</Col>
        <Col lg={2}>
          <p>Price</p>
        </Col>
        <Col lg={2}>
          <p>Quantity</p>
        </Col>
        <Col lg={2}>
          <p>Total</p>
        </Col>
        <Col lg={1}>
          <p>Action</p>
        </Col>
      </Row>
    </Container>
  );
}

export default CartHeader;
