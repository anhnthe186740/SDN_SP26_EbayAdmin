import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const ProductsContext = createContext();

function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);

  const url = process.env.REACT_APP_API_PATH;
  useEffect(() => {
    axios.get(`${url}/products`).then((res) => {
      setProducts(res.data);
    });
  }, [url]);

  return (
    <ProductsContext.Provider value={{ products, setProducts }}>
      {children}
    </ProductsContext.Provider>
  );
}

export default ProductsProvider;
