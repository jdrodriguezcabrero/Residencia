import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { dietasService } from '../../services/api';

const DietasForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    Nombre: '',
    Caracteristicas: '',
    Activo: true,
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      dietasService.getById(id)
        .then(res => {
          const data = res.data;
          setForm({
            Nombre: data.Nombre || '',
            Caracteristicas: data.Caracteristicas || '',
            Activo: data.Activo ?? true,
          });
        })
        .catch(err => {
          console.error("❌ Error al cargar la dieta:", err);
          setError("Error al cargar los datos de la dieta.");
        });
    }
  }, [id, isEditing]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'Activo' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await dietasService.update(id, form);
      } else {
        await dietasService.create(form);
      }
      navigate('/dietas');
    } catch (err) {
      console.error("❌ Error al guardar dieta:", err);
      setError("Error al guardar los datos. Intente de nuevo.");
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>{isEditing ? 'Editar Dieta' : 'Nueva Dieta'}</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Nombre"
          name="Nombre"
          value={form.Nombre}
          onChange={handleChange}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="Características"
          name="Caracteristicas"
          value={form.Caracteristicas}
          onChange={handleChange}
          multiline
          rows={4}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="activo-label">Estado</InputLabel>
          <Select
            labelId="activo-label"
            name="Activo"
            value={form.Activo.toString()}
            label="Estado"
            onChange={handleChange}
          >
            <MenuItem value="true">Activo</MenuItem>
            <MenuItem value="false">Inactivo</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button type="submit" variant="contained">Guardar</Button>
          <Button variant="outlined" onClick={() => navigate('/dietas')}>Cancelar</Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default DietasForm;
