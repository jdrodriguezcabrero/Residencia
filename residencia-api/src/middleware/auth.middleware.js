// src/middleware/auth.middleware.js (versión simplificada)
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware para verificar el token JWT (versión simplificada)
const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];

  // Modo desarrollo - permite solicitudes sin token para pruebas
  if (process.env.NODE_ENV === 'development') {
    console.log('ADVERTENCIA: Permitiendo solicitud sin verificación de token en modo desarrollo');
    req.user = { id: 1, username: 'admin', rol: 'Administrador' }; // Usuario ficticio para desarrollo
    return next();
  }

  if (!token) {
    console.log('No se proporcionó token de acceso');
    return res.status(403).json({
      error: true,
      message: 'No se proporcionó token de acceso'
    });
  }

  try {
    // Limpiar el token si viene con "Bearer "
    const tokenValue = token.startsWith('Bearer ') ? token.slice(7) : token;
    
    // Verificar el token con un secret predeterminado si el de .env no está disponible
    const secret = process.env.JWT_SECRET || 'residencia_secret_key_2023';
    const decoded = jwt.verify(tokenValue, secret);
    
    req.user = decoded;
    next();
  } catch (error) {
    console.log('Error al verificar token:', error.message);
    
    // Modo desarrollo alternativo - permite continuar con error de token
    if (process.env.NODE_ENV === 'development') {
      console.log('ADVERTENCIA: Permitiendo solicitud con token inválido en modo desarrollo');
      req.user = { id: 1, username: 'admin', rol: 'Administrador' }; // Usuario ficticio para desarrollo
      return next();
    }
    
    return res.status(401).json({
      error: true,
      message: 'Token inválido o expirado: ' + error.message
    });
  }
};

// Middleware para verificar roles específicos (versión simplificada)
const checkRole = (roles) => {
  return (req, res, next) => {
    // Modo desarrollo - permite cualquier rol
    if (process.env.NODE_ENV === 'development') {
      console.log('ADVERTENCIA: Omitiendo verificación de rol en modo desarrollo');
      return next();
    }
    
    if (!req.user) {
      return res.status(403).json({
        error: true,
        message: 'No autenticado'
      });
    }

    const hasRole = roles.includes(req.user.rol);
    if (!hasRole) {
      return res.status(403).json({
        error: true,
        message: 'No tiene permisos para acceder a este recurso'
      });
    }

    next();
  };
};

module.exports = {
  verifyToken,
  checkRole
};