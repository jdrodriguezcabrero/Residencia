// src/controllers/actividades.controller.js
const { sql, poolPromise } = require('../config/db');

// Obtener todas las actividades
const getAllActividades = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Actividades');
    res.json({ error: false, data: result.recordset });
  } catch (error) {
    console.error('❌ Error al obtener actividades:', error);
    res.status(500).json({ error: true, message: 'Error al obtener actividades' });
  }
};

// Obtener una actividad por ID
const getActividadById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Actividades WHERE ActividadID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ error: true, message: 'Actividad no encontrada' });
    }

    res.json({ error: false, data: result.recordset[0] });
  } catch (error) {
    console.error('❌ Error al obtener actividad:', error);
    res.status(500).json({ error: true, message: 'Error al obtener actividad' });
  }
};

// Crear nueva actividad
const createActividad = async (req, res) => {
  const {
    Nombre, Descripcion, TipoActividad,
    FechaHoraInicio, FechaHoraFin, Lugar,
    PersonalResponsableID, MaximoParticipantes, Observaciones
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .input('TipoActividad', sql.VarChar(50), TipoActividad)
      .input('FechaHoraInicio', sql.DateTime, FechaHoraInicio)
      .input('FechaHoraFin', sql.DateTime, FechaHoraFin)
      .input('Lugar', sql.NVarChar(100), Lugar)
      .input('PersonalResponsableID', sql.Int, PersonalResponsableID)
      .input('MaximoParticipantes', sql.Int, MaximoParticipantes)
      .input('Observaciones', sql.NVarChar(200), Observaciones)
      .query(`
        INSERT INTO Actividades (
          Nombre, Descripcion, TipoActividad,
          FechaHoraInicio, FechaHoraFin, Lugar,
          PersonalResponsableID, MaximoParticipantes, Observaciones
        ) VALUES (
          @Nombre, @Descripcion, @TipoActividad,
          @FechaHoraInicio, @FechaHoraFin, @Lugar,
          @PersonalResponsableID, @MaximoParticipantes, @Observaciones
        )
      `);

    res.status(201).json({ message: 'Actividad creada correctamente' });
  } catch (error) {
    console.error('❌ Error al crear actividad:', error);
    res.status(500).json({ error: true, message: 'Error al crear actividad' });
  }
};

// Actualizar actividad
const updateActividad = async (req, res) => {
  const { id } = req.params;
  const {
    Nombre, Descripcion, TipoActividad,
    FechaHoraInicio, FechaHoraFin, Lugar,
    PersonalResponsableID, MaximoParticipantes, Observaciones
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .input('TipoActividad', sql.VarChar(50), TipoActividad)
      .input('FechaHoraInicio', sql.DateTime, FechaHoraInicio)
      .input('FechaHoraFin', sql.DateTime, FechaHoraFin)
      .input('Lugar', sql.NVarChar(100), Lugar)
      .input('PersonalResponsableID', sql.Int, PersonalResponsableID)
      .input('MaximoParticipantes', sql.Int, MaximoParticipantes)
      .input('Observaciones', sql.NVarChar(200), Observaciones)
      .query(`
        UPDATE Actividades SET
          Nombre = @Nombre,
          Descripcion = @Descripcion,
          TipoActividad = @TipoActividad,
          FechaHoraInicio = @FechaHoraInicio,
          FechaHoraFin = @FechaHoraFin,
          Lugar = @Lugar,
          PersonalResponsableID = @PersonalResponsableID,
          MaximoParticipantes = @MaximoParticipantes,
          Observaciones = @Observaciones
        WHERE ActividadID = @id
      `);

    res.json({ message: 'Actividad actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar actividad:', error);
    res.status(500).json({ error: true, message: 'Error al actualizar actividad' });
  }
};

// Eliminar actividad
const deleteActividad = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Actividades WHERE ActividadID = @id');

    res.json({ message: 'Actividad eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar actividad:', error);
    res.status(500).json({ error: true, message: 'Error al eliminar actividad' });
  }
};

module.exports = {
  getAllActividades,
  getActividadById,
  createActividad,
  updateActividad,
  deleteActividad
};
