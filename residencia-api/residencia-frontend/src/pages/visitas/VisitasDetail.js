import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Container, CircularProgress, Paper, Grid, Avatar, Button, Chip, Card, CardContent, List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Groups as FriendsIcon,
  Event as CalendarIcon,
  Info as InfoIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { visitasService } from '../../services/api';

const VisitasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [visita, setVisita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    visitasService.getById(id)
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setVisita(data);
        } else {
          setError("Visita no encontrada");
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar visita:', err);
        setError("Error al cargar la información de la visita");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getRelacionColor = (relacion) => {
    if (relacion?.toLowerCase().includes('familiar')) return 'primary';
    if (relacion?.toLowerCase().includes('amigo')) return 'success';
    return 'default';
  };

  const getRelacionIcon = (relacion) => {
    if (relacion?.toLowerCase().includes('familiar')) return <FamilyIcon />;
    if (relacion?.toLowerCase().includes('amigo')) return <FriendsIcon />;
    return <PersonIcon />;
  };

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
          <Button variant="outlined" onClick={() => navigate('/visitas')}>Volver</Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/visitas')}>
          Volver
        </Button>
        <Button variant="contained" color="primary" startIcon={<EditIcon />} onClick={() => navigate(`/visitas/edit/${id}`)}>
          Editar
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'primary.main' }}>
              {visita.NombreVisitante?.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>{visita.NombreVisitante}</Typography>
            <Chip
              icon={getRelacionIcon(visita.RelacionConResidente)}
              label={visita.RelacionConResidente || 'No especificado'}
              color={getRelacionColor(visita.RelacionConResidente)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Detalles de la Visita</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary="Fecha Entrada" secondary={visita.FechaHoraEntrada?.split('T')[0]} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CalendarIcon /></ListItemIcon>
                        <ListItemText primary="Fecha Salida" secondary={visita.FechaHoraSalida?.split('T')[0] || '—'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Residente" secondary={visita.ResidenteNombre} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Observaciones</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><CommentIcon /></ListItemIcon>
                        <ListItemText primary={visita.Observaciones || 'Sin observaciones'} />
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

export default VisitasDetail;
