const { poolPromise, sql } = require('../config/db');

// Obtener todas las habitaciones
exports.getAllHabitaciones = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT *
      FROM Habitaciones
      ORDER BY Planta, Numero
    `);

    res.status(200).json({
      error: false,
      data: result.recordset
    });
  } catch (err) {
    console.error('Error al obtener habitaciones:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener la lista de habitaciones',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Obtener habitaciones disponibles
exports.getDisponibles = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT *
      FROM Habitaciones
      WHERE Estado = 'Disponible'
      ORDER BY Planta, Numero
    `);

    res.status(200).json({
      error: false,
      data: result.recordset
    });
  } catch (err) {
    console.error('Error al obtener habitaciones disponibles:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener la lista de habitaciones disponibles',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

const getResidentesPorHabitacion = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('NumeroHabitacion', sql.Int, id)
      .query(`
        SELECT ResidenteID, DNI, Nombre, Apellidos, FechaIngreso
        FROM Residentes
        WHERE NumeroHabitacion = @NumeroHabitacion AND Activo = 1
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener residentes' });
  }
};

const getHistorialCambios = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('HabitacionID', sql.Int, id)
      .query(`
        SELECT ch.FechaCambio, ch.MotivoDelCambio, r.Nombre AS NombreResidente, r.Apellidos,
               ha.Numero AS HabitacionAnterior, hn.Numero AS HabitacionNueva, p.Nombre AS Personal
        FROM CambiosHabitacion ch
        JOIN Residentes r ON ch.ResidenteID = r.ResidenteID
        LEFT JOIN Habitaciones ha ON ch.HabitacionAnteriorID = ha.HabitacionID
        LEFT JOIN Habitaciones hn ON ch.HabitacionNuevaID = hn.HabitacionID
        LEFT JOIN Personal p ON ch.PersonalID = p.PersonalID
        WHERE ch.HabitacionAnteriorID = @HabitacionID OR ch.HabitacionNuevaID = @HabitacionID
        ORDER BY ch.FechaCambio DESC
      `);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener historial de cambios' });
  }
};


// Obtener habitación por ID
exports.getHabitacionById = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT *
        FROM Habitaciones
        WHERE HabitacionID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Habitación no encontrada'
      });
    }

    res.status(200).json({
      error: false,
      data: result.recordset[0]
    });
  } catch (err) {
    console.error('Error al obtener habitación:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener los datos de la habitación',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Crear nueva habitación
exports.createHabitacion = async (req, res) => {
  const { 
    numero, tipo, planta, estado, observaciones
  } = req.body;

  try {
    // Validar datos obligatorios
    if (!numero || !tipo || !planta) {
      return res.status(400).json({
        error: true,
        message: 'Faltan campos obligatorios: número, tipo y planta son requeridos'
      });
    }

    // Validar que el número no exista
    const pool = await poolPromise;
    const checkNumero = await pool.request()
      .input('numero', sql.Int, numero)
      .query('SELECT COUNT(*) as count FROM Habitaciones WHERE Numero = @numero');
    
    if (checkNumero.recordset[0].count > 0) {
      return res.status(400).json({
        error: true,
        message: 'Ya existe una habitación con ese número'
      });
    }

    // Insertar habitación
    const result = await pool.request()
      .input('numero', sql.Int, numero)
      .input('tipo', sql.VarChar(20), tipo)
      .input('planta', sql.Int, planta)
      .input('estado', sql.VarChar(20), estado || 'Disponible')
      .input('observaciones', sql.NVarChar(200), observaciones)
      .query(`
        INSERT INTO Habitaciones (
          Numero, Tipo, Planta, Estado, Observaciones
        )
        VALUES (
          @numero, @tipo, @planta, @estado, @observaciones
        );
        
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const nuevaHabitacionId = result.recordset[0].id;

    res.status(201).json({
      error: false,
      message: 'Habitación creada correctamente',
      data: { id: nuevaHabitacionId }
    });
  } catch (err) {
    console.error('Error al crear habitación:', err);
    res.status(500).json({
      error: true,
      message: 'Error al crear la habitación',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Actualizar habitación
exports.updateHabitacion = async (req, res) => {
  const { id } = req.params;
  const { 
    numero, tipo, planta, estado, observaciones
  } = req.body;

  try {
    // Validar que la habitación exista
    const pool = await poolPromise;
    const checkHabitacion = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT Numero FROM Habitaciones WHERE HabitacionID = @id');
    
    if (checkHabitacion.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Habitación no encontrada'
      });
    }

    const numeroActual = checkHabitacion.recordset[0].Numero;

    // Validar que el nuevo número no exista (si se está cambiando)
    if (numero && numero !== numeroActual) {
      const checkNumero = await pool.request()
        .input('numero', sql.Int, numero)
        .query('SELECT COUNT(*) as count FROM Habitaciones WHERE Numero = @numero');
      
      if (checkNumero.recordset[0].count > 0) {
        return res.status(400).json({
          error: true,
          message: 'Ya existe otra habitación con ese número'
        });
      }
    }

    // Validar que no se cambie el estado a una habitación ocupada
    if (estado && estado !== 'Ocupada') {
      const checkOcupada = await pool.request()
        .input('numero', sql.Int, numeroActual)
        .query(`
          SELECT COUNT(*) as count 
          FROM Residentes 
          WHERE NumeroHabitacion = @numero AND Activo = 1
        `);
      
      if (checkOcupada.recordset[0].count > 0) {
        return res.status(400).json({
          error: true,
          message: 'No se puede cambiar el estado de una habitación ocupada'
        });
      }
    }

    // Actualizar habitación
    const updateResult = await pool.request()
      .input('id', sql.Int, id)
      .input('numero', sql.Int, numero)
      .input('tipo', sql.VarChar(20), tipo)
      .input('planta', sql.Int, planta)
      .input('estado', sql.VarChar(20), estado)
      .input('observaciones', sql.NVarChar(200), observaciones)
      .query(`
        UPDATE Habitaciones
        SET Numero = ISNULL(@numero, Numero),
            Tipo = ISNULL(@tipo, Tipo),
            Planta = ISNULL(@planta, Planta),
            Estado = ISNULL(@estado, Estado),
            Observaciones = ISNULL(@observaciones, Observaciones)
        WHERE HabitacionID = @id
      `);

    res.status(200).json({
      error: false,
      message: 'Habitación actualizada correctamente'
    });
  } catch (err) {
    console.error('Error al actualizar habitación:', err);
    res.status(500).json({
      error: true,
      message: 'Error al actualizar la habitación',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};




// Eliminar habitación
exports.deleteHabitacion = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    
    // Verificar que exista la habitación
    const checkHabitacion = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT h.Numero, h.Estado, 
          (SELECT COUNT(*) FROM Residentes r WHERE r.NumeroHabitacion = h.Numero AND r.Activo = 1) as Ocupada
        FROM Habitaciones h
        WHERE h.HabitacionID = @id
      `);
    
    if (checkHabitacion.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Habitación no encontrada'
      });
    }

    // Verificar que no esté ocupada
    if (checkHabitacion.recordset[0].Ocupada > 0) {
      return res.status(400).json({
        error: true,
        message: 'No se puede eliminar una habitación ocupada'
      });
    }

    // Eliminar habitación
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Habitaciones WHERE HabitacionID = @id');

    res.status(200).json({
      error: false,
      message: 'Habitación eliminada correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar habitación:', err);
    res.status(500).json({
      error: true,
      message: 'Error al eliminar la habitación',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

exports.getResidentesPorHabitacion = getResidentesPorHabitacion;
exports.getHistorialCambios = getHistorialCambios;
