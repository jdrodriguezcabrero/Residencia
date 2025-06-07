import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Container, CircularProgress, Button, Avatar, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Medication as MedicationIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { tratamientosService } from '../../services/api';

const TratamientosDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tratamiento, setTratamiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    tratamientosService.getById(id)
      .then((res) => {
        const data = res.data?.data || res.data;
        if (!data) {
          setError("Tratamiento no encontrado");
        } else {
          setTratamiento(data);
        }
      })
      .catch((err) => {
        console.error("❌ Error al cargar tratamiento:", err);
        setError("Error al cargar el tratamiento");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Box mt={2}>
          <Button variant="outlined" onClick={() => navigate('/tratamientos')}>
            Volver a la lista
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/tratamientos')}>
          Volver
        </Button>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => navigate(`/tratamientos/edit/${id}`)}>
          Editar
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'primary.main' }}>
              {tratamiento.MedicamentoNombre?.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {tratamiento.MedicamentoNombre}
            </Typography>
            <Chip 
              label={tratamiento.Activo ? 'Activo' : 'Inactivo'}
              color={tratamiento.Activo ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Detalles</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Residente" secondary={tratamiento.ResidenteNombre || `ID: ${tratamiento.ResidenteID}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AssignmentIcon /></ListItemIcon>
                        <ListItemText primary="Prescrito por" secondary={tratamiento.PersonalNombre || `ID: ${tratamiento.PersonalID}`} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><InfoIcon /></ListItemIcon>
                        <ListItemText primary="Dosis" secondary={tratamiento.Dosis} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><InfoIcon /></ListItemIcon>
                        <ListItemText primary="Frecuencia" secondary={tratamiento.Frecuencia} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><InfoIcon /></ListItemIcon>
                        <ListItemText primary="Vía" secondary={tratamiento.ViaAdministracion} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Fechas e Instrucciones</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary="Fecha Inicio" secondary={tratamiento.FechaInicio?.split('T')[0]} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary="Fecha Fin" secondary={tratamiento.FechaFin?.split('T')[0] || '—'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DescriptionIcon /></ListItemIcon>
                        <ListItemText primary="Instrucciones" secondary={tratamiento.Instrucciones || '—'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default TratamientosDetail;
