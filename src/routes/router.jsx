import React from "react";
import routes from "./index";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "../layout/MainLayout";
import AppWrapper from "../components/AppWrapper";
import Login from "../pages/Login"; // Import trực tiếp login page

function AppRouter() {
  return (
    <AppWrapper>
      <Router>
        <Routes>
          {/* Route login không dùng MainLayout */}
          <Route path="/login" element={<Login />} />

          {/* Các route khác sử dụng MainLayout */}
          <Route
            path="*"
            element={
              <MainLayout>
                <Routes>
                  {routes
                    .filter((route) => route.path !== "/login") // Bỏ login khỏi MainLayout
                    .map((route, idx) => (
                      <Route
                        key={idx + route.name}
                        path={route.path}
                        element={route.element}
                      />
                    ))}
                </Routes>
              </MainLayout>
            }
          />
        </Routes>
      </Router>
    </AppWrapper>
  );
}

export default AppRouter;
