import React, { useContext, useEffect } from "react";
import { OrderHistoryContext } from "../contexts/OrderHistoryContext";
import { Container, Table } from "react-bootstrap";

function OrderHistory() {
  const { orderHistory } = useContext(OrderHistoryContext);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center text-primary fw-bold">Order History</h1>
      <Table bordered hover responsive className="shadow-sm bg-white">
        <thead className="bg-light">
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Address</th>
            <th>Phone</th>
            <th>Products</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orderHistory.length > 0 ? (
            orderHistory.map((order, index) => (
              <tr key={index}>
                <td className="fw-bold">{index + 1}</td>
                <td>{order.customer.name}</td>
                <td>{order.customer.address}</td>
                <td>{order.customer.phone}</td>
                <td>
                  {order.products.map((product) => (
                    <div key={product.id}>
                      {product.title} - Qty: {product.quantity} - $
                      {(product.price * product.quantity).toFixed(2)}
                    </div>
                  ))}
                </td>
                <td className="fw-bold text-success">${order.total.toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center text-muted">
                No orders found in your history.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}

export default OrderHistory;
