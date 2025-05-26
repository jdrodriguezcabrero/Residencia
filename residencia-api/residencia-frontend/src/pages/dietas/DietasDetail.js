import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, CircularProgress, Button, Container, Grid, Avatar, Card, CardContent, Chip, List, ListItem, ListItemIcon, ListItemText, Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Restaurant as FoodIcon,
  Info as InfoIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';
import { dietasService } from '../../services/api';

const DietasDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dieta, setDieta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dietasService.getById(id)
      .then(res => {
        const data = res.data?.data || res.data;
        if (data) {
          setDieta(data);
        } else {
          setError("No se encontró la dieta.");
        }
      })
      .catch(err => {
        console.error('❌ Error al cargar dieta:', err);
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
          <Button variant="outlined" onClick={() => navigate('/dietas')}>
            Volver
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dietas')}>
          Volver
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<EditIcon />}
          onClick={() => navigate(`/dietas/edit/${id}`)}
        >
          Editar
        </Button>
      </Box>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 120, height: 120, fontSize: 60, mx: 'auto', bgcolor: 'primary.main' }}>
              {dieta.Nombre.charAt(0)}
            </Avatar>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {dieta.Nombre}
            </Typography>
            <Chip 
              label={dieta.Activo ? 'Activa' : 'Inactiva'}
              color={dieta.Activo ? 'success' : 'error'}
              sx={{ mt: 1 }}
            />
          </Grid>

          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Descripción</Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><DescriptionIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Descripción" 
                          secondary={dieta.Descripcion || '—'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><InfoIcon /></ListItemIcon>
                        <ListItemText 
                          primary="Características" 
                          secondary={dieta.Caracteristicas || '—'}
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

export default DietasDetail;
