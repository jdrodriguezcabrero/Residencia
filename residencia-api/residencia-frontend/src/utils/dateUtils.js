import { Box, Typography, Button, Grid, Paper, Divider, Avatar, Chip, TextField, Card, CardContent, CardActions, Alert, CircularProgress, Container, CssBaseline, AppBar, Toolbar, IconButton, Menu, MenuItem, List, ListItem, ListItemIcon, ListItemText, Drawer, ListItemAvatar, FormControl, InputLabel, Select, FormHelperText, Stack, LinearProgress } from '@mui/material';
// src/utils/dateUtils.js

/**
 * Formatea una fecha en formato legible en español
 * @param {string|Date} date - La fecha a formatear
 * @param {boolean} includeTime - Si se debe incluir la hora en el formato
 * @returns {string} Fecha formateada
 */
export const formatDate = (date, includeTime = false) => {
    if (!date) return 'N/A';
    
    try {
      const d = new Date(date);
      
      // Verificar si la fecha es válida
      if (isNaN(d.getTime())) {
        return 'Fecha inválida';
      }
      
      // Opciones de formato
      const options = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      };
      
      // Añadir la hora si se solicita
      if (includeTime) {
        options.hour = '2-digit';
        options.minute = '2-digit';
      }
      
      return d.toLocaleDateString('es-ES', options);
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha inválida';
    }
  };
  
  /**
   * Calcula la edad a partir de una fecha de nacimiento
   * @param {string|Date} fechaNacimiento - Fecha de nacimiento
   * @returns {number|string} Edad calculada o mensaje de error
   */
  export const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return 'N/A';
    
    try {
      const hoy = new Date();
      const fechaNac = new Date(fechaNacimiento);
      
      // Verificar si la fecha es válida
      if (isNaN(fechaNac.getTime())) {
        return 'N/A';
      }
      
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }
      
      return edad;
    } catch (error) {
      console.error('Error al calcular edad:', error);
      return 'N/A';
    }
  };

  export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};
