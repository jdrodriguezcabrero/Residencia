// src/routes/actividades.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllActividades,
  getActividadById,
  createActividad,
  updateActividad,
  deleteActividad
} = require('../controllers/actividades.controller');

router.get('/', getAllActividades);
router.get('/:id', getActividadById);
router.post('/', createActividad);
router.put('/:id', updateActividad);
router.delete('/:id', deleteActividad);

module.exports = router;
