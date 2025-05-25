const { sql, poolPromise } = require('../config/db');

// Obtener todas las visitas
const getVisitas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT v.*, r.Nombre + ' ' + r.Apellidos AS ResidenteNombre
      FROM Visitas v
      JOIN Residentes r ON v.ResidenteID = r.ResidenteID
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener visitas:', error);
    res.status(500).json({ message: 'Error al obtener visitas' });
  }
};

// Obtener una visita por ID
const getVisitaById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          v.*,
          r.Nombre + ' ' + r.Apellidos AS ResidenteNombre
        FROM Visitas v
        JOIN Residentes r ON v.ResidenteID = r.ResidenteID
        WHERE v.VisitaID = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Visita no encontrada' });
    }

    res.json({ data: result.recordset[0] }); // importante envolver en 'data'
  } catch (error) {
    console.error('Error al obtener visita:', error);
    res.status(500).json({ message: 'Error al obtener visita' });
  }
};



// Crear visita
const createVisita = async (req, res) => {
  const {
    ResidenteID,
    NombreVisitante,
    RelacionConResidente,
    FechaHoraEntrada,
    FechaHoraSalida,
    Observaciones
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('ResidenteID', sql.Int, ResidenteID)
      .input('NombreVisitante', sql.NVarChar, NombreVisitante)
      .input('RelacionConResidente', sql.NVarChar, RelacionConResidente)
      .input('FechaHoraEntrada', sql.DateTime, FechaHoraEntrada)
      .input('FechaHoraSalida', sql.DateTime, FechaHoraSalida || null)
      .input('Observaciones', sql.NVarChar, Observaciones || null)
      .query(`
        INSERT INTO Visitas (
          ResidenteID,
          NombreVisitante,
          RelacionConResidente,
          FechaHoraEntrada,
          FechaHoraSalida,
          Observaciones
        )
        VALUES (
          @ResidenteID,
          @NombreVisitante,
          @RelacionConResidente,
          @FechaHoraEntrada,
          @FechaHoraSalida,
          @Observaciones
        )
      `);

    res.status(201).json({ message: 'Visita creada correctamente' });
  } catch (error) {
    console.error('Error al crear visita:', error);
    res.status(500).json({ message: 'Error al crear visita' });
  }
};

// Actualizar visita
const updateVisita = async (req, res) => {
  const { id } = req.params;
  const {
    ResidenteID,
    NombreVisitante,
    RelacionConResidente,
    FechaHoraEntrada,
    FechaHoraSalida,
    Observaciones
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('ResidenteID', sql.Int, ResidenteID)
      .input('NombreVisitante', sql.NVarChar, NombreVisitante)
      .input('RelacionConResidente', sql.NVarChar, RelacionConResidente)
      .input('FechaHoraEntrada', sql.DateTime, FechaHoraEntrada)
      .input('FechaHoraSalida', sql.DateTime, FechaHoraSalida || null )
      .input('Observaciones', sql.NVarChar, Observaciones || null)
      .query(`
        UPDATE Visitas SET
          ResidenteID = @ResidenteID,
          NombreVisitante = @NombreVisitante,
          RelacionConResidente = @RelacionConResidente,
          FechaHoraEntrada = @FechaHoraEntrada,
          FechaHoraSalida = @FechaHoraSalida,
          Observaciones = @Observaciones
        WHERE VisitaID = @id
      `);

    res.json({ message: 'Visita actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar visita:', error);
    res.status(500).json({ message: 'Error al actualizar visita' });
  }
};

// Eliminar visita
const deleteVisita = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Visitas WHERE VisitaID = @id');
    res.json({ message: 'Visita eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar visita:', error);
    res.status(500).json({ message: 'Error al eliminar visita' });
  }
};

module.exports = {
  getVisitas,
  getVisitaById,
  createVisita,
  updateVisita,
  deleteVisita
};
