
import React, { useState, useEffect } from 'react';
import { habitacionesService, residentesService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, InputLabel, FormControl, TextField
} from '@mui/material';

const CambioHabitacionModal = ({ residenteId, open, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [habitaciones, setHabitaciones] = useState([]);
  const [habitacionSeleccionada, setHabitacionSeleccionada] = useState('');
  const [motivo, setMotivo] = useState('');

  useEffect(() => {
    if (open) {
      habitacionesService.getDisponibles().then(res => {
        setHabitaciones(res.data.data);
      });
    }
  }, [open]);

  const handleSubmit = async () => {
    try {
      await residentesService.cambiarHabitacion(residenteId, {
        nuevaHabitacionId: habitacionSeleccionada,
        motivo,
        personalId: user.PersonalID
      });
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al cambiar habitación");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Cambiar Habitación</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal">
          <InputLabel id="habitacion-label">Nueva Habitación</InputLabel>
          <Select
            labelId="habitacion-label"
            value={habitacionSeleccionada}
            onChange={(e) => setHabitacionSeleccionada(e.target.value)}
            required
          >
            {habitaciones.map((h) => (
              <MenuItem key={h.HabitacionID} value={h.HabitacionID}>
                Habitación {h.Numero} (Planta {h.Planta})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          label="Motivo del Cambio"
          fullWidth
          margin="normal"
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CambioHabitacionModal;
