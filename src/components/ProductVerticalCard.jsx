import React from "react";
import { Card, ListGroup, Button } from "react-bootstrap";
import { Link } from "react-router-dom";


function ProductVerticalCard({ product }) {
  return (
    <Card>
      <Card.Img variant="top" src={product.thumbnail} />
      <Card.Body>
        <Card.Title>{product.title}</Card.Title>
        <ListGroup variant="flush">
          <ListGroup.Item>Price: ${product.price}</ListGroup.Item>
          <ListGroup.Item>Category: {product.category}</ListGroup.Item>
          <ListGroup.Item>Tag: {product.tags.join(", ")}</ListGroup.Item>
          <ListGroup.Item>Brand: {product.brand}</ListGroup.Item>
        </ListGroup>
        <Link to={`/product/${product.id}`}>
          <Button className="mt-2">Details</Button>
        </Link>
      </Card.Body>
    </Card>
  );
}

export default ProductVerticalCard;
