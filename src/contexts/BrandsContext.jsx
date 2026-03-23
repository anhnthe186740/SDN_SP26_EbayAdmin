import React, { createContext, useState, useContext, useEffect } from "react";
import { ProductsContext } from "./ProductsContext";
import { CategoriesContext } from "./CategoriesContext";

export const BrandsContext = createContext();

function BrandsProvider({ children }) {
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState({});

  const { products } = useContext(ProductsContext);
  const { selectedCategory } = useContext(CategoriesContext);

  useEffect(() => {
    const brandsObj = {};
    products.forEach((product) => {
      if (selectedCategory === "All" || product.category === selectedCategory) {
        if (!brandsObj[product.brand]) {
          brandsObj[product.brand] = {
            id: product.brand,
            name: product.brand,
          };
        }
      }
    });
    setBrands(Object.values(brandsObj));
  }, [products, selectedCategory]);

  useEffect(() => {

    if (brands.length === 0) {
      return
    }

    const selectedBrandsObj = {};
    brands.forEach((brand) => {
      selectedBrandsObj[brand.id] = true;
    });
    setSelectedBrands(selectedBrandsObj);
  }, [brands]);

  const handleSelectBrands = (brandId) => {
    setSelectedBrands({
      ...selectedBrands,
      [brandId]: !selectedBrands[brandId],
    });
  };

  return (
    <BrandsContext.Provider
      value={{ brands, setBrands, selectedBrands, setSelectedBrands, handleSelectBrands }}
    >
      {children}
    </BrandsContext.Provider>
  );
}

export default BrandsProvider;
