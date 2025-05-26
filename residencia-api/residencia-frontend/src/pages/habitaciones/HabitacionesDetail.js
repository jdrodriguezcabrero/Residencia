import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { habitacionesService, residentesService } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';


import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  MeetingRoom as RoomIcon,
  Construction as ConstructionIcon,
  CheckCircle as AvailableIcon,
  Person as PersonIcon
} from '@mui/icons-material';

const HabitacionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [habitacion, setHabitacion] = useState(null);
  const [residentes, setResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Cargar datos de la habitación
        const habitacionResponse = await habitacionesService.getById(id);
        const habitacionData = habitacionResponse.data.data;
        setHabitacion(habitacionData);
        
        // Si la habitación está ocupada, buscar los residentes asignados
        if (habitacionData.Estado === 'Ocupada') {
          const residentesResponse = await residentesService.getAll();
          const residentesAsignados = residentesResponse.data.data.filter(
            r => r.NumeroHabitacion === habitacionData.Numero && r.Activo
          );
          setResidentes(residentesAsignados);
        }
      } catch (err) {
        console.error('Error al cargar habitación:', err);
        setError('Error al cargar la información de la habitación. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchResidentes = async () => {
      const res = await habitacionesService.getResidentes(id);
      setResidentes(res.data);
    };
    fetchResidentes();
  }, [id]);
  
  useEffect(() => {
    const fetchHistorial = async () => {
      const res = await habitacionesService.getHistorialCambios(id);
      setHistorial(res.data);
    };
    fetchHistorial();
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Disponible':
        return 'success';
      case 'Ocupada':
        return 'primary';
      case 'Mantenimiento':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case 'Disponible':
        return <AvailableIcon />;
      case 'Ocupada':
        return <RoomIcon />;
      case 'Mantenimiento':
        return <ConstructionIcon />;
      default:
        return null;
    }
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

  if (!habitacion) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró información de la habitación</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/habitaciones')}
        >
          Volver a la lista
        </Button>
        
        {hasRole(['Administrador']) && habitacion.Estado !== 'Ocupada' && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/habitaciones/edit/${id}`)}
          >
            Editar Habitación
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              Habitación {habitacion.Numero}
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Chip
                icon={getEstadoIcon(habitacion.Estado)}
                label={habitacion.Estado}
                color={getEstadoColor(habitacion.Estado)}
                sx={{ mr: 1 }}
              />

<Typography variant="h6" sx={{ mt: 4 }}>Historial de Cambios</Typography>
{historial.length === 0 ? (
  <Typography variant="body2">No hay historial.</Typography>
) : (
  <ul>
    {historial.map((c, i) => (
      <li key={i}>
        {formatDate(c.FechaCambio)} - {c.NombreResidente} {c.Apellidos} pasó de Habitación {c.HabitacionAnterior} a {c.HabitacionNueva}. Motivo: {c.MotivoDelCambio}. Registrado por: {c.Personal}
      </li>
    ))}
  </ul>
)}

              
              <Typography variant="subtitle1">
                {habitacion.Tipo} - Planta {habitacion.Planta}
              </Typography>
            </Box>
            
            {habitacion.Observaciones && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Observaciones
                </Typography>
                <Typography variant="body1">
                  {habitacion.Observaciones}
                </Typography>
              </Box>
            )}
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Características
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Tipo
                    </Typography>
                    <Typography variant="body1">
                      {habitacion.Tipo}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Planta
                    </Typography>
                    <Typography variant="body1">
                      {habitacion.Planta}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Capacidad
                    </Typography>
                    <Typography variant="body1">
                      {habitacion.Tipo === 'Individual' ? '1 persona' : 
                       habitacion.Tipo === 'Doble' ? '2 personas' : 
                       habitacion.Tipo === 'Triple' ? '3 personas' : 'No especificada'}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Estado actual
                    </Typography>
                    <Chip
                      icon={getEstadoIcon(habitacion.Estado)}
                      label={habitacion.Estado}
                      color={getEstadoColor(habitacion.Estado)}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {habitacion.Estado === 'Ocupada' && residentes.length > 0 && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6">Residentes Asignados</Typography>
{residentes.length === 0 ? (
  <Typography variant="body2">No hay residentes asignados.</Typography>
) : (
  <ul>
    {residentes.map(r => (
      <li key={r.ResidenteID}>
        {r.Nombre} {r.Apellidos} (Ingreso: {formatDate(r.FechaIngreso)})
      </li>
    ))}
  </ul>
)}

            <Typography variant="h6" gutterBottom>
              Residentes asignados
            </Typography>
            
            <List>
              {residentes.map((residente) => (
                <ListItem 
                  key={residente.ResidenteID} 
                  button 
                  onClick={() => navigate(`/residentes/${residente.ResidenteID}`)}
                  sx={{ bgcolor: 'background.default', mb: 1, borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${residente.Nombre} ${residente.Apellidos}`}
                    secondary={`DNI: ${residente.DNI}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default HabitacionDetail;