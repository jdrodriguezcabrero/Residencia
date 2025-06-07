import { Alert, AppBar, Avatar, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Container, CssBaseline, Divider, Drawer, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar, Tooltip, Typography, mui } from '@mui/material';
// src/pages/medicamentos/MedicamentosList.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { medicamentosService } from '../../services/api';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Warning as WarningIcon
} from '@mui/icons-material';

const MedicamentosList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [medicamentos, setMedicamentos] = useState([]);
  const [filteredMedicamentos, setFilteredMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Configuración de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar la lista de medicamentos
  useEffect(() => {
    const fetchMedicamentos = async () => {
      try {
        setLoading(true);
        const response = await medicamentosService.getAll();
        const data = response.data;
        setMedicamentos(data);
        setFilteredMedicamentos(data);
      } catch (err) {
        console.error('Error al cargar medicamentos:', err);
        setError('Error al cargar la lista de medicamentos. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchMedicamentos();
  }, []);

  // Filtrar medicamentos cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMedicamentos(medicamentos);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = medicamentos.filter(
        medicamento => 
          medicamento.Nombre.toLowerCase().includes(searchTermLower) ||
          (medicamento.Descripcion && medicamento.Descripcion.toLowerCase().includes(searchTermLower)) ||
          (medicamento.Tipo && medicamento.Tipo.toLowerCase().includes(searchTermLower))
      );
      setFilteredMedicamentos(filtered);
    }
  }, [searchTerm, medicamentos]);

  // Manejadores de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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

  return (
    <Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            Medicamentos
          </Typography>
        </Grid>
        <Grid item>
          {hasRole(['Administrador', 'Medico']) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/medicamentos/new')}
            >
              Nuevo Medicamento
            </Button>
          )}
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar medicamentos"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Buscar por nombre, descripción o tipo..."
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Descripción</TableCell>
                <TableCell>Stock</TableCell>
                <TableCell>Stock Mínimo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMedicamentos
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((medicamento) => (
                  <TableRow key={medicamento.MedicamentoID}>
                    <TableCell>{medicamento.Nombre}</TableCell>
                    <TableCell>{medicamento.Tipo || 'No especificado'}</TableCell>
                    <TableCell>{medicamento.Descripcion || 'Sin descripción'}</TableCell>
                    <TableCell>{medicamento.Stock}</TableCell>
                    <TableCell>{medicamento.StockMinimo}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {medicamento.Stock === 0 ? (
                          <Chip
                            icon={<WarningIcon />}
                            label="Sin stock"
                            color="error"
                            size="small"
                          />
                        ) : medicamento.Stock <= medicamento.StockMinimo ? (
                          <Chip
                            icon={<WarningIcon />}
                            label="Bajo stock"
                            color="warning"
                            size="small"
                          />
                        ) : (
                          <Chip
                            label="Stock OK"
                            color="success"
                            size="small"
                          />
                        )}
                      </Box>
                      <Box sx={{ width: '100%', mt: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={calcularPorcentajeStock(medicamento.Stock, medicamento.StockMinimo)}
                          color={getStockColor(medicamento.Stock, medicamento.StockMinimo)}
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          color="info" 
                          onClick={() => navigate(`/medicamentos/${medicamento.MedicamentoID}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {hasRole(['Administrador', 'Medico']) && (
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            onClick={() => navigate(`/medicamentos/edit/${medicamento.MedicamentoID}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {hasRole(['Administrador']) && (
                        <Tooltip title="Eliminar">
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              if (window.confirm(`¿Está seguro que desea eliminar ${medicamento.Nombre}?`)) {
                                medicamentosService.delete(medicamento.MedicamentoID)
                                  .then(() => {
                                    setMedicamentos(prev => prev.filter(m => m.MedicamentoID !== medicamento.MedicamentoID));
                                    setFilteredMedicamentos(prev => prev.filter(m => m.MedicamentoID !== medicamento.MedicamentoID));
                                  })
                                  .catch(err => {
                                    console.error('Error al eliminar medicamento:', err);
                                    alert('Error al eliminar el medicamento. Por favor, intente de nuevo.');
                                  });
                              }
                            }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              
              {filteredMedicamentos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No se encontraron medicamentos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredMedicamentos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>
    </Box>
  );
};

export default MedicamentosList;