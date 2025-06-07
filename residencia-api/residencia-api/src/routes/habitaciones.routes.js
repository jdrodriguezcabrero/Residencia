const express = require('express');
const router = express.Router();
const habitacionesController = require('../controllers/habitaciones.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para habitaciones
router.get('/', habitacionesController.getAllHabitaciones);
router.get('/disponibles', habitacionesController.getDisponibles);
router.get('/:id', habitacionesController.getHabitacionById);
router.get('/:id/residentes', habitacionesController.getResidentesPorHabitacion);
router.get('/:id/historial-cambios', habitacionesController.getHistorialCambios);



// Rutas protegidas por rol
router.post('/', checkRole(['Administrador']), habitacionesController.createHabitacion);
router.put('/:id', checkRole(['Administrador']), habitacionesController.updateHabitacion);
router.delete('/:id', checkRole(['Administrador']), habitacionesController.deleteHabitacion);

module.exports = router;