import React, { createContext, useState, useEffect } from "react";
import { productService } from "../services/api";

export const ProductsContext = createContext();

function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    productService.getAll().then((res) => {
      setProducts(res.data);
    });
  }, []);

  return (
    <ProductsContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export default ProductsProvider;
