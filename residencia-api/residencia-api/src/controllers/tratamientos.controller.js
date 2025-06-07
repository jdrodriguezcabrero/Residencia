const { sql, poolPromise } = require('../config/db');

// Obtener todos los tratamientos
const getTratamientos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        T.TratamientoID,
        T.ResidenteID,
        R.Nombre + ' ' + R.Apellidos AS ResidenteNombre,
        T.MedicamentoID,
        M.Nombre AS MedicamentoNombre,
        T.Dosis,
        T.Frecuencia,
        T.ViaAdministracion,
        T.FechaInicio,
        T.FechaFin,
        T.Instrucciones,
        T.PersonalID,
        P.Nombre + ' ' + P.Apellidos AS PersonalNombre,
        T.Activo
      FROM Tratamientos T
      LEFT JOIN Residentes R ON T.ResidenteID = R.ResidenteID
      LEFT JOIN Medicamentos M ON T.MedicamentoID = M.MedicamentoID
      LEFT JOIN Personal P ON T.PersonalID = P.PersonalID
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener tratamientos:', error);
    res.status(500).json({ message: 'Error al obtener tratamientos' });
  }
};

// Obtener un tratamiento por ID
const getTratamientoById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise; // ✅ CORREGIDO
    const result = await pool.request()
  .input('id', sql.Int, id)
  .query(`
    SELECT 
      T.TratamientoID,
      T.ResidenteID,
      R.Nombre + ' ' + R.Apellidos AS ResidenteNombre,
      T.MedicamentoID,
      M.Nombre AS MedicamentoNombre,
      T.Dosis,
      T.Frecuencia,
      T.ViaAdministracion,
      T.FechaInicio,
      T.FechaFin,
      T.Instrucciones,
      T.PersonalID,
      P.Nombre + ' ' + P.Apellidos AS PersonalNombre,
      T.Activo
    FROM Tratamientos T
    LEFT JOIN Residentes R ON T.ResidenteID = R.ResidenteID
    LEFT JOIN Medicamentos M ON T.MedicamentoID = M.MedicamentoID
    LEFT JOIN Personal P ON T.PersonalID = P.PersonalID
    WHERE T.TratamientoID = @id
  `);


    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Tratamiento no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error al obtener tratamiento:', error);
    res.status(500).json({ message: 'Error al obtener tratamiento' });
  }
};

// Crear un nuevo tratamiento
const createTratamiento = async (req, res) => {
  const {
    ResidenteID,
    MedicamentoID,
    Dosis,
    Frecuencia,
    ViaAdministracion,
    FechaInicio,
    FechaFin,
    Instrucciones,
    PersonalID,
    Activo
  } = req.body;

  console.log('📥 Datos recibidos para crear tratamiento:', req.body);

  try {
    const pool = await poolPromise; // ✅ CORREGIDO
    await pool.request()
      .input('ResidenteID', sql.Int, ResidenteID)
      .input('MedicamentoID', sql.Int, MedicamentoID)
      .input('Dosis', sql.VarChar, Dosis)
      .input('Frecuencia', sql.VarChar, Frecuencia)
      .input('ViaAdministracion', sql.VarChar, ViaAdministracion)
      .input('FechaInicio', sql.Date, FechaInicio)
      .input('FechaFin', sql.Date, FechaFin || null)
      .input('Instrucciones', sql.VarChar, Instrucciones)
      .input('PersonalID', sql.Int, PersonalID)
      .input('Activo', sql.Bit, Activo)
      .query(`
        INSERT INTO Tratamientos (
          ResidenteID, MedicamentoID, Dosis, Frecuencia, ViaAdministracion,
          FechaInicio, FechaFin, Instrucciones, PersonalID, Activo
        )
        VALUES (
          @ResidenteID, @MedicamentoID, @Dosis, @Frecuencia, @ViaAdministracion,
          @FechaInicio, @FechaFin, @Instrucciones, @PersonalID, @Activo
        )
      `);

    res.status(201).json({ message: 'Tratamiento creado exitosamente' });
  } catch (error) {
    console.error('❌ Error al crear tratamiento:', error);
    res.status(500).json({ message: 'Error al crear tratamiento' });
  }
};

// Actualizar tratamiento
const updateTratamiento = async (req, res) => {
  const { id } = req.params;
  const {
    ResidenteID,
    MedicamentoID,
    Dosis,
    Frecuencia,
    ViaAdministracion,
    FechaInicio,
    FechaFin,
    Instrucciones,
    PersonalID,
    Activo
  } = req.body;

  try {
    const pool = await poolPromise; // ✅ CORREGIDO
    await pool.request()
      .input('id', sql.Int, id)
      .input('ResidenteID', sql.Int, ResidenteID)
      .input('MedicamentoID', sql.Int, MedicamentoID)
      .input('Dosis', sql.VarChar, Dosis)
      .input('Frecuencia', sql.VarChar, Frecuencia)
      .input('ViaAdministracion', sql.VarChar, ViaAdministracion)
      .input('FechaInicio', sql.Date, FechaInicio)
      .input('FechaFin', sql.Date, FechaFin || null)
      .input('Instrucciones', sql.VarChar, Instrucciones)
      .input('PersonalID', sql.Int, PersonalID)
      .input('Activo', sql.Bit, Activo)
      .query(`
        UPDATE Tratamientos SET
          ResidenteID = @ResidenteID,
          MedicamentoID = @MedicamentoID,
          Dosis = @Dosis,
          Frecuencia = @Frecuencia,
          ViaAdministracion = @ViaAdministracion,
          FechaInicio = @FechaInicio,
          FechaFin = @FechaFin,
          Instrucciones = @Instrucciones,
          PersonalID = @PersonalID,
          Activo = @Activo
        WHERE TratamientoID = @id
      `);

    res.json({ message: 'Tratamiento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar tratamiento:', error);
    res.status(500).json({ message: 'Error al actualizar tratamiento' });
  }
};

// Eliminar tratamiento
// Eliminar tratamiento
const deleteTratamiento = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;

    // Comprobar si existe el tratamiento antes de eliminar
    const check = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT TratamientoID FROM Tratamientos WHERE TratamientoID = @id');

    if (check.recordset.length === 0) {
      return res.status(404).json({ message: 'Tratamiento no encontrado' });
    }

    // Intentar eliminar
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Tratamientos WHERE TratamientoID = @id');

    res.json({ message: 'Tratamiento eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar tratamiento:', error);

    // Si el error es por clave foránea (referencias en otras tablas), informar
    if (error.originalError?.info?.number === 547) {
      return res.status(409).json({
        message: 'No se puede eliminar el tratamiento porque está en uso (por ejemplo, en Administración de Medicamentos)'
      });
    }

    res.status(500).json({ message: 'Error interno al eliminar tratamiento' });
  }
};

const updateEstadoTratamiento = async (req, res) => {
  const { id } = req.params;
  const { Activo } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Activo', sql.Bit, Activo)
      .query(`
        UPDATE Tratamientos
        SET Activo = @Activo
        WHERE TratamientoID = @id
      `);

    res.json({ message: 'Estado del tratamiento actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar estado del tratamiento:', error);
    res.status(500).json({ message: 'Error al actualizar estado del tratamiento' });
  }
};



module.exports = {
  getTratamientos,
  getTratamientoById,
  createTratamiento,
  updateTratamiento,
  deleteTratamiento,
  updateEstadoTratamiento
};
