import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, IconButton, Tooltip, CircularProgress } from '@mui/material';
import { Add, Delete as DeleteIcon, Visibility as ViewIcon, Edit as EditIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { dietasService } from '../../services/api';

const DietasList = () => {
  const [dietas, setDietas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDietas = async () => {
    try {
      const res = await dietasService.getAll();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
setDietas(data);

    } catch (error) {
      console.error("❌ Error al cargar dietas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietas();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar esta dieta?')) return;
    try {
      await dietasService.delete(id);
      setDietas(prev => prev.filter(d => d.DietaID !== id));
    } catch (error) {
      console.error("❌ Error al eliminar dieta:", error);
      alert("Error al eliminar la dieta");
    }
  };

  const handleToggleEstado = async (id, actualEstado) => {
  const nuevoEstado = actualEstado ? 0 : 1;
  if (window.confirm(`¿Deseas cambiar el estado a ${nuevoEstado ? 'Activa' : 'Inactiva'}?`)) {
    try {
      await dietasService.updateEstado(id, nuevoEstado);
      setDietas(prev =>
        prev.map(d =>
          d.DietaID === id ? { ...d, Activo: nuevoEstado } : d
        )
      );
    } catch (error) {
      console.error("❌ Error al cambiar estado:", error);
      alert("Error al cambiar el estado");
    }
  }
};


  if (loading) return <Box sx={{ textAlign: 'center', mt: 5 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Dietas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/dietas/new')}>Nueva Dieta</Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Características</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dietas.map(dieta => (
              <TableRow key={dieta.DietaID}>
                <TableCell>{dieta.Nombre}</TableCell>
                <TableCell>{dieta.Caracteristicas}</TableCell>
                <TableCell>
  <Chip 
    label={dieta.Activo ? 'Activa' : 'Inactiva'} 
    color={dieta.Activo ? 'success' : 'error'} 
    size="small" 
  />
</TableCell>

                <TableCell align="center">
                   <Tooltip title="Ver detalles">
                                                              <IconButton 
                                                                color="info" 
                                                                onClick={() =>  navigate(`/dietas/${dieta.DietaID}`)}>
                                                              
                                                                <ViewIcon />
                                                              </IconButton>
                                                            </Tooltip>
                 <Tooltip title="Editar">
                                                               <IconButton 
                                                                 color="primary" 
                                                                 onClick={() => navigate(`/dietas/edit/${dieta.DietaID}`)}>
                                                               
                                                                 <EditIcon />
                                                               </IconButton>
                                                             </Tooltip>
                  <Tooltip title={dieta.Activo ? "Cambiar a Inactiva" : "Cambiar a Activa"}>
  <IconButton
    color={dieta.Activo ? "error" : "success"}
    onClick={() => handleToggleEstado(dieta.DietaID, dieta.Activo)}
  >
    <DeleteIcon />
  </IconButton>
</Tooltip>

                </TableCell>
              </TableRow>
            ))}
            {dietas.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">No hay dietas registradas.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DietasList;
