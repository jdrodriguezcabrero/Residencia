require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

console.log('📧 Mailtrap USER:', process.env.MAILTRAP_USER);

process.env.NODE_ENV = 'development';
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const cron = require('node-cron');

const { verificarStockYNotificar, enviarResumenDiarioMedicamentos } = require('./controllers/notificacionesController');

// Rutas
const authRoutes = require('./routes/auth.routes');
const residentesRoutes = require('./routes/residentes.routes');
const personalRoutes = require('./routes/personal.routes');
const medicamentosRoutes = require('./routes/medicamentos.routes');
const tratamientosRoutes = require('./routes/tratamientos.routes');
const habitacionesRoutes = require('./routes/habitaciones.routes');
const actividadesRoutes = require('./routes/actividades.routes');
const dietasRoutes = require('./routes/dietas.routes');
const visitasRoutes = require('./routes/visitas.routes');
const incidenciasRoutes = require('./routes/incidencias.routes');
const constantesRoutes = require('./routes/constantes.routes');
const pagosRoutes = require('./routes/pagos.routes');
const testRoutes = require('./routes/test.routes');
const notificacionesRoutes = require('./routes/notificaciones.routes');

// Inicializar app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/residentes', residentesRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/tratamientos', tratamientosRoutes);
app.use('/api/habitaciones', habitacionesRoutes);
app.use('/api/actividades', actividadesRoutes);
app.use('/api/dietas', dietasRoutes);
app.use('/api/visitas', visitasRoutes);
app.use('/api/incidencias', incidenciasRoutes);
app.use('/api/constantes', constantesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/test', testRoutes);
app.use('/api/notificaciones', notificacionesRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.json({ message: 'API de Gestión de Residencia de Ancianos' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
});

// Cron Jobs

// ⏰ Verificación de stock cada hora en el minuto 0
cron.schedule('0 6 * * *', () => {
  console.log('⏰ Ejecutando revisión de stock...');
  verificarStockYNotificar();
});

// Para probar manualmente : http://localhost:3001/api/notificaciones/verificar-stock

// 📬 Envío diario de resumen de medicamentos a las 6:00 AM
cron.schedule('0 6 * * *', () => {
  console.log('📬 Enviando resumen diario de medicamentos...');
  enviarResumenDiarioMedicamentos();
});


// Para probar manualmente :http://localhost:3001/api/notificaciones/resumen-medicamentos