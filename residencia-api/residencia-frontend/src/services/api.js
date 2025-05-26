import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
import axios from 'axios';

// Crear instancia base de axios
const api = axios.create({
  baseURL: 'http://localhost:3001/api', // Ajustar a la URL de tu API
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});



// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      console.log('Token en localStorage:', token ? token.substring(0, 20) + '...' : 'No hay token');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Token añadido a la cabecera de la solicitud');
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el error es 401 (no autorizado) redirigir al login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  changePassword: (passwords) => api.post('/auth/change-password', passwords),
  register: (userData) => api.post('/auth/register', userData),
};



// Servicios de residentes
export const residentesService = {
  getAll: () => api.get('/residentes'),
  getById: (id) => api.get(`/residentes/${id}`), 
  create: (residente) => api.post('/residentes', residente),
  update: (id, residente) => api.put(`/residentes/${id}`, residente),
  delete: (id) => api.delete(`/residentes/${id}`),
  cambiarHabitacion: (id, datos) => api.put(`/residentes/${id}/cambiar-habitacion`, datos),
  getDetallesCompletos: (id) => api.get(`/residentes/${id}/detalles-completos`),
  updateEstado: (id, activo) => api.put(`/residentes/${id}/estado`, { Activo: activo }),

  
  
};

// Servicios de personal
export const personalService = {
  getAll: () => api.get('/personal'),
  getById: (id) => api.get(`/personal/${id}`),
  create: (personal) => api.post('/personal', personal),
  update: (id, personal) => api.put(`/personal/${id}`, personal),
  updateEstado: (id, activo) => api.put(`/personal/${id}/estado`, { Activo: activo }),
  delete: (id) => api.delete(`/personal/${id}`),
};

// Servicios de medicamentos
export const medicamentosService = {
  getAll: () => api.get('/medicamentos'),
  getById: (id) => api.get(`/medicamentos/${id}`),
  create: (data) => api.post('/medicamentos', data),
  update: (id, data) => api.put(`/medicamentos/${id}`, data),
  delete: (id) => api.delete(`/medicamentos/${id}`)
};


// Servicios de tratamientos
export const tratamientosService = {
  getAll: () => api.get('/tratamientos'),
  getByResidente: (residenteId) => api.get(`/tratamientos/residente/${residenteId}`),
  getById: (id) => api.get(`/tratamientos/${id}`),
  create: (tratamiento) => api.post('/tratamientos', tratamiento),
  update: (id, tratamiento) => api.put(`/tratamientos/${id}`, tratamiento),
  delete: (id) => api.delete(`/tratamientos/${id}`),
  updateEstado: (id, activo) => api.put(`/tratamientos/${id}/estado`, { Activo: activo })
};

// Servicios de habitaciones
export const habitacionesService = {
  getAll: () => api.get('/habitaciones'),
  getDisponibles: () => api.get('/habitaciones/disponibles'),
  getById: (id) => api.get(`/habitaciones/${id}`),
  create: (habitacion) => api.post('/habitaciones', habitacion),
  update: (id, habitacion) => api.put(`/habitaciones/${id}`, habitacion),
  delete: (id) => api.delete(`/habitaciones/${id}`),
  getResidentes: (id) => api.get(`/habitaciones/${id}/residentes`),
getHistorialCambios: (id) => api.get(`/habitaciones/${id}/historial-cambios`),



};

// Servicios de actividades
export const actividadesService = {
  getAll: () => api.get('/actividades'),
  getById: (id) => api.get(`/actividades/${id}`),
  create: (actividad) => api.post('/actividades', actividad),
  update: (id, actividad) => api.put(`/actividades/${id}`, actividad),
  delete: (id) => api.delete(`/actividades/${id}`),
  getParticipantes: (actividadId) => api.get(`/actividades/${actividadId}/participantes`),
  addParticipante: (actividadId, residenteId) => api.post(`/actividades/${actividadId}/participantes`, { residenteId }),
  removeParticipante: (actividadId, residenteId) => api.delete(`/actividades/${actividadId}/participantes/${residenteId}`),
};

// Servicios de constantes vitales
export const constantesService = {
  getByResidente: (residenteId) => api.get(`/constantes/residente/${residenteId}`),
  create: (constante) => api.post('/constantes', constante),
  delete: (id) => api.delete(`/constantes/${id}`),
};

// Servicios de dietas
export const dietasService = {
  getAll: () => api.get('/dietas'),
  getById: (id) => api.get(`/dietas/${id}`),
  create: (dieta) => api.post('/dietas', dieta),
  update: (id, dieta) => api.put(`/dietas/${id}`, dieta),
  delete: (id) => api.delete(`/dietas/${id}`),
  getAsignaciones: (residenteId) => api.get(`/dietas/asignaciones/residente/${residenteId}`),
  asignarDieta: (asignacion) => api.post('/dietas/asignaciones', asignacion),
  desasignarDieta: (asignacionId) => api.delete(`/dietas/asignaciones/${asignacionId}`),
    updateEstado: (id, activo) => api.put(`/dietas/${id}/estado`, { Activo: activo })
};

// Servicios de visitas
export const visitasService = {
  getAll: () => api.get('/visitas'),
  getById: (id) => api.get(`/visitas/${id}`), // ✅ Añadido
  getByResidente: (residenteId) => api.get(`/visitas/residente/${residenteId}`),
  create: (visita) => api.post('/visitas', visita),
  update: (id, visita) => api.put(`/visitas/${id}`, visita),
  delete: (id) => api.delete(`/visitas/${id}`),
};


// Servicios de incidencias
export const incidenciasService = {
  getAll: () => api.get('/incidencias'),
  getById: (id) => api.get(`/incidencias/${id}`),
  getByResidente: (residenteId) => api.get(`/incidencias/residente/${residenteId}`),
  create: (incidencia) => api.post('/incidencias', incidencia),
  update: (id, incidencia) => api.put(`/incidencias/${id}`, incidencia),
  delete: (id) => api.delete(`/incidencias/${id}`),
};

// Servicios de pagos
export const pagosService = {
  getAll: () => api.get('/pagos'),
  getByResidente: (residenteId) => api.get(`/pagos/residente/${residenteId}`),
  create: (pago) => api.post('/pagos', pago),
  update: (id, pago) => api.put(`/pagos/${id}`, pago),
  delete: (id) => api.delete(`/pagos/${id}`),
};

export default api;