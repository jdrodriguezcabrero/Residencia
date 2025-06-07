import React, { useEffect, useState } from 'react';
import {
  Box, Button, Grid, Paper, TextField, Typography, Alert, CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { actividadesService } from '../../services/api';

const ActividadesForm = () => {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    Nombre: '',
    TipoActividad: '',
    FechaHoraInicio: '',
    FechaHoraFin: '',
    Lugar: '',
    Descripcion: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing) {
      setLoading(true);
      actividadesService.getById(id)
        .then(res => {
          const data = res.data?.data || res.data;
          setForm({
            Nombre: data.Nombre || '',
            TipoActividad: data.TipoActividad || '',
            FechaHoraInicio: data.FechaHoraInicio?.split('T')[0] || '',
            FechaHoraFin: data.FechaHoraFin?.split('T')[0] || '',
            Lugar: data.Lugar || '',
            Descripcion: data.Descripcion || ''
          });
        })
        .catch(err => {
          console.error('Error al cargar actividad:', err);
          setError('Error al cargar los datos.');
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (isEditing) {
        await actividadesService.update(id, form);
      } else {
        await actividadesService.create(form);
      }
      navigate('/actividades');
    } catch (err) {
      console.error('Error al guardar actividad:', err);
      setError('Error al guardar la actividad');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Box textAlign="center"><CircularProgress /></Box>;
  }

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        {isEditing ? 'Editar Actividad' : 'Nueva Actividad'}
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Nombre" name="Nombre" fullWidth value={form.Nombre} onChange={handleChange} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField label="Tipo de Actividad" name="TipoActividad" fullWidth value={form.TipoActividad} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField type="date" label="Fecha Inicio" name="FechaHoraInicio" fullWidth value={form.FechaHoraInicio} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField type="date" label="Fecha Fin" name="FechaHoraFin" fullWidth value={form.FechaHoraFin} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Lugar" name="Lugar" fullWidth value={form.Lugar} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <TextField label="Descripción" name="Descripcion" multiline rows={4} fullWidth value={form.Descripcion} onChange={handleChange} />
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="space-between">
              <Button onClick={() => navigate('/actividades')} variant="outlined">Cancelar</Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ActividadesForm;
