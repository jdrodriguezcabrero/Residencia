const { sql, poolPromise } = require('../config/db');

// Obtener todas las incidencias
const getAllIncidencias = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Incidencias');
    res.json({ error: false, data: result.recordset });
  } catch (error) {
    console.error('❌ Error al obtener incidencias:', error);
    res.status(500).json({ error: true, message: 'Error al obtener incidencias' });
  }
};

// Obtener incidencia por ID
const getIncidenciaById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          I.IncidenciaID,
          I.FechaHora,
          I.Descripcion,
          I.Tipo,
          I.Gravedad,
          I.Estado,
          I.Observaciones,
          I.ResidenteID,
          R.Nombre + ' ' + R.Apellidos AS ResidenteNombre,
          I.PersonalReportaID,
          P.Nombre + ' ' + P.Apellidos AS PersonalReportaNombre
        FROM Incidencias I
        LEFT JOIN Residentes R ON I.ResidenteID = R.ResidenteID
        LEFT JOIN Personal P ON I.PersonalReportaID = P.PersonalID
        WHERE I.IncidenciaID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Incidencia no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('❌ Error al obtener incidencia:', error);
    res.status(500).json({ message: 'Error al obtener incidencia' });
  }
};


// Crear nueva incidencia
const createIncidencia = async (req, res) => {
  const { Descripcion, FechaHora, Estado, Gravedad, ResidenteID, Tipo, Observaciones, PersonalReportaID } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .input('FechaHora', sql.DateTime, FechaHora)
      .input('Estado', sql.NVarChar(50), Estado)
      .input('Gravedad', sql.NVarChar(50), Gravedad)
      .input('Tipo', sql.NVarChar(100), Tipo)
      .input('Observaciones', sql.NVarChar(sql.MAX), Observaciones || null)
      .input('ResidenteID', sql.Int, ResidenteID)
      .input('PersonalReportaID', sql.Int, PersonalReportaID || null)
      .query(`
        INSERT INTO Incidencias (Descripcion, FechaHora, Estado, Gravedad, Tipo, Observaciones, ResidenteID, PersonalReportaID)
        VALUES (@Descripcion, @FechaHora, @Estado, @Gravedad, @Tipo, @Observaciones, @ResidenteID, @PersonalReportaID)
      `);

    res.status(201).json({ message: 'Incidencia creada correctamente' });
  } catch (error) {
    console.error('❌ Error al crear incidencia:', error);
    res.status(500).json({ message: 'Error al crear incidencia' });
  }
};


// Actualizar incidencia
const updateIncidencia = async (req, res) => {
  const { id } = req.params;
  const { Descripcion, FechaHora, Estado, Gravedad, Tipo, Observaciones, ResidenteID, PersonalReportaID } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Descripcion', sql.NVarChar(sql.MAX), Descripcion)
      .input('FechaHora', sql.DateTime, FechaHora)
      .input('Estado', sql.NVarChar(50), Estado)
      .input('Gravedad', sql.NVarChar(50), Gravedad)
      .input('Tipo', sql.NVarChar(100), Tipo)
      .input('Observaciones', sql.NVarChar(sql.MAX), Observaciones || null)
      .input('ResidenteID', sql.Int, ResidenteID)
      .input('PersonalReportaID', sql.Int, PersonalReportaID || null)
      .query(`
        UPDATE Incidencias
        SET Descripcion = @Descripcion,
            FechaHora = @FechaHora,
            Estado = @Estado,
            Gravedad = @Gravedad,
            Tipo = @Tipo,
            Observaciones = @Observaciones,
            ResidenteID = @ResidenteID,
            PersonalReportaID = @PersonalReportaID
        WHERE IncidenciaID = @id
      `);

    res.json({ message: 'Incidencia actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar incidencia:', error);
    res.status(500).json({ message: 'Error al actualizar incidencia' });
  }
};


// Eliminar incidencia
const deleteIncidencia = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Incidencias WHERE IncidenciaID = @id');

    res.json({ message: 'Incidencia eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar incidencia:', error);
    res.status(500).json({ message: 'Error al eliminar incidencia' });
  }
};

module.exports = {
  getAllIncidencias,
  getIncidenciaById,
  createIncidencia,
  updateIncidencia,
  deleteIncidencia
};
