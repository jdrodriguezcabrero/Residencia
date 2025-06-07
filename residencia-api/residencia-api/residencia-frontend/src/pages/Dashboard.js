import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/pages/Dashboard.js (modificado)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  Person as PersonIcon,
  Healing as HealingIcon,
  Bed as BedIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  LocalHospital as MedicineIcon
} from '@mui/icons-material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { 
  residentesService, 
  habitacionesService, 
  medicamentosService,
  actividadesService,
  incidenciasService
} from '../services/api';
import { formatDate } from '../utils/dateUtils';

// Registrar componentes de Chart.js
const extractData = (response) => Array.isArray(response.data) ? response.data : response.data.data || [];

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title
);

const Dashboard = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    residentes: { total: 0, activos: 0, lista: [] },
    habitaciones: { total: 0, disponibles: 0, ocupadas: 0, mantenimiento: 0 },
    medicamentos: { total: 0, bajoStock: 0, lista: [] },
    actividades: { total: 0, pendientes: 0, lista: [] },
    incidencias: { total: 0, pendientes: 0, lista: [] }
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar datos según el rol del usuario
        const promises = [];
        const data = { ...dashboardData };
        
        // Residentes - todos los roles
        promises.push(
          residentesService.getAll().then(response => {
            const residentes = extractData(response);
            data.residentes = {
              total: residentes.length,
              activos: residentes.filter(r => r.Activo).length,
              lista: residentes.slice(0, 5) // Solo los primeros 5 para la lista
            };
          })
        );
        
        // Habitaciones - Admin y Recepción
        if (hasRole(['Administrador', 'Recepcion'])) {
          promises.push(
            habitacionesService.getAll().then(response => {
              const habitaciones = extractData(response);
              data.habitaciones = {
                total: habitaciones.length,
                disponibles: habitaciones.filter(h => h.Estado === 'Disponible').length,
                ocupadas: habitaciones.filter(h => h.Estado === 'Ocupada').length,
                mantenimiento: habitaciones.filter(h => h.Estado === 'Mantenimiento').length
              };
            })
          );
        }
        
        // Medicamentos - Admin, Médico y Enfermero
        if (hasRole(['Administrador', 'Medico', 'Enfermero'])) {
          promises.push(
            medicamentosService.getAll().then(response => {
              const medicamentos = extractData(response);
              const bajoStock = medicamentos.filter(m => m.Stock <= m.StockMinimo);
              data.medicamentos = {
                total: medicamentos.length,
                bajoStock: bajoStock.length,
                lista: bajoStock.slice(0, 5) // Medicamentos con bajo stock
              };
            })
          );
        }
        
        // Actividades - Admin, Enfermero, Auxiliar
        if (hasRole(['Administrador', 'Enfermero', 'Auxiliar'])) {
          promises.push(
            actividadesService.getAll().then(response => {
              const actividades = extractData(response);
              const hoy = new Date();
              const pendientes = actividades.filter(a => new Date(a.FechaHoraInicio) > hoy);
              data.actividades = {
                total: actividades.length,
                pendientes: pendientes.length,
                lista: pendientes.slice(0, 5) // Próximas actividades
              };
            })
          );
        }
        
        // Incidencias - Admin, Médico, Enfermero, Auxiliar
        if (hasRole(['Administrador', 'Medico', 'Enfermero', 'Auxiliar'])) {
          promises.push(
            incidenciasService.getAll().then(response => {
              const incidencias = extractData(response);
              const pendientes = incidencias.filter(i => i.Estado === 'Pendiente');
              data.incidencias = {
                total: incidencias.length,
                pendientes: pendientes.length,
                lista: pendientes.slice(0, 5) // Incidencias pendientes
              };
            })
          );
        }
        
        // Ejecutar todas las promesas
        await Promise.all(promises);
        
        setDashboardData(data);
      } catch (err) {
        console.error('Error cargando datos del dashboard:', err);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [hasRole]); // Quitamos dashboardData para evitar loop infinito

  // Datos para gráfico de habitaciones
  const habitacionesChartData = {
    labels: ['Disponibles', 'Ocupadas', 'Mantenimiento'],
    datasets: [
      {
        label: 'Habitaciones',
        data: [
          dashboardData.habitaciones.disponibles,
          dashboardData.habitaciones.ocupadas,
          dashboardData.habitaciones.mantenimiento
        ],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)'
        ],
        borderWidth: 1,
      },
    ],
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

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Bienvenido/a, {user.nombreCompleto || user.username}
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom color="textSecondary">
        Panel de Control - {new Date().toLocaleDateString('es-ES', { dateStyle: 'full' })}
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Grid container spacing={3}>
        {/* Tarjeta de Residentes */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Residentes</Typography>
              </Box>
              <Typography variant="h4" component="div">
                {dashboardData.residentes.activos} / {dashboardData.residentes.total}
              </Typography>
              <Typography color="textSecondary">
                Residentes activos
              </Typography>
            </CardContent>
            <CardActions>
              <Button size="small" onClick={() => navigate('/residentes')}>
                Ver todos
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Tarjeta de Habitaciones - Solo para Admin y Recepción */}
        {hasRole(['Administrador', 'Recepcion']) && (
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BedIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Habitaciones</Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {dashboardData.habitaciones.disponibles} / {dashboardData.habitaciones.total}
                </Typography>
                <Typography color="textSecondary">
                  Habitaciones disponibles
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/habitaciones')}>
                  Ver todas
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
        
        {/* Tarjeta de Medicamentos - Solo para Admin, Médico y Enfermero */}
        {hasRole(['Administrador', 'Medico', 'Enfermero']) && (
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MedicineIcon fontSize="large" color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Medicamentos</Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {dashboardData.medicamentos.bajoStock}
                </Typography>
                <Typography color="textSecondary">
                  Medicamentos con bajo stock
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/medicamentos')}>
                  Ver todos
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
        
        {/* Tarjeta de Incidencias - Solo para Admin, Médico, Enfermero, Auxiliar */}
        {hasRole(['Administrador', 'Medico', 'Enfermero', 'Auxiliar']) && (
          <Grid item xs={12} md={6} lg={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WarningIcon fontSize="large" color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Incidencias</Typography>
                </Box>
                <Typography variant="h4" component="div">
                  {dashboardData.incidencias.pendientes}
                </Typography>
                <Typography color="textSecondary">
                  Incidencias pendientes
                </Typography>
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => navigate('/incidencias')}>
                  Ver todas
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}
      </Grid>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {/* Gráfico de Habitaciones - Solo para Admin y Recepción */}
        {hasRole(['Administrador', 'Recepcion']) && dashboardData.habitaciones.total > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Estado de las Habitaciones</Typography>
              <Box sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
                <Pie data={habitacionesChartData} options={{ maintainAspectRatio: false }} />
              </Box>
            </Paper>
          </Grid>
        )}
        
        {/* Lista de Medicamentos con Bajo Stock - Solo para Admin, Médico, Enfermero */}
        {hasRole(['Administrador', 'Medico', 'Enfermero']) && dashboardData.medicamentos.bajoStock > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Medicamentos con Bajo Stock</Typography>
              <List>
                {dashboardData.medicamentos.lista.map((medicamento) => (
                  <ListItem key={medicamento.MedicamentoID}>
                    <ListItemIcon>
                      <HealingIcon color={medicamento.Stock === 0 ? 'error' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={medicamento.Nombre}
                      secondary={`Stock: ${medicamento.Stock} / Mínimo: ${medicamento.StockMinimo}`}
                    />
                  </ListItem>
                ))}
              </List>
              {dashboardData.medicamentos.bajoStock > 5 && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={() => navigate('/medicamentos')}>
                    Ver todos
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Lista de Próximas Actividades - Solo para Admin, Enfermero, Auxiliar */}
        {hasRole(['Administrador', 'Enfermero', 'Auxiliar']) && dashboardData.actividades.pendientes > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Próximas Actividades</Typography>
              <List>
                {dashboardData.actividades.lista.map((actividad) => (
                  <ListItem key={actividad.ActividadID}>
                    <ListItemIcon>
                      <EventIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={actividad.Nombre}
                      secondary={`${formatDate(actividad.FechaHoraInicio, true)} - ${actividad.Lugar}`}
                    />
                  </ListItem>
                ))}
              </List>
              {dashboardData.actividades.pendientes > 5 && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={() => navigate('/actividades')}>
                    Ver todas
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
        
        {/* Lista de Incidencias Pendientes - Solo para Admin, Médico, Enfermero, Auxiliar */}
        {hasRole(['Administrador', 'Medico', 'Enfermero', 'Auxiliar']) && dashboardData.incidencias.pendientes > 0 && (
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>Incidencias Pendientes</Typography>
              <List>
                {dashboardData.incidencias.lista.map((incidencia) => (
                  <ListItem key={incidencia.IncidenciaID}>
                    <ListItemIcon>
                      <WarningIcon color={incidencia.Gravedad === 'Grave' ? 'error' : 'warning'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={incidencia.Descripcion.slice(0, 50) + (incidencia.Descripcion.length > 50 ? '...' : '')}
                      secondary={`${formatDate(incidencia.FechaHora, true)} - ${incidencia.Gravedad}`}
                    />
                  </ListItem>
                ))}
              </List>
              {dashboardData.incidencias.pendientes > 5 && (
                <Box sx={{ mt: 1, textAlign: 'center' }}>
                  <Button size="small" onClick={() => navigate('/incidencias')}>
                    Ver todas
                  </Button>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default Dashboard;