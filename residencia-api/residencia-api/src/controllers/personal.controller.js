const { sql, poolPromise } = require('../config/db');
const config = require('../config/db');

// Obtener todos los empleados
const getAllPersonal = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT PersonalID, DNI, Nombre, Apellidos, Categoria, Activo, Email, Telefono, FechaContratacion
      FROM Personal
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('❌ Error al obtener personal:', error);
    res.status(500).json({ message: 'Error al obtener personal' });
  }
};

// Obtener uno por ID
const getPersonalById = async (req, res) => {
  const { id } = req.params;
  console.log('🔎 Backend: buscando Personal con id:', id);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Personal WHERE PersonalID = @id');

    console.log('📋 Resultado de la consulta:', result.recordset);

    if (result.recordset.length === 0) {
      console.warn('⚠️ No se encontró información del empleado con id:', id);
      return res.status(404).json({ message: 'Personal no encontrado' });
    }

    res.json(result.recordset[0]);
  } catch (error) {
    console.error('❌ Error al obtener personal por ID:', error);
    res.status(500).json({ message: 'Error al obtener personal' });
  }
};



// Crear nuevo personal
const createPersonal = async (req, res) => {
  const {
    DNI, Nombre, Apellidos, FechaNacimiento,
    Direccion, Telefono, Email, Categoria,
    FechaContratacion, Activo
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('DNI', sql.VarChar, DNI)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Apellidos', sql.NVarChar, Apellidos)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .input('Direccion', sql.NVarChar, Direccion)
      .input('Telefono', sql.VarChar, Telefono)
      .input('Email', sql.VarChar, Email)
      .input('Categoria', sql.NVarChar, Categoria)
      .input('FechaContratacion', sql.Date, FechaContratacion)
      .input('Activo', sql.Bit, Activo)
      .query(`
        INSERT INTO Personal (
          DNI, Nombre, Apellidos, FechaNacimiento,
          Direccion, Telefono, Email, Categoria,
          FechaContratacion, Activo
        ) VALUES (
          @DNI, @Nombre, @Apellidos, @FechaNacimiento,
          @Direccion, @Telefono, @Email, @Categoria,
          @FechaContratacion, @Activo
        )
      `);

    res.status(201).json({ message: 'Empleado creado correctamente' });
  } catch (error) {
    console.error('❌ Error al crear personal:', error);
    res.status(500).json({ message: 'Error al crear empleado' });
  }
};

// Actualizar personal
const updatePersonal = async (req, res) => {
  const { id } = req.params;
  const {
    DNI, Nombre, Apellidos, FechaNacimiento,
    Direccion, Telefono, Email, Categoria, FechaContratacion, Activo
  } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('DNI', sql.VarChar, DNI)
      .input('Nombre', sql.NVarChar, Nombre)
      .input('Apellidos', sql.NVarChar, Apellidos)
      .input('FechaNacimiento', sql.Date, FechaNacimiento)
      .input('Direccion', sql.NVarChar, Direccion)
      .input('Telefono', sql.VarChar, Telefono)
      .input('Email', sql.VarChar, Email)
      .input('Categoria', sql.NVarChar, Categoria)
      .input('FechaContratacion', sql.Date, FechaContratacion)
      .input('Activo', sql.Bit, Activo ?? true)
      .query(`
        UPDATE Personal SET
          DNI = @DNI,
          Nombre = @Nombre,
          Apellidos = @Apellidos,
          FechaNacimiento = @FechaNacimiento,
          Direccion = @Direccion,
          Telefono = @Telefono,
          Email = @Email,
          Categoria = @Categoria,
          FechaContratacion = @FechaContratacion,
          Activo = @Activo
        WHERE PersonalID = @id
      `);

    res.json({ message: 'Personal actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al actualizar personal:', error);
    res.status(500).json({ message: 'Error al actualizar personal' });
  }
};

// Eliminar personal
const deletePersonal = async (req, res) => {
  const { id } = req.params;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Personal WHERE PersonalID = @id');

    res.json({ message: 'Personal eliminado correctamente' });
  } catch (error) {
    console.error('❌ Error al eliminar personal:', error);
    res.status(500).json({ message: 'Error al eliminar personal' });
  }
};

const updateEstadoPersonal = async (req, res) => {
  try {
    const id = req.params.id;
    const { Activo } = req.body;

    const pool = await poolPromise;
    await pool.request()
      .input('PersonalID', sql.Int, id)
      .input('Activo', sql.Bit, Activo)
      .query(`
        UPDATE Personal
        SET Activo = @Activo
        WHERE PersonalID = @PersonalID
      `);

    res.json({ message: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('❌ Error al cambiar estado del personal:', error);
    res.status(500).json({ error: 'Error al cambiar el estado del empleado' });
  }
};



module.exports = {
  getAllPersonal,
  getPersonalById,
  createPersonal,
  updatePersonal,
  updateEstadoPersonal,
  deletePersonal
};
