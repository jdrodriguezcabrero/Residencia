import { Alert, AppBar, Avatar, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Container, CssBaseline, Divider, Drawer, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select, Stack, TextField, Toolbar, Typography, mui } from '@mui/material';
// src/components/auth/Register.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import {
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    password: '',
    rol: 'Administrador',
    personalId: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    
    // Validaciones básicas
    if (!formData.nombre.trim()) {
      setError('El nombre de usuario es requerido');
      return;
    }
    
    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return;
    }
    
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    
    try {
      setLoading(true);
      
      await authService.register(formData);
      
      setSuccess(true);
      setFormData({
        nombre: '',
        password: '',
        rol: 'Administrador',
        personalId: ''
      });
      
      // Opcional: redirigir después de un tiempo
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
        console.error('Error en registro:', err);
        console.log('Respuesta del servidor:', err.response?.data);
        setError(err.response?.data?.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  const roles = ['Administrador', 'Medico', 'Enfermero', 'Auxiliar', 'Recepcion'];

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          Registrar Nuevo Usuario
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mt: 2, mb: 2 }}>
            Usuario registrado correctamente. Redirigiendo...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="nombre"
            label="Nombre de Usuario"
            name="nombre"
            autoComplete="username"
            autoFocus
            value={formData.nombre}
            onChange={handleChange}
            disabled={loading || success}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleChange}
            disabled={loading || success}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel id="rol-label">Rol</InputLabel>
            <Select
              labelId="rol-label"
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={loading || success}
              label="Rol"
            >
              {roles.map((rol) => (
                <MenuItem key={rol} value={rol}>
                  {rol}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            margin="normal"
            fullWidth
            id="personalId"
            label="ID de Personal (opcional)"
            name="personalId"
            type="number"
            value={formData.personalId}
            onChange={handleChange}
            disabled={loading || success}
            helperText="Deja en blanco si no está asociado a un miembro del personal"
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading || success}
          >
            {loading ? <CircularProgress size={24} /> : 'Registrar Usuario'}
          </Button>
          
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Volver al Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;