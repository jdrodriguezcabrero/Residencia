// src/routes/auth.routes.js (versión mínima)
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
// Comentamos temporalmente el middleware de verificación
// const { verifyToken } = require('../middleware/auth.middleware');

// Rutas públicas
router.post('/login', authController.login);
router.post('/register', authController.register);

// Comentamos temporalmente las rutas que causan problema
// router.get('/me', verifyToken, authController.me);
// router.post('/change-password', verifyToken, authController.changePassword);

module.exports = router;