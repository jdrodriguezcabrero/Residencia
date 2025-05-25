const express = require('express');
const router = express.Router();
const personalController = require('../controllers/personal.controller');


const {
  getAllPersonal,
  getPersonalById,
  createPersonal,
  updatePersonal,
  deletePersonal
} = require('../controllers/personal.controller');

router.get('/', getAllPersonal);
router.get('/:id', getPersonalById);
router.post('/', createPersonal);
router.put('/:id', updatePersonal);
router.delete('/:id', deletePersonal);
router.put('/:id/estado', personalController.updateEstadoPersonal);


module.exports = router;
