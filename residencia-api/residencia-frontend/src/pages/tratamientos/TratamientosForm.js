import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Typography, TextField, MenuItem, Button, Grid, Paper
} from '@mui/material';
import {
  tratamientosService,
  residentesService,
  personalService,
  medicamentosService
} from '../../services/api';

const TratamientosForm = () => {
  const [form, setForm] = useState({
    ResidenteID: '',
    MedicamentoID: '',
    Dosis: '',
    Frecuencia: '',
    ViaAdministracion: '',
    FechaInicio: '',
    FechaFin: '',
    Instrucciones: '',
    PersonalID: '',
    Activo: true
  });

  const [residentes, setResidentes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [medicamentos, setMedicamentos] = useState([]);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Residentes
    residentesService.getAll().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log('📦 Residentes cargados:', data);
      setResidentes(data);
    }).catch(error => {
      console.error('❌ Error cargando residentes:', error);
      setResidentes([]);
    });
  
    // Personal
personalService.getAll().then(res => {
  const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
  console.log('📦 Personal cargado:', data);

  // Verifica estructura exacta de un empleado
  if (data.length > 0) {
    console.log('🧪 Primer empleado:', data[0]);
  } else {
    console.warn('⚠️ El array de empleados está vacío');
  }

  setEmpleados(data);
}).catch(error => {
  console.error('❌ Error cargando personal:', error);
  setEmpleados([]);
});

  
    // Medicamentos
    medicamentosService.getAll().then(res => {
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      console.log('📦 Medicamentos cargados:', data);
      setMedicamentos(data);
    }).catch(error => {
      console.error('❌ Error cargando medicamentos:', error);
      setMedicamentos([]);
    });
  
    // Tratamiento si se edita
    if (id) {
      tratamientosService.getById(id).then(res => {
        const tratamiento = res.data || {};
        console.log('✏️ Editando tratamiento:', tratamiento);
        setForm({
          ...tratamiento,
          FechaInicio: tratamiento.FechaInicio?.split('T')[0] || '',
          FechaFin: tratamiento.FechaFin?.split('T')[0] || ''
        });
      }).catch(error => {
        console.error('❌ Error cargando tratamiento:', error);
      });
    }
  }, [id]);
  

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'Activo' ? value === 'true' : value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.ResidenteID || !form.MedicamentoID || !form.PersonalID) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }
    
    try {
      if (id) {
        await tratamientosService.update(id, form);
      } else {
        await tratamientosService.create(form);
      }
      navigate('/tratamientos');
    } catch (error) {
      console.error("Error guardando tratamiento", error);
    }
  };

  return (
    <Container component={Paper} sx={{ p: 3, mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        {id ? "Editar" : "Nuevo"} Tratamiento
      </Typography>
      <form onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
          <TextField select fullWidth label="Residente" name="ResidenteID" value={form.ResidenteID || ''} onChange={handleChange} required>
          {residentes.map(r => (
  <MenuItem key={r.ResidenteID || r.id} value={r.ResidenteID || r.id}>
    {r.Nombre} {r.Apellidos}
  </MenuItem>
))}

</TextField>

          </Grid>

          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Medicamento" name="MedicamentoID" value={form.MedicamentoID || ''} onChange={handleChange} required>
              {medicamentos.map(m => (
                <MenuItem key={m.MedicamentoID || m.id} value={m.MedicamentoID || m.id}>
                  {m.Nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Dosis" name="Dosis" value={form.Dosis} onChange={handleChange} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Frecuencia" name="Frecuencia" value={form.Frecuencia} onChange={handleChange} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Vía de Administración" name="ViaAdministracion" value={form.ViaAdministracion} onChange={handleChange} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth type="date" label="Fecha de Inicio" name="FechaInicio" value={form.FechaInicio || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} required />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField fullWidth type="date" label="Fecha de Fin" name="FechaFin" value={form.FechaFin || ''} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>

          <Grid item xs={12}>
            <TextField fullWidth multiline rows={4} label="Instrucciones" name="Instrucciones" value={form.Instrucciones} onChange={handleChange} />
          </Grid>

          <Grid item xs={12} md={6}>
          <TextField select fullWidth label="Personal Responsable" name="PersonalID" value={form.PersonalID || ''} onChange={handleChange} required>
          {empleados.map(e => (
  <MenuItem key={e.PersonalID || e.id} value={e.PersonalID || e.id}>
    {e.Nombre} {e.Apellidos}
  </MenuItem>
))}

</TextField>

          </Grid>

          <Grid item xs={12} md={6}>
            <TextField select fullWidth label="Activo" name="Activo" value={form.Activo?.toString() || 'true'} onChange={handleChange} required>
              <MenuItem value="true">Sí</MenuItem>
              <MenuItem value="false">No</MenuItem>
            </TextField>
          </Grid>
        </Grid>
        <Button sx={{ mt: 2 }} type="submit" variant="contained">Guardar</Button>
      </form>
    </Container>
  );
};

export default TratamientosForm;
