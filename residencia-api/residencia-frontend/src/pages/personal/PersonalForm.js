import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, Button, Grid, Paper, MenuItem
} from '@mui/material';
import { personalService } from '../../services/api';

const PersonalForm = () => {
  const [form, setForm] = useState({
    DNI: '',
    Nombre: '',
    Apellidos: '',
    FechaNacimiento: '',
    Direccion: '',
    Telefono: '',
    Email: '',
    Categoria: '',
    FechaContratacion: '',
    Activo: true
  });

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      personalService.getById(id)
        .then(res => {
          const data = res.data;
          setForm({
            ...data,
            FechaNacimiento: data.FechaNacimiento?.split('T')[0] || '',
            FechaContratacion: data.FechaContratacion?.split('T')[0] || ''
          });
        })
        .catch(error => {
          console.error('❌ Error al cargar el personal:', error);
          alert('Error al cargar los datos necesarios. Por favor, intente de nuevo.');
        });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'Activo' ? value === 'true' : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (id) {
        await personalService.update(id, form);
      } else {
        await personalService.create(form);
      }
      navigate('/personal');
    } catch (error) {
      console.error("Error al guardar empleado:", error);
      alert("Ocurrió un error al guardar el empleado.");
    }
  };

  return (
    <Container component={Paper} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {id ? 'Editar Empleado' : 'Nuevo Empleado'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="DNI" label="DNI" value={form.DNI} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="Nombre" label="Nombre" value={form.Nombre} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="Apellidos" label="Apellidos" value={form.Apellidos} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" name="FechaNacimiento" label="Fecha Nacimiento" value={form.FechaNacimiento} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth name="Direccion" label="Dirección" value={form.Direccion} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="Telefono" label="Teléfono" value={form.Telefono} onChange={handleChange} required />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth name="Email" label="Email" value={form.Email} onChange={handleChange} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField select fullWidth name="Categoria" label="Categoría" value={form.Categoria} onChange={handleChange} required>
              {['Médico', 'Enfermero', 'Auxiliar', 'Administrativo', 'Recepción', 'Fisioterapeuta', 'Psicólogo', 'Terapeuta Ocupacional', 'Trabajador Social'].map(op => (
                <MenuItem key={op} value={op}>{op}</MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth type="date" name="FechaContratacion" label="Fecha Contratación" value={form.FechaContratacion} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
          </Grid>
          <Grid item xs={12}>
            <TextField select fullWidth name="Activo" label="Activo" value={form.Activo?.toString()} onChange={handleChange} required>
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Button sx={{ mt: 3 }} type="submit" variant="contained">Guardar</Button>
      </form>
    </Container>
  );
};

export default PersonalForm;
