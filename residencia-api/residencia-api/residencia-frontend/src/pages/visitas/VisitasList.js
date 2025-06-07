import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Button, CircularProgress, IconButton, Paper, Table, TableBody,
  TableCell, Stack, Chip, TableContainer, TableHead, TablePagination, TableRow, TextField, Typography, Tooltip, Avatar
} from '@mui/material';
import {
  Add, Edit, Delete, Visibility,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Groups as FriendsIcon,
  Badge as VisitorIcon
} from '@mui/icons-material';
import { visitasService } from '../../services/api';

const VisitasList = () => {
  const navigate = useNavigate();
  const [visitas, setVisitas] = useState([]);
  const [filteredVisitas, setFilteredVisitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    visitasService.getAll().then(res => {
      const data = res.data?.data || res.data || [];
      setVisitas(data);
      setFilteredVisitas(data);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const searchLower = search.toLowerCase();
    setFilteredVisitas(visitas.filter(v =>
      v.NombreVisitante?.toLowerCase().includes(searchLower) ||
      v.RelacionConResidente?.toLowerCase().includes(searchLower) ||
      v.Observaciones?.toLowerCase().includes(searchLower)
    ));
  }, [search, visitas]);

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar esta visita?")) {
      await visitasService.delete(id);
      setVisitas(prev => prev.filter(v => v.VisitaID !== id));
    }
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const getRelacionIcon = (relacion) => {
    if (relacion?.toLowerCase().includes('familiar')) return <FamilyIcon fontSize="small" />;
    if (relacion?.toLowerCase().includes('amigo')) return <FriendsIcon fontSize="small" />;
    return <VisitorIcon fontSize="small" />;
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
  }

  const visitasEnPantalla = filteredVisitas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Visitas</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/visitas/new')}>
          Nueva Visita
        </Button>
      </Box>

      <TextField
        label="Buscar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        fullWidth
        sx={{ mb: 2 }}
      />

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Visitante</TableCell>
              <TableCell>Relación</TableCell>
              <TableCell>Entrada</TableCell>
              <TableCell>Salida</TableCell>
              <TableCell>Residente</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visitasEnPantalla.map((v) => (
              <TableRow key={v.VisitaID}>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 30, height: 30 }}>
                      {v.NombreVisitante?.charAt(0) || 'V'}
                    </Avatar>
                    <Typography variant="body2">{v.NombreVisitante}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <Chip
                    icon={getRelacionIcon(v.RelacionConResidente)}
                    label={v.RelacionConResidente || "No especificado"}
                    color={
                      v.RelacionConResidente?.toLowerCase().includes("familiar")
                        ? "primary"
                        : v.RelacionConResidente?.toLowerCase().includes("amigo")
                        ? "success"
                        : "default"
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>{v.FechaHoraEntrada?.split('T')[0]}</TableCell>
                <TableCell>{v.FechaHoraSalida?.split('T')[0] || '-'}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PersonIcon fontSize="small" color="action" />
                    {v.ResidenteNombre}
                  </Stack>
                </TableCell>
                <TableCell align="center">
                  <Tooltip title="Ver Detalles">
                    <IconButton color="info" onClick={() => navigate(`/visitas/${v.VisitaID}`)}>
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => navigate(`/visitas/edit/${v.VisitaID}`)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Eliminar">
                    <IconButton color="error" onClick={() => handleDelete(v.VisitaID)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {visitasEnPantalla.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">No hay visitas registradas</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={filteredVisitas.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default VisitasList;
