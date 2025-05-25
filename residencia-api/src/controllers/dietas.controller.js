const { sql, poolPromise } = require('../config/db');

// Obtener todas las dietas
const getAllDietas = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Dietas');
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al obtener dietas:', error);
    res.status(500).json({ message: 'Error al obtener dietas' });
  }
};

// Obtener una dieta por ID
const getDietaById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Dietas WHERE DietaID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Dieta no encontrada' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('❌ Error al obtener dieta:', error);
    res.status(500).json({ message: 'Error al obtener dieta' });
  }
};

// Crear una nueva dieta
const createDieta = async (req, res) => {
  const { Nombre, Caracteristicas, Activo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Caracteristicas', sql.NVarChar(sql.MAX), Caracteristicas)
      .input('Activo', sql.Bit, Activo ?? true)
      .query(`
        INSERT INTO Dietas (Nombre, Caracteristicas, Activo)
        VALUES (@Nombre, @Caracteristicas, @Activo)
      `);
    res.status(201).json({ message: 'Dieta creada correctamente' });
  } catch (error) {
    console.error('❌ Error al crear dieta:', error);
    res.status(500).json({ message: 'Error al crear dieta' });
  }
};

// Actualizar una dieta
const updateDieta = async (req, res) => {
  const { id } = req.params;
  const { Nombre, Caracteristicas, Activo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Caracteristicas', sql.NVarChar(sql.MAX), Caracteristicas)
      .input('Activo', sql.Bit, Activo ?? true)
      .query(`
        UPDATE Dietas
        SET Nombre = @Nombre,
            Caracteristicas = @Caracteristicas,
            Activo = @Activo
        WHERE DietaID = @id
      `);
    res.json({ message: 'Dieta actualizada correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar dieta:', error);
    res.status(500).json({ message: 'Error al actualizar dieta' });
  }
};

// Eliminar una dieta
const deleteDieta = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Dietas WHERE DietaID = @id');
    res.json({ message: 'Dieta eliminada correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar dieta:', error);
    res.status(500).json({ message: 'Error al eliminar dieta' });
  }
};

const updateEstadoDieta = async (req, res) => {
  const { id } = req.params;
  const { Activo } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Activo', sql.Bit, Activo)
      .query(`
        UPDATE Dietas
        SET Activo = @Activo
        WHERE DietaID = @id
      `);

    res.json({ message: 'Estado de la dieta actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar estado de la dieta:', error);
    res.status(500).json({ message: 'Error al actualizar estado de la dieta' });
  }
};


module.exports = {
  getAllDietas,
  getDietaById,
  createDieta,
  updateDieta,
  deleteDieta,
  updateEstadoDieta
};
