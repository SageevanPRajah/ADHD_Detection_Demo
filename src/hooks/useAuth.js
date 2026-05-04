import { useState, useEffect } from "react";
import axios from "axios";
import { clearStoredAuth, getStoredAuth, saveStoredAuth } from "../utils/authSession.js";

export const useAuth = () => {
  const storedAuth = getStoredAuth();

  const [user, setUser] = useState(storedAuth.user);
  const [token, setToken] = useState(storedAuth.token);
  const [isAuthenticated, setIsAuthenticated] = useState(!!storedAuth.user && !!storedAuth.token);

  // whenever token changes, apply it to axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const login = (newToken, userData, rememberMe = true) => {
    saveStoredAuth(newToken, userData, rememberMe);

    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearStoredAuth();

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  return { user, token, isAuthenticated, login, logout };
};
