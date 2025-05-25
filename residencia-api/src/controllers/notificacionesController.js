// controllers/notificacionesController.js
const { poolPromise, sql } = require('../config/db');
const { sendEmail } = require('../utils/email');

exports.verificarStockYNotificar = async () => {
  try {
    const pool = await poolPromise;

    // Obtener medicamentos por debajo del stock mínimo
    const medicamentosResult = await pool.request().query(`
      SELECT Nombre, Stock, StockMinimo
      FROM Medicamentos
      WHERE Stock < StockMinimo
    `);

    const medicamentos = medicamentosResult.recordset;

    if (medicamentos.length === 0) {
      console.log('📦 No hay medicamentos con stock bajo');
      return 0;
    }

    // Obtener emails del personal médico
    const medicosResult = await pool.request().query(`
      SELECT Email
      FROM Personal
      WHERE Categoria = 'Enfermero' AND Activo = 1 AND Email IS NOT NULL
    `);

    const emails = medicosResult.recordset.map(p => p.Email).filter(Boolean);

    if (emails.length === 0) {
      console.warn('⚠️ No hay enfermeros activos con correo electrónico.');
      return 0;
    }

    // Preparar contenido del email
    const cuerpo = `
Los siguientes medicamentos están por debajo del stock mínimo:

${medicamentos.map(m => `- ${m.Nombre}: ${m.Stock} unidades (mínimo requerido: ${m.StockMinimo})`).join('\n')}

Por favor, considere reponer existencias.
`;

    for (const email of emails) {
      console.log(`📧 Enviando alerta de stock a: ${email}`);
      await sendEmail({
        to: email,
        subject: '⚠️ Alerta de stock bajo de medicamentos',
        text: cuerpo
      });
    }

    return emails.length;
  } catch (error) {
    console.error('❌ Error al verificar stock y notificar:', error);
    throw error;
  }
};

exports.enviarResumenDiarioMedicamentos = async () => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        r.ResidenteID,
        r.Nombre AS ResidenteNombre,
        r.Email,
        t.MedicamentoID,
        m.Nombre AS MedicamentoNombre,
        t.Dosis,
        t.Frecuencia,
        t.ViaAdministracion,
        t.FechaInicio,
        t.FechaFin
      FROM Tratamientos t
      JOIN Residentes r ON r.ResidenteID = t.ResidenteID
      JOIN Medicamentos m ON m.MedicamentoID = t.MedicamentoID
      WHERE t.Activo = 1 AND r.Activo = 1 AND r.Email IS NOT NULL
    `);

    const tratamientos = result.recordset;

    const porResidente = {};
    for (const t of tratamientos) {
      if (!porResidente[t.ResidenteID]) {
        porResidente[t.ResidenteID] = {
          nombre: t.ResidenteNombre,
          email: t.Email,
          tratamientos: []
        };
      }

      porResidente[t.ResidenteID].tratamientos.push({
        medicamento: t.MedicamentoNombre,
        dosis: t.Dosis,
        frecuencia: t.Frecuencia,
        via: t.ViaAdministracion,
        desde: t.FechaInicio,
        hasta: t.FechaFin
      });
    }

    for (const residenteId in porResidente) {
      const { email, nombre, tratamientos } = porResidente[residenteId];

      const cuerpo = `
Hola ${nombre},

Estos son tus medicamentos programados para hoy:

${tratamientos.map(t => `- ${t.medicamento}: ${t.dosis}, ${t.frecuencia}, vía ${t.via}`).join('\n')}

¡Que tengas un buen día!

Atentamente,
Residencia de Ancianos
      `;

      console.log(`📧 Preparando para enviar a: ${email}`);
      await sendEmail({
        to: email,
        subject: '📋 Medicamentos programados para hoy',
        text: cuerpo
      });

      console.log(`✅ Correo enviado a ${email}`);

      // ⏳ Esperar 1 segundo antes de enviar el siguiente
      await new Promise(res => setTimeout(res, 1000));
    }

  } catch (err) {
    console.error('❌ Error al enviar resumen diario:', err);
  }
};
