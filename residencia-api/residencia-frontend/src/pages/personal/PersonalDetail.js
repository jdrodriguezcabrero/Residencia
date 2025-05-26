import { 
  Box, Typography, Button, Grid, Paper, Avatar, Chip, Card, CardContent, Alert, CircularProgress, Container, List, ListItem, ListItemIcon, ListItemText 
} from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { personalService } from '../../services/api';
import { formatDate, calcularEdad } from '../../utils/dateUtils';

import {
  Person as PersonIcon,
  Cake as BirthdayIcon,
  Today as DateIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon
} from '@mui/icons-material';

const PersonalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        setLoading(true);
        const response = await personalService.getById(id);
console.log('🟢 Datos recibidos del backend:', response.data);

if (!response.data || Object.keys(response.data).length === 0) {
  console.warn('⚠️ No se encontró información del empleado con id:', id);
  setEmpleado(null);
} else {
  setEmpleado(response.data);
}

      } catch (err) {
        console.error('Error al cargar empleado:', err);
        setError('Error al cargar la información del empleado. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [id]);

  // Obtener color según la categoría
  const getCategoriaColor = (categoria) => {
    const categoriaMap = {
      'Médico': 'success',
      'Enfermero': 'info',
      'Auxiliar': 'warning',
      'Administrativo': 'primary',
      'Recepción': 'secondary'
    };
    
    return categoriaMap[categoria] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!empleado) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró información del empleado</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/personal')}
        >
          Volver a la lista
        </Button>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/personal/edit/${id}`)}
        >
          Editar Empleado
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'primary.main' }}
            >
              {empleado.Nombre?.charAt(0)}
            </Avatar>
            
            <Typography variant="h5" sx={{ mt: 2 }}>
              {empleado.Nombre} {empleado.Apellidos}
            </Typography>
            
            <Chip 
              label={empleado.Categoria}
              color={getCategoriaColor(empleado.Categoria)}
              sx={{ mt: 1 }}
            />
            
            <Box sx={{ mt: 1 }}>
              <Chip 
                label={empleado.Activo ? 'Activo' : 'Inactivo'} 
                color={empleado.Activo ? 'success' : 'error'} 
                size="small"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información Personal
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="DNI" secondary={empleado.DNI} />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <BirthdayIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Fecha de Nacimiento" 
                          secondary={`${formatDate(empleado.FechaNacimiento)} (${calcularEdad(empleado.FechaNacimiento)} años)`} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <DateIcon />
                        </ListItemIcon>
                        <ListItemText primary="Fecha de Contratación" secondary={formatDate(empleado.FechaContratacion)} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información de Contacto
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText primary="Teléfono" secondary={empleado.Telefono || 'No especificado'} />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon />
                        </ListItemIcon>
                        <ListItemText primary="Email" secondary={empleado.Email || 'No especificado'} />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <HomeIcon />
                        </ListItemIcon>
                        <ListItemText primary="Dirección" secondary={empleado.Direccion || 'No especificada'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información Laboral
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <WorkIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Categoría" 
                          secondary={
                            <Chip 
                              label={empleado.Categoria} 
                              color={getCategoriaColor(empleado.Categoria)} 
                              size="small" 
                            />
                          } 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <DateIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Antigüedad" 
                          secondary={`${calcularAntiguedad(empleado.FechaContratacion)} años`} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        {/* Aquí podrían ir secciones adicionales como horarios, etc. */}
      </Paper>
    </Container>
  );
};

// Función auxiliar para calcular antigüedad
const calcularAntiguedad = (fechaContratacion) => {
  if (!fechaContratacion) return 'N/A';
  try {
    const hoy = new Date();
    const fechaContrato = new Date(fechaContratacion);
    let años = hoy.getFullYear() - fechaContrato.getFullYear();
    const m = hoy.getMonth() - fechaContrato.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < fechaContrato.getDate())) {
      años--;
    }
    
    return años;
  } catch (error) {
    console.error('Error al calcular antigüedad:', error);
    return 'N/A';
  }
};

export default PersonalDetail;