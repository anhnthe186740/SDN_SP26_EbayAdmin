import React, { createContext, useState, useEffect } from 'react';
import { returnRequestService } from '../services/api';

export const ReturnsContext = createContext();

export const ReturnsProvider = ({ children }) => {
  const [returns, setReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    returnRequestService.getAll()
      .then((res) => setReturns(res.data))
      .catch((err) => console.error("Error fetching returns:", err));
  }, []);

  return (
    <ReturnsContext.Provider value={{ returns, selectedReturn, setSelectedReturn }}>
      {children}
    </ReturnsContext.Provider>
  );
};
