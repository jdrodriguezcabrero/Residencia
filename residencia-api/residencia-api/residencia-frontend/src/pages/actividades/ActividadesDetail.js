import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Button,
  Container,
  Grid,
  Avatar,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  EventNote as EventNoteIcon,
  LocationOn as LocationIcon,
  DateRange as DateIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { actividadesService } from '../../services/api';

const ActividadesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [actividad, setActividad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    actividadesService.getById(id)
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setActividad(data);
        } else {
          setError("No se encontró la actividad.");
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar actividad:', err);
        setError("Error al cargar la información.");
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
          <Button variant="outlined" onClick={() => navigate('/actividades')}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/actividades')}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/actividades/edit/${id}`)}
        >
          Editar
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'primary.main' }}>
              {actividad.Nombre.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {actividad.Nombre}
            </Typography>
            <Chip 
              label={actividad.TipoActividad}
              color="info"
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
                        <ListItemIcon><LocationIcon /></ListItemIcon>
                        <ListItemText primary="Lugar" secondary={actividad.Lugar} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DateIcon /></ListItemIcon>
                        <ListItemText primary="Fecha Inicio" secondary={actividad.FechaHoraInicio?.split('T')[0]} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><DateIcon /></ListItemIcon>
                        <ListItemText primary="Fecha Fin" secondary={actividad.FechaHoraFin?.split('T')[0]} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Descripción</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><DescriptionIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Descripción" 
                          secondary={actividad.Descripcion || '—'}
                        />
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

export default ActividadesDetail;
