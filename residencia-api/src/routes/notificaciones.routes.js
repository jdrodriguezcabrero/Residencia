const express = require('express');
const router = express.Router();
const {
  verificarStockYNotificar,
  enviarResumenDiarioMedicamentos
} = require('../controllers/notificacionesController');

// Forzar verificación de stock manualmente
router.get('/verificar-stock', async (req, res) => {
  try {
    await verificarStockYNotificar();
    res.json({ message: 'Verificación de stock completada y notificaciones enviadas (si aplicaba).' });
  } catch (err) {
    console.error('❌ Error en verificación de stock manual:', err);
    res.status(500).json({ error: true, message: 'Error al verificar stock.' });
  }
});

// Forzar resumen diario de medicamentos manualmente
router.get('/resumen-medicamentos', async (req, res) => {
  try {
    await enviarResumenDiarioMedicamentos();
    res.json({ message: 'Resumen diario de medicamentos enviado (si aplicaba).' });
  } catch (err) {
    console.error('❌ Error en resumen diario manual:', err);
    res.status(500).json({ error: true, message: 'Error al enviar resumen diario.' });
  }
});

module.exports = router;
