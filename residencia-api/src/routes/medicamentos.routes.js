const express = require('express');
const router = express.Router();
const medicamentosController = require('../controllers/medicamentos.controller');

router.get('/', medicamentosController.getMedicamentos);
router.get('/:id', medicamentosController.getMedicamentoById);
router.post('/', medicamentosController.createMedicamento);
router.put('/:id', medicamentosController.updateMedicamento);
router.delete('/:id', medicamentosController.deleteMedicamento);

module.exports = router;
