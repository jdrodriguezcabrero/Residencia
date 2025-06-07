import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { personalService } from '../../services/api';
import { formatDate } from '../../utils/dateUtils';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Email as EmailIcon,
  Phone as PhoneIcon
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const PersonalList = () => {
  const navigate = useNavigate();

  const [personal, setPersonal] = useState([]);
  const [filteredPersonal, setFilteredPersonal] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('todos');

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchPersonal = async () => {
      try {
        setLoading(true);
        const response = await personalService.getAll();
        const data = Array.isArray(response.data) ? response.data : response.data?.data || [];
        setPersonal(data);
        setFilteredPersonal(data);
      } catch (err) {
        console.error('Error al cargar personal:', err);
        setError('Error al cargar la lista de personal. Por favor, intente de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonal();
  }, []);

  useEffect(() => {
    const searchTermLower = searchTerm.toLowerCase();
  
    const filtered = personal.filter(empleado => {
      const matchesSearch =
        empleado.Nombre.toLowerCase().includes(searchTermLower) ||
        empleado.Apellidos.toLowerCase().includes(searchTermLower) ||
        empleado.DNI.toLowerCase().includes(searchTermLower) ||
        empleado.Categoria.toLowerCase().includes(searchTermLower) ||
        (empleado.Email && empleado.Email.toLowerCase().includes(searchTermLower));
  
        const matchesEstado =
        estadoFiltro === 'todos' ||
        (estadoFiltro === 'activos' && Boolean(Number(empleado.Activo))) ||
        (estadoFiltro === 'inactivos' && !Boolean(Number(empleado.Activo)));
  
      return matchesSearch && matchesEstado;
    });
  
    setFilteredPersonal(filtered);
  }, [searchTerm, estadoFiltro, personal]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const personalEnPantalla = filteredPersonal.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
            Personal
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/personal/new')}
          >
            Nuevo Empleado
          </Button>
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
          label="Buscar personal"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          placeholder="Buscar por nombre, apellidos, DNI, categoría o email..."
          sx={{ mb: 2 }}
        />

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>DNI</TableCell>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellidos</TableCell>
                <TableCell>Categoría</TableCell>
                <TableCell>Contacto</TableCell>
                <TableCell>Fecha Contratación</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {personalEnPantalla.map((empleado) => (
                <TableRow key={empleado.PersonalID}>
                  <TableCell>{empleado.DNI}</TableCell>
                  <TableCell>{empleado.Nombre}</TableCell>
                  <TableCell>{empleado.Apellidos}</TableCell>
                  <TableCell>
                    <Chip label={empleado.Categoria} size="small" />
                  </TableCell>
                  <TableCell>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
    <span><PhoneIcon fontSize="small" /> {empleado.Telefono}</span>
    <span><EmailIcon fontSize="small" /> {empleado.Email}</span>
  </div>
                  </TableCell>
                  <TableCell>{formatDate(empleado.FechaContratacion)}</TableCell>
                  <TableCell>
                    <Chip 
  label={empleado.Activo ? 'Activo' : 'Inactivo'} 
  color={empleado.Activo ? 'success' : 'error'} 
  size="small" 
/>

                  </TableCell>
                  <TableCell align="center">
  <Tooltip title="Ver detalles">
    <IconButton color="info" onClick={() => {
  console.log('🟢 Ver detalles: PersonalID =', empleado.PersonalID);
  navigate(`/personal/${empleado.PersonalID}`);
}}>
  <ViewIcon />
</IconButton>

  </Tooltip>
  <Tooltip title="Editar">
    <IconButton color="primary" onClick={() => navigate(`/personal/edit/${empleado.PersonalID}`)}>
      <EditIcon />
    </IconButton>
  </Tooltip>
  <Tooltip title={Number(empleado.Activo) === 1 ? "Cambiar a inactivo" : "Cambiar a activo"}>
    <IconButton
      color={Number(empleado.Activo) === 1 ? "error" : "success"}
      onClick={() => {
        const nuevoEstado = Number(empleado.Activo) === 1 ? 0 : 1;
        if (window.confirm('¿Deseas cambiar el estado?')) {
          personalService.updateEstado(empleado.PersonalID, nuevoEstado).then(() => {
            setPersonal(prev =>
              prev.map(e =>
                e.PersonalID === empleado.PersonalID
                  ? { ...e, Activo: nuevoEstado }
                  : e
              )
            );
          });
        }
      }}
    >
                        <DeleteIcon />
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
          component="div"
          count={filteredPersonal.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
};

export default PersonalList;
