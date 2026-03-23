import React, { useContext } from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import { CategoriesContext } from "../contexts/CategoriesContext";

function CategoriesSection() {
  const { categories, setSelectedCategory } = useContext(CategoriesContext);

  return (
    <Container className="text-center my-5">
      <h2>Explore Popular Categories</h2>
      <Row className="mt-4">
        {categories.map((category, index) => (
          <Col key={index} xs={6} sm={4} md={3} lg={2} className="mb-4">
            <Link className="text-muted text-decoration-none" to={`/products`} key={index} onClick={() => setSelectedCategory(category.name)}>
              <Image
                src={category.thumbnail}
                alt={category.name}
                className="rounded-circle"
                style={{
                  width: "100px",
                  height: "100px",
                  objectFit: "cover",
                }}
              />
              <h6 className="mt-2 text-center">{category.name}</h6>
            </Link>
          </Col>
        ))}
      </Row>
    </Container>
  );
}

export default CategoriesSection;
