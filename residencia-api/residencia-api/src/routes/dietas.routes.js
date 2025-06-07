const express = require('express');
const router = express.Router();
const dietasController = require('../controllers/dietas.controller');

router.get('/', dietasController.getAllDietas);
router.get('/:id', dietasController.getDietaById);
router.post('/', dietasController.createDieta);
router.put('/:id', dietasController.updateDieta);
router.delete('/:id', dietasController.deleteDieta);
router.put('/:id/estado', dietasController.updateEstadoDieta);

module.exports = router;
