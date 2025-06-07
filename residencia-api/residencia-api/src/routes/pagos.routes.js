// src/routes/pagos.routes.js
const express = require('express');
const router = express.Router();
const { verifyToken, checkRole } = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(verifyToken);

// Ruta temporal para prueba
router.get('/', checkRole(['Administrador']), (req, res) => {
  res.json({
    error: false,
    message: 'Rutas de pagos funcionando correctamente',
    data: []
  });
});

module.exports = router;