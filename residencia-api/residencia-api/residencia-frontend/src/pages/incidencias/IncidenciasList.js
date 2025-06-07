import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, Paper, IconButton, TextField, Tooltip
} from '@mui/material';
import { Add, Delete, Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material';
import { incidenciasService } from '../../services/api';

const IncidenciasList = () => {
  const navigate = useNavigate();
  const [incidencias, setIncidencias] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    incidenciasService.getAll().then(res => {
      const data = res.data?.data || res.data || [];
      setIncidencias(data);
      setFiltered(data);
    });
  }, []);

  useEffect(() => {
    const term = search.toLowerCase();
    setFiltered(
      incidencias.filter(i =>
        i.Descripcion?.toLowerCase().includes(term) ||
        i.Estado?.toLowerCase().includes(term)
      )
    );
  }, [search, incidencias]);

  const handleDelete = id => {
    if (window.confirm('¿Seguro que deseas eliminar la incidencia?')) {
      incidenciasService.delete(id).then(() => {
        setIncidencias(prev => prev.filter(i => i.IncidenciaID !== id));
      });
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Incidencias</Typography>
      <Box display="flex" justifyContent="space-between" mb={2}>
        <TextField label="Buscar" value={search} onChange={e => setSearch(e.target.value)} />
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/incidencias/new')}>
          Nueva Incidencia
        </Button>
      </Box>

      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Descripción</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Gravedad</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(i => (
                <TableRow key={i.IncidenciaID}>
                  <TableCell>{i.Descripcion}</TableCell>
                  <TableCell>{i.FechaHora?.split('T')[0]}</TableCell>
                  <TableCell>{i.Estado}</TableCell>
                  <TableCell>{i.Gravedad}</TableCell>
                  <TableCell align="center">
                     <Tooltip title="Ver detalles">
                                                                <IconButton 
                                                                  color="info" 
                                                                  onClick={() => navigate(`/incidencias/${i.IncidenciaID}`)}>
                                                                
                                                                  <ViewIcon />
                                                                </IconButton>
                                                              </Tooltip>
                                                               <Tooltip title="Editar">
                                                                                                            <IconButton 
                                                                                                              color="primary" 
                                                                                                              onClick={() => navigate(`/incidencias/edit/${i.IncidenciaID}`)}>
                                                                                                            
                                                                                                              <EditIcon />
                                                                                                            </IconButton>
                                                                                                          </Tooltip>
                    <Tooltip title="Eliminar">
                      <IconButton onClick={() => handleDelete(i.IncidenciaID)} color="error"><Delete /></IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          count={filtered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={e => {
            setRowsPerPage(parseInt(e.target.value));
            setPage(0);
          }}
        />
      </Paper>
    </Box>
  );
};

export default IncidenciasList;
