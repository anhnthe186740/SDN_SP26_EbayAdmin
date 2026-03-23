import React, { createContext, useState, useEffect, useContext } from "react";
import { ProductsContext } from "./ProductsContext";
export const CategoriesContext = createContext();

function CategoriesProvider({ children }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { products } = useContext(ProductsContext);

  useEffect(() => {
    const categories = products.flatMap((product) => product.category);
    setCategories([...new Set(categories)]);

    const categoryThumbnails = {};
    products.forEach((product) => {
      if (!categoryThumbnails[product.category]) {
        categoryThumbnails[product.category] = product.thumbnail;
      }
    });
    
    setCategories(
      [...new Set(categories)].map((category) => ({
        name: category,
        thumbnail: categoryThumbnails[category],
      }))
    );
  }, [products]);

  return (
    <CategoriesContext.Provider
      value={{
        selectedCategory,
        setSelectedCategory,
        categories,
        setCategories,
      }}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export default CategoriesProvider;
