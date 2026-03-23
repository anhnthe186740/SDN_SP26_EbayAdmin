import React from "react";
import SearchProvider from "../contexts/SearchContext";
import OrderProvider from "../contexts/OrderContext";
import OrderHistoryProvider from "../contexts/OrderHistoryContext";
import ProductsProvider from "../contexts/ProductsContext";
import CategoriesProvider from "../contexts/CategoriesContext";
import BrandsProvider from "../contexts/BrandsContext";
import CartProvider from "../contexts/CartContext";

function AppWrapper({ children }) {
  return (
    <OrderHistoryProvider>
      <OrderProvider>
        <CartProvider>
          <ProductsProvider>
            <CategoriesProvider>
              <BrandsProvider>
                <SearchProvider>{children}</SearchProvider>
              </BrandsProvider>
            </CategoriesProvider>
          </ProductsProvider>
        </CartProvider>
      </OrderProvider>
    </OrderHistoryProvider>
  );
}

export default AppWrapper;
