import React, { useContext, useEffect } from "react";
import { Container, Col, Row, Button } from "react-bootstrap";
import { CartContext } from "../contexts/CartContext";
import { Link } from "react-router-dom";
import { OrderContext } from "../contexts/OrderContext";
import CartProductCard from "../components/CartProductCard";
import CartHeader from "../components/CartHeader";

function Cart() {
  const { cart, incrementQuantity, decrementQuantity } = useContext(CartContext);
  const { order, setOrder } = useContext(OrderContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    let total = 0;
    cart.forEach((product) => {
      total += product.price * product.quantity;
    });
    setOrder((prevOrder) => ({ ...prevOrder, total: total, products: cart }));
  }, [cart, setOrder]);

  return (
    <Container fluid className="px-5 mt-4">
      {cart.length <= 0 ? (
        <Row>
          <h2 className="mx-2">Your Cart is Empty</h2>
        </Row>
      ) : (
        <>
          <Row>
            <h2 className="mx-2">Your Cart</h2>
          </Row>
          <Row>
            <CartHeader />
          </Row>
          <Row>
            <Container>
              {cart.map((product) => (
                <Row key={product.id}>
                  <CartProductCard
                    product={product}
                  />
                </Row>
              ))}
            </Container>
          </Row>
        </>
      )}

      <Row>
        <Container className="sticky-bottom bg-white">
          <Row>
            <Col className="mx-2">
              <h3>Total Price: ${order.total.toFixed(2)}</h3>
            </Col>
            <Col className="d-flex justify-content-end align-items-center">
              <div className="mx-2">
                You select {order.products.length} product(s)
              </div>
              {order.products.length <= 0 ? (
                <Button className="mx-2" variant="secondary" disabled>
                  Checkout
                </Button>
              ) : (
                <Button
                  className="mx-2"
                  variant="warning"
                  as={Link}
                  to="/checkout"
                >
                  Checkout
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </Row>
    </Container>
  );
}

export default Cart;
