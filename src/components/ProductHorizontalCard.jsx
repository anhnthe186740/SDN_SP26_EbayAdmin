import React from "react";
import { Card, Row, Col, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function ProductHorizontalCard({ product }) {
  return (
    <Card className="text-center m-2 p-2">
      <Row>
        <Col md={4}>
          <Card.Img className="h-100 w-100" src={product.thumbnail} alt={product.title} />
        </Col>
        <Col md={8}>
          <Card.Body>
            <Card.Title>{product.title}</Card.Title>
            <Card.Text>
              {product.category}
            </Card.Text>
            <Card.Text className="text-danger text-decoration-line-through">
              {product.price}
            </Card.Text>
            <Button as={Link} to={`/product/${product.id}`} variant="info" size="sm">Detail</Button>
          </Card.Body>
        </Col>
      </Row>
    </Card>
  );
}

export default ProductHorizontalCard;
