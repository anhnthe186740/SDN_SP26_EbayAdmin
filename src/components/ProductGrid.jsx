import React from "react";
import { Col } from "react-bootstrap";
import ProductVerticalCard from "./ProductVerticalCard";

function ProductGrid({ products }) {
  return (
    <>
      {products.map((product, index) => (
        <Col key={index} xs={12} sm={6} md={4} lg={3} className="mb-3">
          <ProductVerticalCard product={product} />
        </Col>
      ))}
    </>
  );
}

export default ProductGrid;
