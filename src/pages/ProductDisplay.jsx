import React, { Suspense, useContext, useState, useEffect } from "react";
import { Col, Row, Container, Card } from "react-bootstrap";

import { ProductsContext } from "../contexts/ProductsContext";
import { SearchContext } from "../contexts/SearchContext";
import { CategoriesContext } from "../contexts/CategoriesContext";
import { BrandsContext } from "../contexts/BrandsContext";

import SearchBar from "../components/SearchBar";
import Loading from "../components/Loading";
import SelectCategory from "../components/SelectCategory";
import SelectBrands from "../components/SelectBrands";
import PaginationSection from "../components/PaginationSection";
import ProductGrid from "../components/ProductGrid";

function ProductDisplay() {
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;
  const { products } = useContext(ProductsContext);
  const { search } = useContext(SearchContext);
  const { selectedCategory } = useContext(CategoriesContext);
  const { selectedBrands } = useContext(BrandsContext);

  const filteredProducts = products.filter((product) => {
    const isCategoryMatch =
      selectedCategory === "All" || product.category === selectedCategory;
    const isBrandMatch = selectedBrands[product.brand];
    const isSearchMatch = product.title.toLowerCase().includes(search.toLowerCase());
    return isCategoryMatch && isBrandMatch && isSearchMatch;
  });

  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedBrands]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return (
    <Container className="py-4">
      <Row>
        {/* Sidebar Section */}
        <Col md={3}>
          <Card className="p-3 mb-4 shadow-sm">
            <h5 className="mb-3 text-primary fw-bold">Categories</h5>
            <SelectCategory />
          </Card>
          {/* <Card className="p-3 shadow-sm">
            <h5 className="mb-3 text-primary fw-bold">Brands</h5>
            <SelectBrands />
          </Card> */}
        </Col>

        {/* Main Section */}
        <Col md={9}>
          <Row className="mb-4">
            
            <SearchBar />
            
            
            <Card className="p-3 shadow-sm mt-2">
            <h5 className="mb-3 text-primary fw-bold">Brands</h5>
            <SelectBrands />
          </Card>
          </Row>

          <Suspense fallback={<Loading />}>
            {filteredProducts.length === 0 && (
              <Row>
                <h4 className="text-center text-danger mt-4">
                  No products found.
                </h4>
              </Row>
            )}

            <Row className="mt-4">
              <ProductGrid products={currentProducts} />
            </Row>
          </Suspense>

          <Row className="mt-4">
            <PaginationSection
              totalPages={totalPages}
              currentPage={currentPage}
              handlePageChange={handlePageChange}
            />
          </Row>
        </Col>
      </Row>
    </Container>
  );
}

export default ProductDisplay;
