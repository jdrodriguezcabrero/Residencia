const express = require('express');
const router = express.Router();
const residentesController = require('../controllers/residentes.controller');
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Rutas para residentes
router.get('/', residentesController.getAllResidentes);
router.get('/:id/detalles-completos', residentesController.getDetallesCompletosResidente);
router.get('/:id', residentesController.getResidenteById);


// Rutas protegidas por rol
router.post('/', checkRole(['Administrador', 'Medico']), residentesController.createResidente);
router.put('/:id', checkRole(['Administrador', 'Medico']), residentesController.updateResidente);
router.delete('/:id', checkRole(['Administrador']), residentesController.deleteResidente);
router.put('/:id/cambiar-habitacion', checkRole(['Administrador']), residentesController.cambiarHabitacion);
router.put('/:id/estado', checkRole(['Administrador']), residentesController.updateEstadoResidente);






module.exports = router;