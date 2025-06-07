import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/pages/residentes/ResidenteForm.js (modificado)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { residentesService, habitacionesService } from '../../services/api';


const ResidenteForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Estado para el formulario
  const [formData, setFormData] = useState({
    dni: '',
    nombre: '',
    apellidos: '',
    fechaNacimiento: '',
    genero: '',
    fechaIngreso: '',
    numeroHabitacion: '',
    grupoSanguineo: '',
    contactoEmergenciaNombre: '',
    contactoEmergenciaTelefono: '',
    observacionesMedicas: '',
    email: '',
  });

  // Estados para las habitaciones disponibles
  const [habitaciones, setHabitaciones] = useState([]);
  
  // Estados para el manejo de errores y carga
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos si estamos editando
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar habitaciones disponibles
        const habitacionesResponse = await habitacionesService.getDisponibles();
        setHabitaciones(habitacionesResponse.data.data);

        
        // Si estamos editando, cargar datos del residente
        if (isEditing) {
          const residenteResponse = await residentesService.getById(id);
          const residente = residenteResponse.data.data;
          
          // Formatear fechas para el input type="date" (YYYY-MM-DD)
          const fechaNacimiento = residente.FechaNacimiento ? 
            new Date(residente.FechaNacimiento).toISOString().split('T')[0] : '';
          const fechaIngreso = residente.FechaIngreso ? 
            new Date(residente.FechaIngreso).toISOString().split('T')[0] : '';
          
          setFormData({
            dni: residente.DNI || '',
            nombre: residente.Nombre || '',
            apellidos: residente.Apellidos || '',
            fechaNacimiento,
            genero: residente.Genero || '',
            email: residente.Email || '',
            fechaIngreso,
            numeroHabitacion: residente.NumeroHabitacion ? parseInt(residente.NumeroHabitacion, 10) : '',
            grupoSanguineo: residente.GrupoSanguineo || '',
            contactoEmergenciaNombre: residente.ContactoEmergenciaNombre || '',
            contactoEmergenciaTelefono: residente.ContactoEmergenciaTelefono || '',
            observacionesMedicas: residente.ObservacionesMedicas || ''
          });
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        setError('Error al cargar los datos necesarios. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpiar errores al modificar campo
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!formData.dni.trim()) {
      errors.dni = 'El DNI es obligatorio';
    }
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es obligatorio';
    }
    
    if (!formData.apellidos.trim()) {
      errors.apellidos = 'Los apellidos son obligatorios';
    }
    
    if (!formData.fechaNacimiento) {
      errors.fechaNacimiento = 'La fecha de nacimiento es obligatoria';
    }
    
    if (!formData.genero) {
      errors.genero = 'El género es obligatorio';
    }
    
    if (!formData.fechaIngreso) {
      errors.fechaIngreso = 'La fecha de ingreso es obligatoria';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      // No necesitamos formatear las fechas ya que vienen en el formato correcto del input
      const apiData = {
        ...formData
      };
      
      if (isEditing) {
        await residentesService.update(id, apiData);
      } else {
        await residentesService.create(apiData);
      }
      
      // Redirigir a la lista de residentes
      navigate('/residentes');
    } catch (err) {
      console.error('Error al guardar residente:', err);
      setError(err.response?.data?.message || 'Error al guardar los datos. Por favor, intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          {isEditing ? 'Editar Residente' : 'Nuevo Residente'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DNI"
                name="dni"
                value={formData.dni}
                onChange={handleChange}
                error={!!formErrors.dni}
                helperText={formErrors.dni}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="genero-label">Género</InputLabel>
                <Select
                  labelId="genero-label"
                  name="genero"
                  value={formData.genero}
                  onChange={handleChange}
                  error={!!formErrors.genero}
                  disabled={submitting}
                  label="Género"
                >
                  <MenuItem value="M">Masculino</MenuItem>
                  <MenuItem value="F">Femenino</MenuItem>
                  <MenuItem value="O">Otro</MenuItem>
                </Select>
                {formErrors.genero && (
                  <FormHelperText error>{formErrors.genero}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                error={!!formErrors.apellidos}
                helperText={formErrors.apellidos}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Nacimiento"
                name="fechaNacimiento"
                type="date"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                error={!!formErrors.fechaNacimiento}
                helperText={formErrors.fechaNacimiento || "Formato: AAAA-MM-DD"}
                disabled={submitting}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Fecha de Ingreso"
                name="fechaIngreso"
                type="date"
                value={formData.fechaIngreso}
                onChange={handleChange}
                error={!!formErrors.fechaIngreso}
                helperText={formErrors.fechaIngreso || "Formato: AAAA-MM-DD"}
                disabled={submitting}
                margin="normal"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="habitacion-label">Habitación</InputLabel>
                <Select
                  labelId="habitacion-label"
                  name="numeroHabitacion"
                  value={formData.numeroHabitacion}
                  onChange={handleChange}
                  disabled={submitting}
                  label="Habitación"
                >
                  <MenuItem value="">
                    <em>No asignada</em>
                  </MenuItem>
                  {habitaciones.map((hab) => (
                    <MenuItem key={hab.Numero} value={hab.Numero}>
                      {hab.Numero} - {hab.Tipo} (Planta {hab.Planta})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
  <TextField
    fullWidth
    label="Email"
    name="email"
    value={formData.email}
    onChange={handleChange}
    error={!!formErrors.email}
    helperText={formErrors.email}
    disabled={submitting}
    margin="normal"
    type="email"
  />
</Grid>


            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Grupo Sanguíneo"
                name="grupoSanguineo"
                value={formData.grupoSanguineo}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Contacto de Emergencia
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre de Contacto"
                name="contactoEmergenciaNombre"
                value={formData.contactoEmergenciaNombre}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono de Contacto"
                name="contactoEmergenciaTelefono"
                value={formData.contactoEmergenciaTelefono}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Información Médica
              </Typography>
              
              <TextField
                fullWidth
                label="Observaciones Médicas"
                name="observacionesMedicas"
                value={formData.observacionesMedicas}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/residentes')}
                disabled={submitting}
              >
                Cancelar
              </Button>
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
              >
                {submitting ? (
                  <CircularProgress size={24} />
                ) : isEditing ? (
                  'Guardar Cambios'
                ) : (
                  'Crear Residente'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ResidenteForm;