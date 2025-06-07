import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Grid
} from '@mui/material';
import { visitasService } from '../../services/api';

const VisitasForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    ResidenteID: '',
    NombreVisitante: '',
    RelacionConResidente: '',
    FechaHoraEntrada: '',
    FechaHoraSalida: '',
    Observaciones: ''
  });

  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      visitasService.getById(id)
        .then(res => {
          const data = res.data?.data || res.data;
          setForm({
            ResidenteID: data.ResidenteID || '',
            NombreVisitante: data.NombreVisitante || '',
            RelacionConResidente: data.RelacionConResidente || '',
            FechaHoraEntrada: data.FechaHoraEntrada ? data.FechaHoraEntrada.slice(0, 16) : '',
            FechaHoraSalida: data.FechaHoraSalida ? data.FechaHoraSalida.slice(0, 16) : '',
            Observaciones: data.Observaciones || ''
          });
        })
        .catch(err => {
          console.error("❌ Error al cargar visita:", err);
          setError("Error al cargar la información de la visita.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await visitasService.update(id, form);
      } else {
        await visitasService.create(form);
      }
      navigate('/visitas');
    } catch (err) {
      console.error("❌ Error al guardar visita:", err);
      setError("Error al guardar los datos. Intente de nuevo.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? 'Editar Visita' : 'Registrar Nueva Visita'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="ID del Residente"
                name="ResidenteID"
                value={form.ResidenteID}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Nombre del Visitante"
                name="NombreVisitante"
                value={form.NombreVisitante}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Relación con el Residente"
                name="RelacionConResidente"
                value={form.RelacionConResidente}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="datetime-local"
                fullWidth
                required
                label="Entrada"
                name="FechaHoraEntrada"
                InputLabelProps={{ shrink: true }}
                value={form.FechaHoraEntrada}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                type="datetime-local"
                fullWidth
                label="Salida"
                name="FechaHoraSalida"
                InputLabelProps={{ shrink: true }}
                value={form.FechaHoraSalida}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Observaciones"
                name="Observaciones"
                value={form.Observaciones}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/visitas')}>
                Cancelar
              </Button>
              <Button variant="contained" type="submit">
                Guardar
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default VisitasForm;
