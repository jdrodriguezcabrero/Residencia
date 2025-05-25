const { poolPromise, sql } = require('../config/db');

// Obtener todos los residentes
exports.getAllResidentes = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT r.ResidenteID, r.DNI, r.Nombre, r.Apellidos, r.FechaNacimiento, 
             r.Genero, r.FechaIngreso, r.NumeroHabitacion, r.GrupoSanguineo,
             r.ContactoEmergenciaNombre, r.ContactoEmergenciaTelefono, 
             r.ObservacionesMedicas, r.Activo,r.Email,
             h.Numero as NumeroHabitacion, h.Tipo as TipoHabitacion, h.Planta
      FROM Residentes r
      LEFT JOIN Habitaciones h ON r.NumeroHabitacion = h.Numero
      ORDER BY r.Apellidos, r.Nombre
    `);

    res.status(200).json({
      error: false,
      data: result.recordset
    });
  } catch (err) {
    console.error('Error al obtener residentes:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener la lista de residentes',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};



// Obtener residente por ID
exports.getResidenteById = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT r.ResidenteID, r.DNI, r.Nombre, r.Apellidos, r.FechaNacimiento, 
               r.Genero, r.FechaIngreso, r.NumeroHabitacion, r.GrupoSanguineo,
               r.ContactoEmergenciaNombre, r.ContactoEmergenciaTelefono, 
               r.ObservacionesMedicas, r.Activo,r.Email,
               h.Numero as NumeroHabitacion, h.Tipo as TipoHabitacion, h.Planta
        FROM Residentes r
        LEFT JOIN Habitaciones h ON r.NumeroHabitacion = h.Numero
        WHERE r.ResidenteID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Residente no encontrado'
      });
    }

    res.status(200).json({
      error: false,
      data: result.recordset[0]
    });
  } catch (err) {
    console.error('Error al obtener residente:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener los datos del residente',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Crear nuevo residente
exports.createResidente = async (req, res) => {
  const { 
    dni, nombre, apellidos, fechaNacimiento, genero, fechaIngreso,
    numeroHabitacion, grupoSanguineo, contactoEmergenciaNombre,
    contactoEmergenciaTelefono, observacionesMedicas, email
  } = req.body;

  try {
    // Validar datos obligatorios
    if (!dni || !nombre || !apellidos || !fechaNacimiento || !genero || !fechaIngreso || !email) {
      return res.status(400).json({
        error: true,
        message: 'Faltan campos obligatorios'
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({
    error: true,
    message: 'El formato del email no es válido'
  });
}


    // Validar que el DNI no exista
    const pool = await poolPromise;
    const checkDni = await pool.request()
      .input('dni', sql.VarChar(15), dni)
      .query('SELECT COUNT(*) as count FROM Residentes WHERE DNI = @dni');
    
    if (checkDni.recordset[0].count > 0) {
      return res.status(400).json({
        error: true,
        message: 'Ya existe un residente con ese DNI'
      });
    }

    // Validar que la habitación exista y esté disponible
    if (numeroHabitacion) {
      const checkHabitacion = await pool.request()
        .input('numero', sql.Int, numeroHabitacion)
        .query('SELECT Estado FROM Habitaciones WHERE Numero = @numero');
      
      if (checkHabitacion.recordset.length === 0) {
        return res.status(400).json({
          error: true,
          message: 'La habitación especificada no existe'
        });
      }
      
      if (checkHabitacion.recordset[0].Estado !== 'Disponible') {
        return res.status(400).json({
          error: true,
          message: 'La habitación especificada no está disponible'
        });
      }
    }

    // Insertar residente
    const result = await pool.request()
      .input('dni', sql.VarChar(15), dni)
      .input('nombre', sql.NVarChar(50), nombre)
      .input('apellidos', sql.NVarChar(100), apellidos)
      .input('fechaNacimiento', sql.Date, new Date(fechaNacimiento))
      .input('genero', sql.Char(1), genero)
      .input('email', sql.NVarChar(100), email)
      .input('fechaIngreso', sql.Date, new Date(fechaIngreso))
      .input('numeroHabitacion', sql.Int, numeroHabitacion)
      .input('grupoSanguineo', sql.VarChar(5), grupoSanguineo)
      .input('contactoEmergenciaNombre', sql.NVarChar(100), contactoEmergenciaNombre)
      .input('contactoEmergenciaTelefono', sql.VarChar(15), contactoEmergenciaTelefono)
      .input('observacionesMedicas', sql.NVarChar(sql.MAX), observacionesMedicas)
      .query(`
        INSERT INTO Residentes (
          DNI, Nombre, Apellidos, FechaNacimiento, Genero, FechaIngreso,
          NumeroHabitacion, GrupoSanguineo, ContactoEmergenciaNombre,
          ContactoEmergenciaTelefono, ObservacionesMedicas, Activo, Email
        )
        VALUES (
          @dni, @nombre, @apellidos, @fechaNacimiento, @genero, @fechaIngreso,
          @numeroHabitacion, @grupoSanguineo, @contactoEmergenciaNombre,
          @contactoEmergenciaTelefono, @observacionesMedicas, 1, @email
        );
        
        SELECT SCOPE_IDENTITY() AS id;
      `);

    const nuevoResidenteId = result.recordset[0].id;

    // Actualizar estado de habitación si se asignó
    if (numeroHabitacion) {
      await pool.request()
        .input('numero', sql.Int, numeroHabitacion)
        .query('UPDATE Habitaciones SET Estado = \'Ocupada\' WHERE Numero = @numero');
    }

    res.status(201).json({
      error: false,
      message: 'Residente creado correctamente',
      data: { id: nuevoResidenteId }
    });
  } catch (err) {
    console.error('Error al crear residente:', err);
    res.status(500).json({
      error: true,
      message: 'Error al crear el residente',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Actualizar residente
exports.updateResidente = async (req, res) => {
  const { id } = req.params;
  const { 
    dni, nombre, apellidos, fechaNacimiento, genero, fechaIngreso,
    numeroHabitacion, grupoSanguineo, contactoEmergenciaNombre,
    contactoEmergenciaTelefono, observacionesMedicas, email
  } = req.body;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  return res.status(400).json({
    error: true,
    message: 'El formato del email no es válido'
  });
}


  try {
    // Validar que el residente exista
    const pool = await poolPromise;
    const checkResidente = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT NumeroHabitacion FROM Residentes WHERE ResidenteID = @id');
    
    if (checkResidente.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Residente no encontrado'
      });
    }

    const habitacionAnterior = checkResidente.recordset[0].NumeroHabitacion;

    // Validar que el DNI no esté en uso por otro residente
    if (dni) {
      const checkDni = await pool.request()
        .input('dni', sql.VarChar(15), dni)
        .input('id', sql.Int, id)
        .query('SELECT COUNT(*) as count FROM Residentes WHERE DNI = @dni AND ResidenteID != @id');
      
      if (checkDni.recordset[0].count > 0) {
        return res.status(400).json({
          error: true,
          message: 'Ya existe otro residente con ese DNI'
        });
      }
    }

    // Validar que la habitación nueva exista y esté disponible
    if (numeroHabitacion && numeroHabitacion !== habitacionAnterior) {
      const checkHabitacion = await pool.request()
        .input('numero', sql.Int, numeroHabitacion)
        .query('SELECT Estado, HabitacionID FROM Habitaciones WHERE Numero = @numero');
      
      if (checkHabitacion.recordset.length === 0) {
        return res.status(400).json({
          error: true,
          message: 'La habitación especificada no existe'
        });
      }
      
      if (checkHabitacion.recordset[0].Estado !== 'Disponible') {
        return res.status(400).json({
          error: true,
          message: 'La habitación especificada no está disponible'
        });
      }

      // Preparar para registrar el cambio de habitación
      const habitacionAnteriorID = await pool.request()
        .input('numero', sql.Int, habitacionAnterior)
        .query('SELECT HabitacionID FROM Habitaciones WHERE Numero = @numero');
      
      const nuevaHabitacionID = checkHabitacion.recordset[0].HabitacionID;

      // Registrar el cambio de habitación después de actualizar el residente
      if (habitacionAnterior && habitacionAnteriorID.recordset.length > 0) {
        await pool.request()
          .input('residenteId', sql.Int, id)
          .input('habitacionAnteriorId', sql.Int, habitacionAnteriorID.recordset[0].HabitacionID)
          .input('habitacionNuevaId', sql.Int, nuevaHabitacionID)
          .input('personalId', sql.Int, req.user.personalId)
          .query(`
            INSERT INTO CambiosHabitacion (
              ResidenteID, HabitacionAnteriorID, HabitacionNuevaID, 
              FechaCambio, MotivoDelCambio, PersonalID
            )
            VALUES (
              @residenteId, @habitacionAnteriorId, @habitacionNuevaId,
              GETDATE(), 'Cambio de habitación', @personalId
            );
          `);
      }
    }

    // Actualizar residente
    const updateResult = await pool.request()
      .input('id', sql.Int, id)
      .input('dni', sql.VarChar(15), dni)
      .input('nombre', sql.NVarChar(50), nombre)
      .input('apellidos', sql.NVarChar(100), apellidos)
      .input('fechaNacimiento', sql.Date, fechaNacimiento ? new Date(fechaNacimiento) : undefined)
      .input('genero', sql.Char(1), genero)
      .input('email', sql.NVarChar(100), email)
      .input('fechaIngreso', sql.Date, fechaIngreso ? new Date(fechaIngreso) : undefined)
      .input('numeroHabitacion', sql.Int, numeroHabitacion)
      .input('grupoSanguineo', sql.VarChar(5), grupoSanguineo)
      .input('contactoEmergenciaNombre', sql.NVarChar(100), contactoEmergenciaNombre)
      .input('contactoEmergenciaTelefono', sql.VarChar(15), contactoEmergenciaTelefono)
      .input('observacionesMedicas', sql.NVarChar(sql.MAX), observacionesMedicas)
      .query(`
        UPDATE Residentes
        SET DNI = ISNULL(@dni, DNI),
            Nombre = ISNULL(@nombre, Nombre),
            Apellidos = ISNULL(@apellidos, Apellidos),
            FechaNacimiento = ISNULL(@fechaNacimiento, FechaNacimiento),
            Genero = ISNULL(@genero, Genero),
            Email = ISNULL(@email, Email),
            FechaIngreso = ISNULL(@fechaIngreso, FechaIngreso),
            NumeroHabitacion = ISNULL(@numeroHabitacion, NumeroHabitacion),
            GrupoSanguineo = ISNULL(@grupoSanguineo, GrupoSanguineo),
            ContactoEmergenciaNombre = ISNULL(@contactoEmergenciaNombre, ContactoEmergenciaNombre),
            ContactoEmergenciaTelefono = ISNULL(@contactoEmergenciaTelefono, ContactoEmergenciaTelefono),
            ObservacionesMedicas = ISNULL(@observacionesMedicas, ObservacionesMedicas)
        WHERE ResidenteID = @id
      `);

    // Actualizar estado de habitaciones
    if (numeroHabitacion && numeroHabitacion !== habitacionAnterior) {
      // Liberar habitación anterior
      if (habitacionAnterior) {
        await pool.request()
          .input('numero', sql.Int, habitacionAnterior)
          .query('UPDATE Habitaciones SET Estado = \'Disponible\' WHERE Numero = @numero');
      }

      // Ocupar nueva habitación
      await pool.request()
        .input('numero', sql.Int, numeroHabitacion)
        .query('UPDATE Habitaciones SET Estado = \'Ocupada\' WHERE Numero = @numero');
    }

    res.status(200).json({
      error: false,
      message: 'Residente actualizado correctamente'
    });
  } catch (err) {
    console.error('Error al actualizar residente:', err);
    res.status(500).json({
      error: true,
      message: 'Error al actualizar el residente',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

// Eliminar residente (desactivar)
exports.deleteResidente = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    
    // Verificar que exista el residente
    const checkResidente = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT NumeroHabitacion FROM Residentes WHERE ResidenteID = @id AND Activo = 1');
    
    if (checkResidente.recordset.length === 0) {
      return res.status(404).json({
        error: true,
        message: 'Residente no encontrado o ya está desactivado'
      });
    }

    const habitacion = checkResidente.recordset[0].NumeroHabitacion;

    // Desactivar residente
    await pool.request()
      .input('id', sql.Int, id)
      .query('UPDATE Residentes SET Activo = 0 WHERE ResidenteID = @id');

    // Liberar habitación
    if (habitacion) {
      await pool.request()
        .input('numero', sql.Int, habitacion)
        .query('UPDATE Habitaciones SET Estado = \'Disponible\' WHERE Numero = @numero');
    }

    res.status(200).json({
      error: false,
      message: 'Residente desactivado correctamente'
    });
  } catch (err) {
    console.error('Error al eliminar residente:', err);
    res.status(500).json({
      error: true,
      message: 'Error al desactivar el residente',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

exports.cambiarHabitacion = async (req, res) => {
  const { id } = req.params;
  const { nuevaHabitacionId, motivo, personalId } = req.body;

  try {
    const pool = await poolPromise;

    // Obtener habitación actual del residente
    const actual = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT NumeroHabitacion FROM Residentes WHERE ResidenteID = @id`);

    const anterior = await pool.request()
      .input('numero', sql.Int, actual.recordset[0].NumeroHabitacion)
      .query(`SELECT HabitacionID FROM Habitaciones WHERE Numero = @numero`);

    // Registrar cambio
    await pool.request()
      .input('ResidenteID', sql.Int, id)
      .input('HabitacionAnteriorID', sql.Int, anterior.recordset[0].HabitacionID)
      .input('HabitacionNuevaID', sql.Int, nuevaHabitacionId)
      .input('FechaCambio', sql.DateTime, new Date())
      .input('MotivoDelCambio', sql.NVarChar, motivo)
      .input('PersonalID', sql.Int, personalId)
      .query(`
        INSERT INTO CambiosHabitacion 
        (ResidenteID, HabitacionAnteriorID, HabitacionNuevaID, FechaCambio, MotivoDelCambio, PersonalID)
        VALUES (@ResidenteID, @HabitacionAnteriorID, @HabitacionNuevaID, @FechaCambio, @MotivoDelCambio, @PersonalID)
      `);

    // Actualizar habitación actual del residente
    const nueva = await pool.request()
      .input('HabitacionID', sql.Int, nuevaHabitacionId)
      .query(`SELECT Numero FROM Habitaciones WHERE HabitacionID = @HabitacionID`);

    await pool.request()
      .input('NumeroHabitacion', sql.Int, nueva.recordset[0].Numero)
      .input('ResidenteID', sql.Int, id)
      .query('UPDATE Residentes SET NumeroHabitacion = @NumeroHabitacion WHERE ResidenteID = @ResidenteID');

      // Verificar si la habitación anterior ya no tiene residentes
const residentesRestantes = await pool.request()
.input('numero', sql.Int, actual.recordset[0].NumeroHabitacion)
.query(`
  SELECT COUNT(*) as count 
  FROM Residentes 
  WHERE NumeroHabitacion = @numero AND Activo = 1
`);

// Si no quedan residentes, cambiar estado a 'Disponible'
if (residentesRestantes.recordset[0].count === 0) {
await pool.request()
  .input('HabitacionID', sql.Int, anterior.recordset[0].HabitacionID)
  .query(`
    UPDATE Habitaciones
    SET Estado = 'Disponible'
    WHERE HabitacionID = @HabitacionID
  `);
}

    res.status(200).json({ message: 'Cambio de habitación realizado con éxito.' });

  } catch (err) {
    console.error('❌ Error en cambiarHabitacion:', err);
    res.status(500).json({ message: 'Error al cambiar habitación.' });
  }
  
};

// Obtener detalles completos del residente
exports.getDetallesCompletosResidente = async (req, res) => {
  const { id } = req.params;

  try {
    console.log("🔵 Entrando a getDetallesCompletosResidente para ID:", id);

    const pool = await poolPromise;

    // 1. Info básica del residente
    const residenteResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT r.*, h.Numero as NumeroHabitacion, h.Tipo as TipoHabitacion, h.Planta
FROM Residentes r
LEFT JOIN Habitaciones h ON r.NumeroHabitacion = h.Numero
WHERE r.ResidenteID = @id

      `);

    if (residenteResult.recordset.length === 0) {
      return res.status(404).json({ error: true, message: 'Residente no encontrado' });
    }

    const residente = residenteResult.recordset[0];

    // 2. Tratamientos
    const tratamientosResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT t.*, m.Nombre AS MedicamentoNombre,
               p.Nombre + ' ' + p.Apellidos AS NombrePersonal
        FROM Tratamientos t
        JOIN Medicamentos m ON t.MedicamentoID = m.MedicamentoID
        JOIN Personal p ON t.PersonalID = p.PersonalID
        WHERE t.ResidenteID = @id AND t.Activo = 1
      `);

    // 3. Dietas
    const dietasResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT ad.*, d.Nombre AS DietaNombre,
               p.Nombre + ' ' + p.Apellidos AS NombrePersonal
        FROM AsignacionDietas ad
        JOIN Dietas d ON ad.DietaID = d.DietaID
        JOIN Personal p ON ad.PersonalID = p.PersonalID
        WHERE ad.ResidenteID = @id AND ad.Activo = 1
      `);

    // 4. Actividades
    const actividadesResult = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT a.*, pa.Asistio, pa.Valoracion
        FROM ParticipantesActividades pa
        JOIN Actividades a ON pa.ActividadID = a.ActividadID
        WHERE pa.ResidenteID = @id
      `);

    res.status(200).json({
      error: false,
      data: {
        residente,
        tratamientos: tratamientosResult.recordset,
        dietas: dietasResult.recordset,
        actividades: actividadesResult.recordset
      }
    });

  } catch (err) {
    console.error('Error al obtener detalles del residente:', err);
    res.status(500).json({
      error: true,
      message: 'Error al obtener los detalles del residente',
      details: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  }
};

exports.updateEstadoResidente = async (req, res) => {
  const { id } = req.params;
  const { Activo } = req.body;

  try {
    const pool = await poolPromise;

    await pool.request()
      .input('id', sql.Int, id)
      .input('Activo', sql.Bit, Activo)
      .query(`
        UPDATE Residentes SET Activo = @Activo WHERE ResidenteID = @id
      `);

    res.status(200).json({
      error: false,
      message: 'Estado actualizado correctamente'
    });
  } catch (err) {
    console.error('Error al actualizar estado del residente:', err);
    res.status(500).json({
      error: true,
      message: 'Error al cambiar el estado del residente',
      details: err.message
    });
  }
};


module.exports = {
  getAllResidentes: exports.getAllResidentes,
  getResidenteById: exports.getResidenteById,
  createResidente: exports.createResidente,
  updateResidente: exports.updateResidente,
  deleteResidente: exports.deleteResidente,
  cambiarHabitacion: exports.cambiarHabitacion,
  getDetallesCompletosResidente: exports.getDetallesCompletosResidente,
  updateEstadoResidente: exports.updateEstadoResidente,
};

