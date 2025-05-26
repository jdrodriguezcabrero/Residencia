
import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    try {
      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } else {
        logout();
      }
    } catch (e) {
      console.error("Error parseando 'user' desde localStorage:", e);
      logout();
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authService.login({ username, password });
      console.log("✅ response.data:", response.data);
  
      const { token, usuario } = response.data;
  
      console.log("✅ Token recibido:", token);
      console.log("✅ Usuario recibido:", usuario);
  
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(usuario));
  
      setToken(token);
      setUser(usuario);
      setError(null);
  
      return response;
    } catch (err) {
      console.error('Error al iniciar sesión:', err);
      setError(err.response?.data?.message || 'Error en login');
      logout();
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        error,
        isAuthenticated: !!token,
        hasRole: (roles) => user && roles.includes(user.rol),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
