import React, { useContext } from 'react'
import { SearchContext } from "../contexts/SearchContext";
import { ProductsContext } from "../contexts/ProductsContext";

function ProductList() {
    const { products } = useContext(ProductsContext);
    const { search } = useContext(SearchContext);
  
    const filteredProducts = products.filter((product) => (
      product.title.toLowerCase().includes(search.toLowerCase())
    ))

  return (
    <>
      {filteredProducts && filteredProducts.map((product, idx) => (
        <div key={idx + product.title}>
          <h2>{product.title}</h2>
        </div>
      ))}
    </>
  )
}

export default ProductList