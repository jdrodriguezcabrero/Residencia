import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
import React from 'react';
import { useAuth } from '../../context/AuthContext';

import {
  Person as PersonIcon,
  VpnKey as PasswordIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Función para obtener el color del chip según el rol
  const getRoleColor = (role) => {
    const roleColors = {
      'Administrador': 'primary',
      'Medico': 'success',
      'Enfermero': 'info',
      'Auxiliar': 'warning',
      'Recepcion': 'secondary'
    };
    
    return roleColors[role] || 'default';
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Avatar
              sx={{ 
                width: 150, 
                height: 150,
                bgcolor: theme => theme.palette[getRoleColor(user.rol)].main
              }}
            >
              <PersonIcon sx={{ fontSize: 80 }} />
            </Avatar>
          </Grid>

          <Grid item xs={12} md={8}>
            <Typography variant="h4" gutterBottom>
              {user.nombreCompleto || user.username}
            </Typography>
            
            <Chip 
              label={user.rol} 
              color={getRoleColor(user.rol)} 
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body1" paragraph>
              Usuario: <strong>{user.username}</strong>
            </Typography>
            
            <Typography variant="body1" paragraph>
              ID de Personal: <strong>{user.personalId || 'No asignado'}</strong>
            </Typography>
            
            <Button
              variant="contained"
              startIcon={<PasswordIcon />}
              onClick={() => navigate('/change-password')}
              sx={{ mt: 2 }}
            >
              Cambiar Contraseña
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Información de Seguridad
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" paragraph>
            <strong>Recuerde:</strong> Para garantizar la seguridad de la información de los residentes, 
            nunca comparta sus credenciales de acceso con otras personas y cierre sesión cuando 
            no esté utilizando el sistema.
          </Typography>
          
          <Typography variant="body1" paragraph>
            Si detecta algún comportamiento inusual en el sistema o tiene sospechas de que sus 
            credenciales han sido comprometidas, cambie su contraseña inmediatamente y notifique 
            al departamento de TI.
          </Typography>
        </Box>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Profile;