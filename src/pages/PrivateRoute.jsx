import React from "react";
import { Navigate } from "react-router-dom";

function PrivateRoute({ children, allowedRoles }) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!allowedRoles.includes(user.role)) {
    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/" />;
  }

  return children;
}

export default PrivateRoute;
