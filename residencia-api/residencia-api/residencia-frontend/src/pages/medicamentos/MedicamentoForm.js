import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/pages/medicamentos/MedicamentoForm.js (modificado)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicamentosService } from '../../services/api';


const MedicamentoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Estado para el formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: '',
    contraindicaciones: '',
    stock: '',
    stockMinimo: ''
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

        const medicamentoResponse = await medicamentosService.getById(id);
        const medicamento = medicamentoResponse.data.data;
        
        setFormData({
          nombre: medicamento.Nombre || '',
          descripcion: medicamento.Descripcion || '',
          tipo: medicamento.Tipo || '',
          contraindicaciones: medicamento.Contraindicaciones || '',
          stock: medicamento.Stock?.toString() || '',
          stockMinimo: medicamento.StockMinimo?.toString() || ''
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
    
    if (!formData.nombre.trim()) {
      errors.nombre = 'El nombre es obligatorio';
    }
    
    if (!formData.stock.trim()) {
      errors.stock = 'El stock es obligatorio';
    } else if (isNaN(Number(formData.stock)) || Number(formData.stock) < 0) {
      errors.stock = 'El stock debe ser un número positivo';
    }
    
    if (!formData.stockMinimo.trim()) {
      errors.stockMinimo = 'El stock mínimo es obligatorio';
    } else if (isNaN(Number(formData.stockMinimo)) || Number(formData.stockMinimo) < 0) {
      errors.stockMinimo = 'El stock mínimo debe ser un número positivo';
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
        Nombre: formData.nombre,
        Descripcion: formData.descripcion,
        Tipo: formData.tipo,
        Contraindicaciones: formData.contraindicaciones,
        Stock: Number(formData.stock),
        StockMinimo: Number(formData.stockMinimo)
      };
      
      if (isEditing) {
        await medicamentosService.update(id, apiData);
      } else {
        await medicamentosService.create(apiData);
      }
      
      // Redirigir a la lista de medicamentos
      navigate('/medicamentos');
    } catch (err) {
      console.error('Error al guardar medicamento:', err);
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
          {isEditing ? 'Editar Medicamento' : 'Nuevo Medicamento'}
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre del Medicamento"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                error={!!formErrors.nombre}
                helperText={formErrors.nombre}
                disabled={submitting}
                margin="normal"
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
                placeholder="Ej. Analgésico, Antibiótico, etc."
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Descripción"
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contraindicaciones"
                name="contraindicaciones"
                value={formData.contraindicaciones}
                onChange={handleChange}
                disabled={submitting}
                margin="normal"
                multiline
                rows={4}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                Información de Stock
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Actual"
                name="stock"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                error={!!formErrors.stock}
                helperText={formErrors.stock}
                disabled={submitting}
                margin="normal"
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Mínimo"
                name="stockMinimo"
                type="number"
                value={formData.stockMinimo}
                onChange={handleChange}
                error={!!formErrors.stockMinimo}
                helperText={formErrors.stockMinimo}
                disabled={submitting}
                margin="normal"
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/medicamentos')}
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
                  'Crear Medicamento'
                )}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default MedicamentoForm;