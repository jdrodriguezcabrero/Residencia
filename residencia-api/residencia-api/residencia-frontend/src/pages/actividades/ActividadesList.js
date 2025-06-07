import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment, TableContainer, Table,
  TableHead, TableRow, TableCell, TableBody, TablePagination, Button, Tooltip, IconButton, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { actividadesService } from '../../services/api';
import { Search, Visibility as ViewIcon, Edit as EditIcon, Delete } from '@mui/icons-material';
import { formatDate } from '../../utils/dateUtils';

const ActividadesList = () => {
  const [actividades, setActividades] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    actividadesService.getAll()
      .then(res => {
        const data = res.data?.data || res.data || [];
        setActividades(data);
        setFiltered(data);
      })
      .catch(err => {
        console.error('Error cargando actividades:', err);
        setError('Error al cargar actividades');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) return setFiltered(actividades);
    const lower = search.toLowerCase();
    setFiltered(
      actividades.filter(a =>
        a.Nombre.toLowerCase().includes(lower) ||
        a.TipoActividad.toLowerCase().includes(lower)
      )
    );
  }, [search, actividades]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Actividades</Typography>

      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <TextField
            placeholder="Buscar actividad..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <Button variant="contained" onClick={() => navigate('/actividades/new')}>
            Nueva Actividad
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Inicio</TableCell>
                <TableCell>Fin</TableCell>
                <TableCell>Lugar</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((a) => (
                <TableRow key={a.ActividadID}>
                  <TableCell>{a.Nombre}</TableCell>
                  <TableCell>{a.TipoActividad}</TableCell>
                  <TableCell>{formatDate(a.FechaHoraInicio, true)}</TableCell>
                  <TableCell>{formatDate(a.FechaHoraFin, true)}</TableCell>
                  <TableCell>{a.Lugar}</TableCell>
                  <TableCell align="center">
                     <Tooltip title="Ver detalles">
                                            <IconButton 
                                              color="info" 
                                              onClick={() => navigate(`/actividades/${a.ActividadID}`)}>
                                            
                                              <ViewIcon />
                                            </IconButton>
                                          </Tooltip>
                    <Tooltip title="Editar">
                                              <IconButton 
                                                color="primary" 
                                                onClick={() => navigate(`/actividades/edit/${a.ActividadID}`)}>
                                              
                                                <EditIcon />
                                              </IconButton>
                                            </Tooltip>
                    
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => {
                        if (window.confirm('¿Desea eliminar esta actividad?')) {
                          actividadesService.delete(a.ActividadID)
                            .then(() => {
                              setActividades(prev => prev.filter(x => x.ActividadID !== a.ActividadID));
                            })
                            .catch(() => alert('Error al eliminar'));
                        }
                      }}>
                        <Delete color="error" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default ActividadesList;
