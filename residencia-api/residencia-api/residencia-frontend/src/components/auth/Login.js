import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();




  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setFormError('');
  
    if (!username.trim()) {
      setFormError('El nombre de usuario es requerido');
      return;
    }
  
    if (!password) {
      setFormError('La contraseña es requerida');
      return;
    }
  
    setLoading(true);
  
    try {
      await login(username, password);
      navigate('/dashboard');
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.message || "Error en login");
    } finally {
      setLoading(false);
    }
  };
  
  

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={3}
        sx={{
          marginTop: 8,
          padding: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Gestión Residencia de Ancianos
        </Typography>

        <Typography component="h2" variant="h5" sx={{ mt: 2 }}>
          Iniciar Sesión
        </Typography>

        {formError && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {formError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Nombre de usuario"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Contraseña"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Iniciar Sesión'}
          </Button>
        </Box>
      </Paper>

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          ¿No tienes una cuenta?{' '}
          <Button
            color="primary"
            onClick={() => navigate('/register')}
            sx={{ textTransform: 'none' }}
          >
            Registrarse
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
