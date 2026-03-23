// src/contexts/ReturnsContext.js

import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const ReturnsContext = createContext();

export const ReturnsProvider = ({ children }) => {
  const [returns, setReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);

  useEffect(() => {
    const url = process.env.REACT_APP_API_PATH;
    // Fetch return requests
    axios
      .get(`${url}/returns`)
      .then((res) => setReturns(res.data))
      .catch((err) => console.error("Error fetching returns:", err));
  }, []);

  return (
    <ReturnsContext.Provider value={{ returns, selectedReturn, setSelectedReturn }}>
      {children}
    </ReturnsContext.Provider>
  );
};
