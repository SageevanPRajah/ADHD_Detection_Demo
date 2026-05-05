import React from "react";
import { Navigate } from "react-router-dom";
import { getStoredAuth } from "../utils/authSession.js";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { token, user } = getStoredAuth();

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;