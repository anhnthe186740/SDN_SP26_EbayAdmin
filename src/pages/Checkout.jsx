import React, { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { OrderContext } from "../contexts/OrderContext";
import { OrderHistoryContext } from "../contexts/OrderHistoryContext";
import { CartContext } from "../contexts/CartContext";
import { Container, Col, Row, Button, Form, Image } from "react-bootstrap";

function Checkout() {
  const navigate = useNavigate();
  const [isFulfilled, setIsFulfilled] = useState(false);
  const [validated, setValidated] = useState(false);
  const [errors, setErrors] = useState({});
  const { order, setOrder } = useContext(OrderContext);
  const { orderHistory, setOrderHistory } = useContext(OrderHistoryContext);
  const { setCart } = useContext(CartContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (
      order.customer.name !== "" &&
      order.customer.address !== "" &&
      order.customer.phone !== "" &&
      order.products.length > 0
    ) {
      setIsFulfilled(true);
    } else {
      setIsFulfilled(false);
    }
  }, [order, setOrder]);

  const handleValidation = () => {
    const newErrors = {};

    // Validate Name
    if (!order.customer.name.trim()) {
      newErrors.name = "Name is required.";
    } else if (order.customer.name.length < 3) {
      newErrors.name = "Name must be at least 3 characters long.";
    }

    // Validate Address
    if (!order.customer.address.trim()) {
      newErrors.address = "Address is required.";
    }

    // Validate Phone
    if (!order.customer.phone.trim()) {
      newErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(order.customer.phone.trim())) {
      newErrors.phone = "Phone number must be 10 digits.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (handleValidation()) {
      setOrderHistory([...orderHistory, order]);
      setOrder({
        customer: {
          name: "",
          address: "",
          phone: "",
        },
        products: [],
        total: 0,
      });
      setCart((prevCart) =>
        prevCart.filter((cartProduct) => !order.products.includes(cartProduct))
      );
      setValidated(true);
      navigate("/order-history");
    } else {
      setValidated(false);
    }
  };

  return (
    <Container fluid className="px-5 mt-4">
      <Row className="mb-4">
        <Col>
          <Button variant="warning" as={Link} to="/cart" className="px-4 py-2">
            Back to Cart
          </Button>
        </Col>
      </Row>
      <Row className="gy-4">
        {/* Customer Information Section */}
        <Col lg={6}>
          <div className="p-4 border rounded shadow-sm bg-light">
            <h2 className="mb-4 ">Customer Information</h2>
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Group controlId="formName" className="mb-3">
                <Form.Label className="fw-bold">Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={order.customer.name}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      customer: { ...order.customer, name: e.target.value },
                    })
                  }
                  isInvalid={!!errors.name}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.name}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formAddress" className="mb-3">
                <Form.Label className="fw-bold">Address</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={order.customer.address}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      customer: { ...order.customer, address: e.target.value },
                    })
                  }
                  isInvalid={!!errors.address}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.address}
                </Form.Control.Feedback>
              </Form.Group>
              <Form.Group controlId="formPhone" className="mb-3">
                <Form.Label className="fw-bold">Phone</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={order.customer.phone}
                  onChange={(e) =>
                    setOrder({
                      ...order,
                      customer: { ...order.customer, phone: e.target.value },
                    })
                  }
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>
              <div className="mt-4 d-flex justify-content-end">
                <Button variant="success" type="submit">
                  Place Order
                </Button>
              </div>
            </Form>
          </div>
        </Col>

        {/* Order Summary Section */}
        <Col lg={6}>
          <div className="p-4 border rounded shadow-sm bg-light sticky-top">
            <h2 className="mb-4 ">Order Summary</h2>
            <Container>
              {order.products.map((product) => (
                <Row
                  className="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3"
                  key={product.id}
                >
                  <Col lg={3} className="text-center">
                    <Image
                      src={product.thumbnail}
                      alt={product.title}
                      style={{ width: "80px" }}
                      className="border rounded"
                    />
                  </Col>
                  <Col lg={5}>
                    <p className="mb-1 fw-bold">{product.title}</p>
                    <p className="text-muted mb-0">Quantity: {product.quantity}</p>
                  </Col>
                  <Col lg={4} className="text-end">
                    <p className="fw-bold text-success">
                      ${(product.price * product.quantity).toFixed(2)}
                    </p>
                  </Col>
                </Row>
              ))}
            </Container>
            <h4 className="mt-4 fw-bold text-success">
              Total Price: ${order.total.toFixed(2)}
            </h4>
          </div>
        </Col>
      </Row>

      {/* Action Buttons */}
      {/*  */}
    </Container>
  );
}

export default Checkout;
