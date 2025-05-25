const sql = require('mssql');
const pool = require('../config/db');

class TratamientoModel {
  // Obtener todos los tratamientos activos
  async getTodos() {
    try {
      const result = await pool.request()
        .query(`
          SELECT t.*, r.Nombre + ' ' + r.Apellidos AS NombreResidente, 
                 m.Nombre AS NombreMedicamento,
                 p.Nombre + ' ' + p.Apellidos AS NombreMedico
          FROM Tratamientos t
          INNER JOIN Residentes r ON t.ResidenteID = r.ResidenteID
          INNER JOIN Medicamentos m ON t.MedicamentoID = m.MedicamentoID
          INNER JOIN Personal p ON t.PersonalID = p.PersonalID
          WHERE t.Activo = 1
          ORDER BY t.FechaInicio DESC
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener tratamientos:', error);
      throw error;
    }
  }

  // Obtener tratamientos por residente
  async getPorResidente(residenteId) {
    try {
      const result = await pool.request()
        .input('residenteId', sql.Int, residenteId)
        .query(`
          SELECT t.*, r.Nombre + ' ' + r.Apellidos AS NombreResidente, 
                 m.Nombre AS NombreMedicamento,
                 p.Nombre + ' ' + p.Apellidos AS NombreMedico
          FROM Tratamientos t
          INNER JOIN Residentes r ON t.ResidenteID = r.ResidenteID
          INNER JOIN Medicamentos m ON t.MedicamentoID = m.MedicamentoID
          INNER JOIN Personal p ON t.PersonalID = p.PersonalID
          WHERE t.ResidenteID = @residenteId AND t.Activo = 1
          ORDER BY t.FechaInicio DESC
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener tratamientos del residente:', error);
      throw error;
    }
  }

  // Obtener detalle de un tratamiento
  async getPorId(tratamientoId) {
    try {
      const result = await pool.request()
        .input('tratamientoId', sql.Int, tratamientoId)
        .query(`
          SELECT t.*, r.Nombre + ' ' + r.Apellidos AS NombreResidente, 
                 m.Nombre AS NombreMedicamento,
                 p.Nombre + ' ' + p.Apellidos AS NombreMedico
          FROM Tratamientos t
          INNER JOIN Residentes r ON t.ResidenteID = r.ResidenteID
          INNER JOIN Medicamentos m ON t.MedicamentoID = m.MedicamentoID
          INNER JOIN Personal p ON t.PersonalID = p.PersonalID
          WHERE t.TratamientoID = @tratamientoId
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error al obtener detalles del tratamiento:', error);
      throw error;
    }
  }

  // Crear un nuevo tratamiento
  async crear(tratamiento) {
    try {
      const result = await pool.request()
        .input('residenteId', sql.Int, tratamiento.residenteId)
        .input('medicamentoId', sql.Int, tratamiento.medicamentoId)
        .input('dosis', sql.VarChar(50), tratamiento.dosis)
        .input('frecuencia', sql.VarChar(50), tratamiento.frecuencia)
        .input('viaAdministracion', sql.VarChar(50), tratamiento.viaAdministracion)
        .input('fechaInicio', sql.Date, new Date(tratamiento.fechaInicio))
        .input('fechaFin', sql.Date, tratamiento.fechaFin ? new Date(tratamiento.fechaFin) : null)
        .input('instrucciones', sql.NVarChar(200), tratamiento.instrucciones || '')
        .input('personalId', sql.Int, tratamiento.personalId)
        .query(`
          INSERT INTO Tratamientos (
            ResidenteID, MedicamentoID, Dosis, Frecuencia, 
            ViaAdministracion, FechaInicio, FechaFin, 
            Instrucciones, PersonalID, Activo
          )
          VALUES (
            @residenteId, @medicamentoId, @dosis, @frecuencia,
            @viaAdministracion, @fechaInicio, @fechaFin,
            @instrucciones, @personalId, 1
          );
          SELECT SCOPE_IDENTITY() AS TratamientoID;
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error al crear tratamiento:', error);
      throw error;
    }
  }

  // Actualizar un tratamiento existente
  async actualizar(tratamientoId, tratamiento) {
    try {
      await pool.request()
        .input('tratamientoId', sql.Int, tratamientoId)
        .input('residenteId', sql.Int, tratamiento.residenteId)
        .input('medicamentoId', sql.Int, tratamiento.medicamentoId)
        .input('dosis', sql.VarChar(50), tratamiento.dosis)
        .input('frecuencia', sql.VarChar(50), tratamiento.frecuencia)
        .input('viaAdministracion', sql.VarChar(50), tratamiento.viaAdministracion)
        .input('fechaInicio', sql.Date, new Date(tratamiento.fechaInicio))
        .input('fechaFin', sql.Date, tratamiento.fechaFin ? new Date(tratamiento.fechaFin) : null)
        .input('instrucciones', sql.NVarChar(200), tratamiento.instrucciones || '')
        .input('personalId', sql.Int, tratamiento.personalId)
        .query(`
          UPDATE Tratamientos
          SET ResidenteID = @residenteId,
              MedicamentoID = @medicamentoId,
              Dosis = @dosis,
              Frecuencia = @frecuencia,
              ViaAdministracion = @viaAdministracion,
              FechaInicio = @fechaInicio,
              FechaFin = @fechaFin,
              Instrucciones = @instrucciones,
              PersonalID = @personalId
          WHERE TratamientoID = @tratamientoId
        `);
      
      return { tratamientoId };
    } catch (error) {
      console.error('Error al actualizar tratamiento:', error);
      throw error;
    }
  }

  // Desactivar un tratamiento (borrado lógico)
  async eliminar(tratamientoId) {
    try {
      await pool.request()
        .input('tratamientoId', sql.Int, tratamientoId)
        .query(`
          UPDATE Tratamientos
          SET Activo = 0
          WHERE TratamientoID = @tratamientoId
        `);
      
      return { tratamientoId };
    } catch (error) {
      console.error('Error al eliminar tratamiento:', error);
      throw error;
    }
  }

  // Obtener historial de administración de un tratamiento
  async getAdministraciones(tratamientoId) {
    try {
      const result = await pool.request()
        .input('tratamientoId', sql.Int, tratamientoId)
        .query(`
          SELECT a.*, p.Nombre + ' ' + p.Apellidos AS NombrePersonal
          FROM AdministracionMedicamentos a
          INNER JOIN Personal p ON a.PersonalID = p.PersonalID
          WHERE a.TratamientoID = @tratamientoId
          ORDER BY a.FechaHora DESC
        `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error al obtener historial de administración:', error);
      throw error;
    }
  }

  // Registrar una administración de medicamento
  async registrarAdministracion(administracion) {
    try {
      const result = await pool.request()
        .input('tratamientoId', sql.Int, administracion.tratamientoId)
        .input('fechaHora', sql.DateTime, new Date(administracion.fechaHora || new Date()))
        .input('personalId', sql.Int, administracion.personalId)
        .input('observaciones', sql.NVarChar(200), administracion.observaciones || '')
        .query(`
          INSERT INTO AdministracionMedicamentos (
            TratamientoID, FechaHora, PersonalID, 
            Observaciones, Completado
          )
          VALUES (
            @tratamientoId, @fechaHora, @personalId,
            @observaciones, 1
          );
          SELECT SCOPE_IDENTITY() AS AdministracionID;
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('Error al registrar administración de medicamento:', error);
      throw error;
    }
  }
}

module.exports = new TratamientoModel();