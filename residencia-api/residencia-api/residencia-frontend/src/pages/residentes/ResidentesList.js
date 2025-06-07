import { Alert, AppBar, Avatar, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Container, CssBaseline, Divider, Drawer, FormControl, FormHelperText, Grid, IconButton, InputAdornment, InputLabel, LinearProgress, List, ListItem, ListItemAvatar, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, TextField, Toolbar, Tooltip, Typography, mui } from '@mui/material';
// src/pages/residentes/ResidentesList.js (modificado)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { residentesService } from '../../services/api';
import { formatDate, calcularEdad } from '../../utils/dateUtils';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Transgender as OtherGenderIcon
} from '@mui/icons-material';

const ResidentesList = () => {
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [residentes, setResidentes] = useState([]);
  const [filteredResidentes, setFilteredResidentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');
  
  // Configuración de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Cargar la lista de residentes
  useEffect(() => {
    const fetchResidentes = async () => {
      try {
        setLoading(true);
        const response = await residentesService.getAll();
        const data = response.data.data;
        setResidentes(data);
        setFilteredResidentes(data);
      } catch (err) {
        console.error('Error al cargar residentes:', err);
        setError('Error al cargar la lista de residentes. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchResidentes();
  }, []);

  // Filtrar residentes cuando cambia el término de búsqueda
  
useEffect(() => {
  const searchTermLower = searchTerm.toLowerCase();

  const filtered = residentes.filter(residente => {
    const matchesSearch =
      residente.Nombre.toLowerCase().includes(searchTermLower) ||
      residente.Apellidos.toLowerCase().includes(searchTermLower) ||
      residente.DNI.toLowerCase().includes(searchTermLower) ||
      (residente.NumeroHabitacion && residente.NumeroHabitacion.toString().includes(searchTermLower));

    const matchesEstado =
      estadoFiltro === 'todos' ||
      (estadoFiltro === 'activos' && residente.Activo) ||
      (estadoFiltro === 'inactivos' && !residente.Activo);

    return matchesSearch && matchesEstado;
  });

  setFilteredResidentes(filtered);
}, [searchTerm, estadoFiltro, residentes]);


  // Manejadores de paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Obtener icono según el género
  const getGenderIcon = (genero) => {
    switch (genero) {
      case 'M':
        return <MaleIcon color="primary" />;
      case 'F':
        return <FemaleIcon sx={{ color: 'pink' }} />;
      default:
        return <OtherGenderIcon color="action" />;
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
            Residentes
          </Typography>
        </Grid>
        <Grid item>
          {hasRole(['Administrador', 'Medico']) && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/residentes/new')}
            >
              Nuevo Residente
            </Button>
          )}
        </Grid>
      </Grid>

      <Paper sx={{ p: 2, mb: 3 }}>
        
      <FormControl sx={{ minWidth: 150, ml: 2 }}>
        <InputLabel id="filtro-estado-label">Estado</InputLabel>
        <Select
          labelId="filtro-estado-label"
          value={estadoFiltro}
          label="Estado"
          onChange={(e) => setEstadoFiltro(e.target.value)}
        >
          <MenuItem value="todos">Todos</MenuItem>
          <MenuItem value="activos">Activos</MenuItem>
          <MenuItem value="inactivos">Inactivos</MenuItem>
        </Select>
      </FormControl>

      <TextField
          fullWidth
          variant="outlined"
          label="Buscar residentes"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Buscar por nombre, apellidos, DNI o número de habitación..."
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>DNI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellidos</TableCell>
                <TableCell>Edad</TableCell>
                <TableCell>Género</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Fecha Ingreso</TableCell>
                <TableCell>Habitación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredResidentes
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((residente) => (
                  <TableRow key={residente.ResidenteID}>
                    <TableCell>{residente.DNI}</TableCell>
                    <TableCell>{residente.Nombre}</TableCell>
                    <TableCell>{residente.Apellidos}</TableCell>
                    <TableCell>{calcularEdad(residente.FechaNacimiento)}</TableCell>
                    <TableCell>
                      <Tooltip title={residente.Genero === 'M' ? 'Masculino' : residente.Genero === 'F' ? 'Femenino' : 'Otro'}>
                        {getGenderIcon(residente.Genero)}
                      </Tooltip>
                    </TableCell>
                    <TableCell>{residente.Email || '—'}</TableCell>
                    <TableCell>{formatDate(residente.FechaIngreso)}</TableCell>
                    <TableCell>{residente.NumeroHabitacion || 'No asignada'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={residente.Activo ? 'Activo' : 'Inactivo'} 
                        color={residente.Activo ? 'success' : 'error'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalles">
                        <IconButton 
                          color="info" 
                          onClick={() => navigate(`/residentes/${residente.ResidenteID}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      
                      {hasRole(['Administrador', 'Medico']) && (
                        <Tooltip title="Editar">
                          <IconButton 
                            color="primary" 
                            onClick={() => navigate(`/residentes/edit/${residente.ResidenteID}`)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {hasRole(['Administrador']) && (
  <Tooltip title={residente.Activo ? "Cambiar a inactivo" : "Cambiar a activo"}>
    <IconButton
      color={residente.Activo ? "error" : "success"}
      onClick={() => {
        const accion = residente.Activo ? "dar de baja" : "activar";
        if (window.confirm(`¿Está seguro que desea ${accion} a ${residente.Nombre} ${residente.Apellidos}?`)) {
          residentesService.updateEstado(residente.ResidenteID, !residente.Activo)

          .then(() => {
            setResidentes(prev =>
              prev.map(r =>
                r.ResidenteID === residente.ResidenteID
                  ? { ...r, Activo: residente.Activo ? 0 : 1 }
                  : r
              )
            );
            setFilteredResidentes(prev =>
              prev.map(r =>
                r.ResidenteID === residente.ResidenteID
                  ? { ...r, Activo: residente.Activo ? 0 : 1 }
                  : r
              )
            );
          })
          .catch(err => {
            console.error("Error al cambiar estado del residente:", err);
            alert("Ocurrió un error al actualizar el estado del residente.");
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
              
              {filteredResidentes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No se encontraron residentes
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredResidentes.length}
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

export default ResidentesList;