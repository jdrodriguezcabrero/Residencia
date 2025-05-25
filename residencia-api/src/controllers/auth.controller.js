// src/controllers/auth.controller.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { poolPromise, sql } = require('../config/db');
require('dotenv').config();

// src/controllers/auth.controller.js - reemplaza la función login completa
exports.login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({
      error: true,
      message: 'Se requiere nombre de usuario y contraseña'
    });
  }

  try {
    const pool = await poolPromise;
    
    // Intentar autenticar directamente con una sola consulta
    const result = await pool.request()
      .input('nombre', sql.VarChar(50), username)
      .input('password', sql.VarChar(255), password)
      .query(`
        SELECT u.UsuarioID, u.Nombre, u.Rol, u.PersonalID,
               p.Nombre as NombrePersonal, p.Apellidos as ApellidosPersonal
        FROM Usuarios u
        LEFT JOIN Personal p ON u.PersonalID = p.PersonalID
        WHERE u.Nombre = @nombre 
          AND u.Contraseña = HASHBYTES('SHA2_256', @password)
          AND u.Activo = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({
        error: true,
        message: 'Credenciales inválidas'
      });
    }

    const user = result.recordset[0];

    // Actualizar último acceso
    await pool.request()
      .input('usuarioId', sql.Int, user.UsuarioID)
      .query('UPDATE Usuarios SET UltimoAcceso = GETDATE() WHERE UsuarioID = @usuarioId');

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.UsuarioID,
        username: user.Nombre,
        rol: user.Rol,
        personalId: user.PersonalID,
        nombreCompleto: `${user.NombrePersonal || ''} ${user.ApellidosPersonal || ''}`.trim()
      },
      process.env.JWT_SECRET || 'residencia_secret_key_2023',
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Enviar respuesta
    return res.status(200).json({
      error: false,
      message: 'Login exitoso',
      token, // token JWT generado
      usuario: {
        id: user.UsuarioID,
        username: user.Nombre,
        rol: user.Rol,
        personalId: user.PersonalID,
        nombreCompleto: `${user.NombrePersonal || ''} ${user.ApellidosPersonal || ''}`.trim()
      }
    });
    

  } catch (err) {
    console.error('Error específico en login:', err);
    
    // Proporcionar más detalles sobre el error
    let errorDetails = 'Error desconocido';
    if (err.message) {
      errorDetails = err.message;
    }
    if (err.stack) {
      console.error('Stack de error:', err.stack);
    }
    
    res.status(500).json({
      error: true,
      message: 'Error al intentar iniciar sesión',
      details: errorDetails
    });
  }
};
// Añadir a auth.controller.js si aún no está implementada
exports.me = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pool = await poolPromise;
    const result = await pool.request()
      .input('usuarioId', sql.Int, userId)
      .query(`
        SELECT u.UsuarioID, u.Nombre, u.Rol, u.PersonalID, 
               p.Nombre as NombrePersonal, p.Apellidos as ApellidosPersonal
        FROM Usuarios u
        LEFT JOIN Personal p ON u.PersonalID = p.PersonalID
        WHERE u.UsuarioID = @usuarioId AND u.Activo = 1
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }

    const user = result.recordset[0];

    res.status(200).json({
      error: false,
      data: {
        id: user.UsuarioID,
        username: user.Nombre,
        rol: user.Rol,
        personalId: user.PersonalID,
        nombreCompleto: `${user.NombrePersonal || ''} ${user.ApellidosPersonal || ''}`.trim()
      }
    });

  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener información del usuario',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};
// Cambiar contraseña
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      error: true,
      message: 'Se requieren contraseña actual y nueva contraseña'
    });
  }

  try {
    const pool = await poolPromise;
    
    // Verificar contraseña actual
    const userResult = await pool.request()
      .input('usuarioId', sql.Int, userId)
      .query('SELECT Contraseña FROM Usuarios WHERE UsuarioID = @usuarioId');

    if (userResult.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }

    // Verificar la contraseña actual usando el mismo enfoque que en login
    const currentPasswordHash = await pool.request()
      .input('password', sql.VarChar(255), currentPassword)
      .query('SELECT HASHBYTES(\'SHA2_256\', @password) as hash');
    
    const storedHashBuffer = userResult.recordset[0].Contraseña;
    const inputHashBuffer = currentPasswordHash.recordset[0].hash;
    
    const isPasswordValid = Buffer.compare(storedHashBuffer, inputHashBuffer) === 0;

    if (!isPasswordValid) {
      return res.status(401).json({
        error: true,
        message: 'Contraseña actual incorrecta'
      });
    }

    // Actualizar con la nueva contraseña
    await pool.request()
      .input('usuarioId', sql.Int, userId)
      .input('nuevaContraseña', sql.VarChar(255), newPassword)
      .query('UPDATE Usuarios SET Contraseña = HASHBYTES(\'SHA2_256\', @nuevaContraseña) WHERE UsuarioID = @usuarioId');

    res.status(200).json({
      error: false,
      message: 'Contraseña actualizada correctamente'
    });

  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    res.status(500).json({
      error: true,
      message: 'Error al cambiar la contraseña',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Registrar nuevo usuario
exports.register = async (req, res) => {
  const { nombre, password, rol, personalId } = req.body;

  try {
    // Validar datos
    if (!nombre || !password || !rol) {
      return res.status(400).json({
        error: true,
        message: 'Se requieren nombre de usuario, contraseña y rol'
      });
    }

    // Verificar que el usuario no exista
    const pool = await poolPromise;
    const checkUser = await pool.request()
      .input('nombre', sql.VarChar(50), nombre)
      .query('SELECT COUNT(*) as count FROM Usuarios WHERE Nombre = @nombre');
    
    if (checkUser.recordset[0].count > 0) {
      return res.status(400).json({
        error: true,
        message: 'El nombre de usuario ya existe'
      });
    }

    // Verificar personalId si está proporcionado
    if (personalId) {
      const checkPersonal = await pool.request()
        .input('personalId', sql.Int, personalId)
        .query('SELECT COUNT(*) as count FROM Personal WHERE PersonalID = @personalId');
      
      if (checkPersonal.recordset[0].count === 0) {
        return res.status(400).json({
          error: true,
          message: 'El ID de personal no existe'
        });
      }
    }

    // Insertar usuario
    await pool.request()
      .input('nombre', sql.VarChar(50), nombre)
      .input('password', sql.VarChar(255), password)
      .input('rol', sql.VarChar(20), rol)
      .input('personalId', sql.Int, personalId || null)
      .query(`
        INSERT INTO Usuarios (Nombre, Contraseña, PersonalID, Rol, UltimoAcceso, Activo)
        VALUES (@nombre, HASHBYTES('SHA2_256', @password), @personalId, @rol, GETDATE(), 1)
      `);

    res.status(201).json({
      error: false,
      message: 'Usuario registrado correctamente'
    });
  } catch (err) {
    console.error('Error al registrar usuario:', err);
    res.status(500).json({
      error: true,
      message: 'Error al registrar usuario',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};