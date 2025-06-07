const express = require('express');
const router = express.Router();
const {
  getAllIncidencias,
  getIncidenciaById,
  createIncidencia,
  updateIncidencia,
  deleteIncidencia
} = require('../controllers/incidencias.controller');

router.get('/', getAllIncidencias);
router.get('/:id', getIncidenciaById);
router.post('/', createIncidencia);
router.put('/:id', updateIncidencia);
router.delete('/:id', deleteIncidencia);

module.exports = router;
