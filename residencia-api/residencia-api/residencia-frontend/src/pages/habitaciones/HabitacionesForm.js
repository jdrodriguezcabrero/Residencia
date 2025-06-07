import { Alert, AppBar, Avatar, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Container, CssBaseline, Divider, Drawer, FormControl, FormHelperText, Grid, IconButton, InputLabel, LinearProgress, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select, Stack, TextField, Toolbar, Typography, mui } from '@mui/material';
// src/pages/habitaciones/HabitacionForm.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { habitacionesService } from '../../services/api';

const HabitacionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Estado para el formulario
  const [formData, setFormData] = useState({
    numero: '',
    tipo: '',
    planta: '',
    estado: 'Disponible',
    observaciones: ''
  });
  
  // Estados para el manejo de errores y carga
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  // Cargar datos si estamos editando
  useEffect(() => {
    const fetchData = async () => {
      if (!isEditing) return;
      
      try {
        setLoading(true);
        setError(null);

        const habitacionResponse = await habitacionesService.getById(id);
        const habitacion = habitacionResponse.data.data;
        
        setFormData({
          numero: habitacion.Numero?.toString() || '',
          tipo: habitacion.Tipo || '',
          planta: habitacion.Planta?.toString() || '',
          estado: habitacion.Estado || 'Disponible',
          observaciones: habitacion.Observaciones || ''
        });
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
    
    if (!formData.numero.trim()) {
      errors.numero = 'El número de habitación es obligatorio';
    } else if (isNaN(parseInt(formData.numero)) || parseInt(formData.numero) <= 0) {
      errors.numero = 'El número de habitación debe ser un número positivo';
    }
    
    if (!formData.tipo.trim()) {
      errors.tipo = 'El tipo de habitación es obligatorio';
    }
    
    if (!formData.planta.trim()) {
      errors.planta = 'La planta es obligatoria';
    } else if (isNaN(parseInt(formData.planta))) {
      errors.planta = 'La planta debe ser un número';
    }
    
    if (!formData.estado) {
      errors.estado = 'El estado es obligatorio';
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
      
      // Formatear datos para la API
      const apiData = {
        ...formData,
        numero: parseInt(formData.numero),
        planta: parseInt(formData.planta)
      };
      
      if (isEditing) {
        await habitacionesService.update(id, apiData);
      } else {
        await habitacionesService.create(apiData);
      }
      
      // Redirigir a la lista de habitaciones
      navigate('/habitaciones');
    } catch (err) {
      console.error('Error al guardar habitación:', err);
      setError(err.response?.data?.message || 'Error al guardar los datos. Por favor, intente de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  // Tipos de habitación disponibles
  const tiposHabitacion = ['Individual', 'Doble', 'Triple'];
  
  // Estados posibles
  const estados = ['Disponible', 'Ocupada', 'Mantenimiento'];

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
          {isEditing ? 'Editar Habitación' : 'Nueva Habitación'}
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
                label="Número de Habitación"
                name="numero"
                value={formData.numero}
                onChange={handleChange}
                error={!!formErrors.numero}
                helperText={formErrors.numero}
                disabled={submitting}
                margin="normal"
                required
                type="number"
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!formErrors.tipo} required>
                <InputLabel id="tipo-label">Tipo de Habitación</InputLabel>
                <Select
                  labelId="tipo-label"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleChange}
                  disabled={submitting}
                  label="Tipo de Habitación"
                >
                  {tiposHabitacion.map((tipo) => (
                    <MenuItem key={tipo} value={tipo}>
                      {tipo}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.tipo && (
                  <FormHelperText>{formErrors.tipo}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Planta"
                name="planta"
                value={formData.planta}
                onChange={handleChange}
                error={!!formErrors.planta}
                helperText={formErrors.planta}
                disabled={submitting}
                margin="normal"
                required
                type="number"
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" error={!!formErrors.estado} required>
                <InputLabel id="estado-label">Estado</InputLabel>
                <Select
                  labelId="estado-label"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={submitting}
                  label="Estado"
                >
                  {estados.map((estado) => (
                    <MenuItem key={estado} value={estado} >
                      {estado}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.estado && (
                  <FormHelperText>{formErrors.estado}</FormHelperText>
                )}
                {}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Observaciones"
                name="observaciones"
                value={formData.observaciones}
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
                onClick={() => navigate('/habitaciones')}
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
                  'Crear Habitación'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default HabitacionForm;