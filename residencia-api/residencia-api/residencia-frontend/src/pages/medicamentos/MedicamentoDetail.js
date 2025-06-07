import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/pages/medicamentos/MedicamentoDetail.js (modificado)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { medicamentosService } from '../../services/api';

import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const MedicamentoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [medicamento, setMedicamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMedicamento = async () => {
      try {
        setLoading(true);
        const response = await medicamentosService.getById(id);
        setMedicamento(response.data.data);
      } catch (err) {
        console.error('Error al cargar medicamento:', err);
        setError('Error al cargar la información del medicamento. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicamento();
  }, [id]);

  // Calcular el porcentaje de stock
  const calcularPorcentajeStock = (stock, stockMinimo) => {
    if (stockMinimo === 0) return 100;
    
    const porcentaje = (stock / stockMinimo) * 100;
    return Math.min(Math.max(porcentaje, 0), 100);
  };

  // Determinar color según el nivel de stock
  const getStockColor = (stock, stockMinimo) => {
    if (stock === 0) return 'error';
    if (stock <= stockMinimo) return 'warning';
    return 'success';
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

  if (!medicamento) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">No se encontró información del medicamento</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/medicamentos')}
        >
          Volver a la lista
        </Button>
        
        {hasRole(['Administrador', 'Medico']) && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/medicamentos/edit/${id}`)}
          >
            Editar Medicamento
          </Button>
        )}
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h5" gutterBottom>
              {medicamento.Nombre}
            </Typography>
            
            {medicamento.Tipo && (
              <Chip 
                label={medicamento.Tipo}
                color="primary"
                sx={{ mt: 1, mr: 1 }}
              />
            )}
            
            {medicamento.Stock === 0 ? (
              <Chip
                icon={<WarningIcon />}
                label="Sin stock"
                color="error"
                sx={{ mt: 1 }}
              />
            ) : medicamento.Stock <= medicamento.StockMinimo ? (
              <Chip
                icon={<WarningIcon />}
                label="Bajo stock"
                color="warning"
                sx={{ mt: 1 }}
              />
            ) : (
              <Chip
                label="Stock OK"
                color="success"
                sx={{ mt: 1 }}
              />
            )}
            
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              {medicamento.Descripcion || 'Sin descripción'}
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información de Stock
                </Typography>
                
                <Stack spacing={2} sx={{ mt: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Stock Actual
                    </Typography>
                    <Typography variant="h4">
                      {medicamento.Stock}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Stock Mínimo
                    </Typography>
                    <Typography variant="h4">
                      {medicamento.StockMinimo}
                    </Typography>
                  </Box>
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Nivel de Stock
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={calcularPorcentajeStock(medicamento.Stock, medicamento.StockMinimo)}
                      color={getStockColor(medicamento.Stock, medicamento.StockMinimo)}
                      sx={{ height: 10, borderRadius: 5, mt: 1 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        
        <Typography variant="h6" gutterBottom>
          Contraindicaciones
        </Typography>
        
        <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
          <Typography variant="body1">
            {medicamento.Contraindicaciones || 'No se han registrado contraindicaciones.'}
          </Typography>
        </Paper>
      </Paper>

      {/* Aquí podrían ir secciones adicionales como tratamientos asociados, etc. */}
    </Container>
  );
};

export default MedicamentoDetail;