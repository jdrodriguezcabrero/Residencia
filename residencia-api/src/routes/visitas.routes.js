const express = require('express');
const router = express.Router();
const visitasController = require('../controllers/visitas.controller');

router.get('/', visitasController.getVisitas);
router.get('/:id', visitasController.getVisitaById);
router.post('/', visitasController.createVisita);
router.put('/:id', visitasController.updateVisita);
router.delete('/:id', visitasController.deleteVisita);

module.exports = router;
