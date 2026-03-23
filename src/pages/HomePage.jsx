import React, { useEffect } from "react";
import { Container } from "react-bootstrap";
import CarouselSection from "../components/CarouselSection";
import CategoriesSection from "../components/CategoriesSection";

function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <Container fluid>
      <CarouselSection />
      <CategoriesSection />
    </Container>
  );
}

export default HomePage;
