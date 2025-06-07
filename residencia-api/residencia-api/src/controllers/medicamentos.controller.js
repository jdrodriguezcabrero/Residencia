// src/controllers/medicamentos.controller.js
const { sql, poolPromise } = require('../config/db');

// Obtener todos los medicamentos
const getMedicamentos = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Medicamentos');
    res.json(result.recordset);
  } catch (error) {
    console.error('Error al obtener medicamentos:', error);
    res.status(500).json({ message: 'Error al obtener medicamentos' });
  }
};

// Obtener un medicamento por ID
const getMedicamentoById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Medicamentos WHERE MedicamentoID = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Medicamento no encontrado' });
    }
       res.json({ data: result.recordset[0] });
  } catch (error) {
    console.error('Error al obtener medicamento:', error);
    res.status(500).json({ message: 'Error al obtener medicamento' });
  }
};

// Crear un nuevo medicamento
const createMedicamento = async (req, res) => {
  const { Nombre, Descripcion, Tipo, Contraindicaciones, Stock, StockMinimo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Descripcion', sql.NVarChar(200), Descripcion)
      .input('Tipo', sql.VarChar(50), Tipo)
      .input('Contraindicaciones', sql.NVarChar(sql.MAX), Contraindicaciones)
      .input('Stock', sql.Int, Stock)
      .input('StockMinimo', sql.Int, StockMinimo)
      .query(`
        INSERT INTO Medicamentos (Nombre, Descripcion, Tipo, Contraindicaciones, Stock, StockMinimo)
        VALUES (@Nombre, @Descripcion, @Tipo, @Contraindicaciones, @Stock, @StockMinimo)
      `);

    res.status(201).json({ message: 'Medicamento creado correctamente' });
  } catch (error) {
    console.error('Error al crear medicamento:', error);
    res.status(500).json({ message: 'Error al crear medicamento' });
  }
};

// Actualizar un medicamento existente
const updateMedicamento = async (req, res) => {
  const { id } = req.params;
  const { Nombre, Descripcion, Tipo, Contraindicaciones, Stock, StockMinimo } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('Nombre', sql.NVarChar(100), Nombre)
      .input('Descripcion', sql.NVarChar(200), Descripcion)
      .input('Tipo', sql.VarChar(50), Tipo)
      .input('Contraindicaciones', sql.NVarChar(sql.MAX), Contraindicaciones)
      .input('Stock', sql.Int, Stock)
      .input('StockMinimo', sql.Int, StockMinimo)
      .query(`
        UPDATE Medicamentos
        SET Nombre = @Nombre,
            Descripcion = @Descripcion,
            Tipo = @Tipo,
            Contraindicaciones = @Contraindicaciones,
            Stock = @Stock,
            StockMinimo = @StockMinimo
        WHERE MedicamentoID = @id
      `);

    res.json({ message: 'Medicamento actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar medicamento:', error);
    res.status(500).json({ message: 'Error al actualizar medicamento' });
  }
};

// Eliminar un medicamento
const deleteMedicamento = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Medicamentos WHERE MedicamentoID = @id');

    res.json({ message: 'Medicamento eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar medicamento:', error);
    res.status(500).json({ message: 'Error al eliminar medicamento' });
  }
};

module.exports = {
  getMedicamentos,
  getMedicamentoById,
  createMedicamento,
  updateMedicamento,
  deleteMedicamento
};
