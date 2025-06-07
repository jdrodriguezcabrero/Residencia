import React, { useEffect, useState } from 'react';
import {
  Container, Paper, Typography, TextField, Button, MenuItem,
  Grid, Alert, CircularProgress
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { incidenciasService, residentesService } from '../../services/api';

const IncidenciasForm = () => {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ResidenteID: '',
    FechaHora: '',
    Descripcion: '',
    Tipo: '',
    Gravedad: '',
    Estado: '',
    Observaciones: ''
  });

  const [residentes, setResidentes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    residentesService.getAll()
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : res.data.data;
        setResidentes(data);
      })
      .catch(() => setResidentes([]));

    if (isEditing) {
      incidenciasService.getById(id)
        .then(res => {
          const data = res.data?.data || res.data;
          setForm({
            ResidenteID: data.ResidenteID || '',
            FechaHora: data.FechaHora?.slice(0, 16) || '',
            Descripcion: data.Descripcion || '',
            Tipo: data.Tipo || '',
            Gravedad: data.Gravedad || '',
            Estado: data.Estado || '',
            Observaciones: data.Observaciones || ''
          });
        })
        .catch(() => setError('Error al cargar la incidencia'))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await incidenciasService.update(id, form);
      } else {
        await incidenciasService.create(form);
      }
      navigate('/incidencias');
    } catch (err) {
      console.error("❌ Error al guardar incidencia:", err);
      setError('Error al guardar los datos. Verifica los campos.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 5 }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {isEditing ? 'Editar Incidencia' : 'Nueva Incidencia'}
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                required
                name="ResidenteID"
                label="Residente"
                value={form.ResidenteID}
                onChange={handleChange}
              >
                {residentes.map((res) => (
                  <MenuItem key={res.ResidenteID} value={res.ResidenteID}>
                    {res.Nombre} {res.Apellidos}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Fecha y Hora"
                name="FechaHora"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={form.FechaHora}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                multiline
                rows={3}
                label="Descripción"
                name="Descripcion"
                value={form.Descripcion}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Tipo de Incidencia"
                name="Tipo"
                value={form.Tipo}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Gravedad"
                name="Gravedad"
                value={form.Gravedad}
                onChange={handleChange}
              >
                <MenuItem value="Leve">Leve</MenuItem>
                <MenuItem value="Moderada">Moderada</MenuItem>
                <MenuItem value="Grave">Grave</MenuItem>
                <MenuItem value="Muy Grave">Muy Grave</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                select
                required
                fullWidth
                label="Estado"
                name="Estado"
                value={form.Estado}
                onChange={handleChange}
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="En Proceso">En Proceso</MenuItem>
                <MenuItem value="Resuelta">Resuelta</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Observaciones"
                name="Observaciones"
                value={form.Observaciones}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/incidencias')}>Cancelar</Button>
              <Button variant="contained" type="submit">Guardar</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default IncidenciasForm;
