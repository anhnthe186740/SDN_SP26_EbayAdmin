import React, { createContext, useState } from "react";

export const OrderHistoryContext = createContext();

function OrderHistoryProvider({ children }) {
  const [orderHistory, setOrderHistory] = useState([]);
  return (
    <OrderHistoryContext.Provider value={{ orderHistory, setOrderHistory }}>
      {children}
    </OrderHistoryContext.Provider>
  );
}

export default OrderHistoryProvider;
