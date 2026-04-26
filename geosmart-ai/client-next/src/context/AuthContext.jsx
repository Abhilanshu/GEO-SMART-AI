"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('geosmart_token');
    const storedUser = localStorage.getItem('geosmart_user');
    
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['x-auth-token'] = storedToken;
      if (storedUser) setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('http://localhost:5002/api/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('geosmart_token', token);
    localStorage.setItem('geosmart_user', JSON.stringify(user));
    setToken(token);
    setUser(user);
    axios.defaults.headers.common['x-auth-token'] = token;
    return user;
  };

  const logout = () => {
    localStorage.removeItem('geosmart_token');
    localStorage.removeItem('geosmart_user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['x-auth-token'];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
