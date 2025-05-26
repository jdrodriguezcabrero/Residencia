import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/pages/residentes/ResidenteDetail.js (modificado)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { residentesService } from '../../services/api';
import { formatDate, calcularEdad } from '../../utils/dateUtils';
import CambioHabitacionModal from './CambioHabitacionModal';


import {
  Person as PersonIcon,
  Cake as BirthdayIcon,
  Today as DateIcon,
  Home as HomeIcon,
  Phone as PhoneIcon,
  LocalHospital as MedicalIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const ResidenteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [residente, setResidente] = useState(null);
  const [tratamientos, setTratamientos] = useState([]);
  const [dietas, setDietas] = useState([]);
  const [actividades, setActividades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openCambio, setOpenCambio] = useState(false);

  useEffect(() => {
    const fetchDetalles = async () => {
      console.log('🟡 ID capturado desde useParams:', id);
      console.log(`📡 URL completa: ${process.env.REACT_APP_API || 'http://localhost:3001/api'}/residentes/${id}/detalles-completos`);

      try {
        console.log(`🟢 Llamando a: /residentes/${id}/detalles-completos`);
        setLoading(true);
        const response = await residentesService.getDetallesCompletos(id);
        const data = response.data.data;
        setResidente(data.residente);
        setTratamientos(data.tratamientos);
        setDietas(data.dietas);
        setActividades(data.actividades);
      } catch (err) {
        console.error('Error al cargar detalles:', err);
        setError('No se pudieron cargar los datos completos del residente.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchDetalles();
  }, [id]);
  

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

  if (!residente) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró información del residente</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/residentes')}
        >
          Volver a la lista
        </Button>
        
        {hasRole(['Administrador', 'Medico']) && (
          <>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/residentes/edit/${id}`)}
          >
            Editar Residente
          </Button>
          <Button
          variant="outlined"
          color="secondary"
          onClick={() => setOpenCambio(true)}
        >
          Cambiar Habitación
        </Button>
        <Button
  variant="outlined"
  color={residente.Activo ? 'error' : 'success'}
  onClick={async () => {
    try {
      const nuevoEstado = !residente.Activo;
      await residentesService.updateEstado(residente.ResidenteID, nuevoEstado);
      setResidente({ ...residente, Activo: nuevoEstado });
    } catch (error) {
      console.error("Error al actualizar el estado:", error);
      alert("No se pudo cambiar el estado del residente.");
    }
  }}
>
  {residente.Activo ? 'Desactivar Residente' : 'Activar Residente'}
</Button>

        </>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar
              sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'primary.main' }}
            >
              {residente.Nombre?.charAt(0)}
            </Avatar>
            
            <Typography variant="h5" sx={{ mt: 2 }}>
              {residente.Nombre} {residente.Apellidos}
            </Typography>
            
            <Chip 
              label={residente.Activo ? 'Activo' : 'Inactivo'} 
              color={residente.Activo ? 'success' : 'error'} 
              sx={{ mt: 1 }}
            />
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
                        <ListItemText primary="DNI" secondary={residente.DNI} />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <BirthdayIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Fecha de Nacimiento" 
                          secondary={`${formatDate(residente.FechaNacimiento)} (${calcularEdad(residente.FechaNacimiento)} años)`} 
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Género" 
                          secondary={residente.Genero === 'M' ? 'Masculino' : residente.Genero === 'F' ? 'Femenino' : 'Otro'} 
                        />
                      </ListItem>

                      <ListItem>
  <ListItemIcon>
    <EmailIcon />
  </ListItemIcon>
  <ListItemText primary="Email" secondary={residente.Email || 'No especificado'} />
</ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <DateIcon />
                        </ListItemIcon>
                        <ListItemText primary="Fecha de Ingreso" secondary={formatDate(residente.FechaIngreso)} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Información Médica
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <MedicalIcon />
                        </ListItemIcon>
                        <ListItemText primary="Grupo Sanguíneo" secondary={residente.GrupoSanguineo || 'No especificado'} />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <HomeIcon />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Habitación" 
                          secondary={residente.NumeroHabitacion ? `${residente.NumeroHabitacion} (${residente.TipoHabitacion || 'No especificado'})` : 'No asignada'} 
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Contacto de Emergencia
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon />
                        </ListItemIcon>
                        <ListItemText primary="Nombre" secondary={residente.ContactoEmergenciaNombre || 'No especificado'} />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <PhoneIcon />
                        </ListItemIcon>
                        <ListItemText primary="Teléfono" secondary={residente.ContactoEmergenciaTelefono || 'No especificado'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Observaciones Médicas
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body1">
            {residente.ObservacionesMedicas || 'No hay observaciones médicas registradas.'}
          </Typography>
        </Paper>
      </Paper>

      {/* Aquí podrían ir secciones adicionales como historial médico, medicamentos, etc. */}
      <CambioHabitacionModal
  open={openCambio}
  onClose={() => setOpenCambio(false)}
  residenteId={residente.ResidenteID}
  onSuccess={() => window.location.reload()}
/>
{/* ------------------- Tratamientos ------------------- */}
{tratamientos.length > 0 && (
  <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>🧪 Tratamientos Activos</Typography>
    <List dense>
      {tratamientos.map((t) => (
        <ListItem key={t.TratamientoID}>
          <ListItemText
            primary={`${t.MedicamentoNombre} (${t.Dosis}) - ${t.Frecuencia}`}
            secondary={`Prescrito por: ${t.NombrePersonal}`}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
)}

{/* ------------------- Dietas ------------------- */}
{dietas.length > 0 && (
  <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
    <Typography variant="h6" gutterBottom>🍽️ Dietas Asignadas</Typography>
    <List dense>
      {dietas.map((d) => (
        <ListItem key={d.AsignacionID}>
          <ListItemText
            primary={d.DietaNombre}
            secondary={`Desde ${formatDate(d.FechaInicio)} - Asignada por: ${d.NombrePersonal}`}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
)}

{/* ------------------- Actividades ------------------- */}
{actividades.length > 0 && (
  <Paper elevation={3} sx={{ p: 3 }}>
    <Typography variant="h6" gutterBottom>🧩 Actividades Participadas</Typography>
    <List dense>
      {actividades.map((a) => (
        <ListItem key={a.ActividadID}>
          <ListItemText
            primary={`${a.Nombre} (${a.TipoActividad})`}
            secondary={`Inicio: ${new Date(a.FechaHoraInicio).toLocaleString()} - Asistió: ${a.Asistio ? 'Sí' : 'No'}`}
          />
        </ListItem>
      ))}
    </List>
  </Paper>
)}


    </Container>
  );
};




export default ResidenteDetail;