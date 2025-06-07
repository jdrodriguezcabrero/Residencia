const express = require('express');
const router = express.Router();

const {
  getTratamientos,
  getTratamientoById,
  createTratamiento,
  updateTratamiento,
  deleteTratamiento,
  updateEstadoTratamiento
} = require('../controllers/tratamientos.controller');

router.get('/', getTratamientos);
router.get('/:id', getTratamientoById);
router.post('/', createTratamiento);
router.put('/:id', updateTratamiento);
router.delete('/:id', deleteTratamiento);
router.put('/:id/estado', updateEstadoTratamiento);


module.exports = router;
