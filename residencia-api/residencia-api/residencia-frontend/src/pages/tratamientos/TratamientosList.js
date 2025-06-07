import React, { useEffect, useState } from 'react';
import {
  Container, Stack, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Grid, Tooltip
} from '@mui/material';
import {
  Add,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { tratamientosService } from '../../services/api';
import { Medication as MedicationIcon, Person as PersonIcon, LocalHospital as LocalHospitalIcon } from '@mui/icons-material';




const TratamientosList = () => {
  const [tratamientos, setTratamientos] = useState([]);
  const navigate = useNavigate();

  const fetchTratamientos = async () => {
    try {
      const res = await tratamientosService.getAll();
      console.log('✅ Tratamientos obtenidos:', res.data);
      setTratamientos(Array.isArray(res.data) ? res.data : res.data?.data || []);
    } catch (error) {
      console.error("❌ Error al cargar tratamientos", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este tratamiento?")) {
      try {
        await tratamientosService.delete(id);
        fetchTratamientos();
      } catch (error) {
        if (error.response?.status === 409) {
          alert(error.response.data.message); // Mensaje desde el backend
        } else {
          alert("Error al eliminar el tratamiento");
        }
        console.error("❌ Error al eliminar tratamiento:", error);
      }
    }
  };

  const handleToggleEstado = async (id, actualEstado) => {
  const nuevoEstado = actualEstado ? 0 : 1;
  if (window.confirm(`¿Deseas cambiar el estado a ${nuevoEstado ? 'Activo' : 'Inactivo'}?`)) {
    try {
      await tratamientosService.updateEstado(id, nuevoEstado);
      setTratamientos(prev =>
        prev.map(t =>
          t.TratamientoID === id ? { ...t, Activo: nuevoEstado } : t
        )
      );
    } catch (error) {
      console.error("❌ Error al cambiar estado:", error);
      alert("Error al cambiar el estado");
    }
  }
};


  useEffect(() => {
    fetchTratamientos();
  }, []);

  return (
    <Container>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Grid item>
          <Typography variant="h4" gutterBottom>Tratamientos</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={() => navigate('/tratamientos/new')}
          >
            Nuevo Tratamiento
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Residente</TableCell>
              <TableCell>Medicamento</TableCell>
              <TableCell>Dosis</TableCell>
              <TableCell>Frecuencia</TableCell>
              <TableCell>Vía</TableCell>
              <TableCell>Fecha Inicio</TableCell>
              <TableCell>Fecha Fin</TableCell>
              <TableCell>Prescrito por:</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tratamientos.map((t) => (
              <TableRow key={t.TratamientoID}>
                <TableCell><Stack direction="row" spacing={1} alignItems="center">
    <PersonIcon color="action" fontSize="small" />
    <Typography variant="body2">{t.ResidenteNombre}</Typography>
  </Stack></TableCell>
                <TableCell><Stack direction="row" spacing={1} alignItems="center">
    <MedicationIcon color="primary" fontSize="small" />
    <Typography variant="body2">{t.MedicamentoNombre}</Typography>
  </Stack></TableCell>
                <TableCell>{t.Dosis}</TableCell>
                <TableCell>{t.Frecuencia}</TableCell>
                <TableCell>{t.ViaAdministracion}</TableCell>
                <TableCell>{t.FechaInicio?.split('T')[0]}</TableCell>
                <TableCell>{t.FechaFin?.split('T')[0] || '-'}</TableCell>
                <TableCell>  <Stack direction="row" spacing={1} alignItems="center">
    <LocalHospitalIcon color="secondary" fontSize="small" />
    <Typography variant="body2">{t.PersonalNombre}</Typography>
  </Stack></TableCell>
                <TableCell>
  <Chip 
    label={t.Activo ? 'Activo' : 'Inactivo'} 
    color={t.Activo ? 'success' : 'error'} 
    size="small" 
  />
</TableCell>

                <TableCell align="center">
                  <Tooltip title="Ver detalles">
                    <IconButton color="info" onClick={() => navigate(`/tratamientos/${t.TratamientoID}`)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Editar">
                    <IconButton color="primary" onClick={() => navigate(`/tratamientos/edit/${t.TratamientoID}`)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                 <Tooltip title={t.Activo ? "Cambiar a Inactivo" : "Cambiar a Activo"}>
  <IconButton
    color={t.Activo ? "error" : "success"}
    onClick={() => handleToggleEstado(t.TratamientoID, t.Activo)}
  >
    <DeleteIcon />
  </IconButton>
</Tooltip>


                </TableCell>
              </TableRow>
            ))}
            {tratamientos.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  No hay tratamientos registrados
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TratamientosList;
