import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Button, Container, Grid, Avatar, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AssignmentIcon,
  Comment as CommentIcon
} from '@mui/icons-material';
import { incidenciasService } from '../../services/api';
import { formatDateTime } from '../../utils/dateUtils';

const IncidenciasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incidencia, setIncidencia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    incidenciasService.getById(id)
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setIncidencia(data);
        } else {
          setError("No se encontró la incidencia.");
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar incidencia:', err);
        setError("Error al cargar la información.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Resuelta': return 'success';
      case 'Pendiente': return 'warning';
      case 'En proceso': return 'info';
      case 'Cancelada': return 'error';
      default: return 'default';
    }
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
          <Button variant="outlined" onClick={() => navigate('/incidencias')}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/incidencias')}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/incidencias/edit/${id}`)}
        >
          Editar
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'error.main' }}>
              {incidencia.Tipo?.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {incidencia.Tipo}
            </Typography>
            <Chip 
              label={incidencia.Estado}
              color={getEstadoColor(incidencia.Estado)}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Detalles de la Incidencia</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><EventIcon /></ListItemIcon>
                        <ListItemText primary="Fecha y Hora" secondary={formatDateTime(incidencia.FechaHora)} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><WarningIcon /></ListItemIcon>
                        <ListItemText primary="Gravedad" secondary={incidencia.Gravedad} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Reportada por" secondary={incidencia.PersonalReportaNombre || '—'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><AssignmentIcon /></ListItemIcon>
                        <ListItemText primary="Residente" secondary={incidencia.ResidenteNombre || '—'} />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Descripción & Observaciones</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><ReportIcon /></ListItemIcon>
                        <ListItemText primary="Descripción" secondary={incidencia.Descripcion || '—'} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><CommentIcon /></ListItemIcon>
                        <ListItemText primary="Observaciones" secondary={incidencia.Observaciones || '—'} />
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

export default IncidenciasDetail;
