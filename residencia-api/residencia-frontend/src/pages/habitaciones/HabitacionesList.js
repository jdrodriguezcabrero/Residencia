import { Alert, AppBar, Avatar, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Container, CssBaseline, Divider, Drawer, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar, Tooltip, Typography, mui } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { habitacionesService } from '../../services/api';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  MeetingRoom as RoomIcon,
  Construction as ConstructionIcon,
  CheckCircle as AvailableIcon
} from '@mui/icons-material';

const HabitacionesList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [habitaciones, setHabitaciones] = useState([]);
  const [filteredHabitaciones, setFilteredHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Configuración de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar la lista de habitaciones
  useEffect(() => {
    const fetchHabitaciones = async () => {
      try {
        setLoading(true);
        const response = await habitacionesService.getAll();
        const data = response.data.data;
        setHabitaciones(data);
        setFilteredHabitaciones(data);
      } catch (err) {
        console.error('Error al cargar habitaciones:', err);
        setError('Error al cargar la lista de habitaciones. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchHabitaciones();
  }, []);

  // Filtrar habitaciones cuando cambia el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredHabitaciones(habitaciones);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = habitaciones.filter(
        habitacion => 
          habitacion.Numero.toString().includes(searchTermLower) ||
          habitacion.Tipo.toLowerCase().includes(searchTermLower) ||
          habitacion.Planta.toString().includes(searchTermLower) ||
          habitacion.Estado.toLowerCase().includes(searchTermLower) ||
          (habitacion.Observaciones && habitacion.Observaciones.toLowerCase().includes(searchTermLower))
      );
      setFilteredHabitaciones(filtered);
    }
  }, [searchTerm, habitaciones]);

  // Manejadores de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Obtener color según el estado de la habitación
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

  // Obtener icono según el estado de la habitación
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

  return (
    <Box>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" gutterBottom>
            Habitaciones
          </Typography>
        </Grid>
        <Grid item>
          {hasRole(['Administrador']) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/habitaciones/new')}
            >
              Nueva Habitación
            </Button>
          )}
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          label="Buscar habitaciones"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Buscar por número, tipo, planta, estado u observaciones..."
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Número</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Planta</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Observaciones</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredHabitaciones
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((habitacion) => (
                  <TableRow key={habitacion.HabitacionID}>
                    <TableCell>{habitacion.Numero}</TableCell>
                    <TableCell>{habitacion.Tipo}</TableCell>
                    <TableCell>{habitacion.Planta}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getEstadoIcon(habitacion.Estado)}
                        label={habitacion.Estado}
                        color={getEstadoColor(habitacion.Estado)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{habitacion.Observaciones || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          color="info" 
                          onClick={() => navigate(`/habitaciones/${habitacion.HabitacionID}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {hasRole(['Administrador']) && (
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            onClick={() => navigate(`/habitaciones/edit/${habitacion.HabitacionID}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {hasRole(['Administrador']) &&  (
                        <Tooltip title="Eliminar">
                          <IconButton 
                            color="error" 
                            onClick={() => {
                              if (window.confirm(`¿Está seguro que desea eliminar la habitación ${habitacion.Numero}?`)) {
                                habitacionesService.delete(habitacion.HabitacionID)
                                  .then(() => {
                                    setHabitaciones(prev => prev.filter(h => h.HabitacionID !== habitacion.HabitacionID));
                                    setFilteredHabitaciones(prev => prev.filter(h => h.HabitacionID !== habitacion.HabitacionID));
                                  })
                                  .catch(err => {
                                    console.error('Error al eliminar habitación:', err);
                                    alert('Error al eliminar la habitación. Por favor, intente de nuevo.');
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
              
              {filteredHabitaciones.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No se encontraron habitaciones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredHabitaciones.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      </Paper>

      {/* Estadísticas o resumen */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">Total Habitaciones</Typography>
            <Typography variant="h4">{habitaciones.length}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">Disponibles</Typography>
            <Typography variant="h4" color="success.main">
              {habitaciones.filter(h => h.Estado === 'Disponible').length}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="subtitle1" color="text.secondary">Ocupadas</Typography>
            <Typography variant="h4" color="primary.main">
              {habitaciones.filter(h => h.Estado === 'Ocupada').length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default HabitacionesList;