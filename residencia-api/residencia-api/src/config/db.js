const sql = require('mssql');
require('dotenv').config();

// Configuración para SQL Server
const config = {
  user: 'sa',
  password: 'oretania',
  server: 'localhost', // Ajustar si es necesario
  database: 'ResidenciaAncianos',
  options: {
    encrypt: false, // true si usas Azure
    trustServerCertificate: true, // Cambiar según entorno
    enableArithAbort: true
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

// Pool de conexiones
const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Conectado a SQL Server');
    return pool;
  })
  .catch(err => {
    console.error('Error al conectar a SQL Server:', err);
  });

module.exports = {
  sql,
  poolPromise
};