// test-email-direct.js
require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

transporter.sendMail({
  from: '"Residencia" <notificaciones@residencia.com>',
  to: 'demo@ejemplo.com',
  subject: 'Prueba directa',
  text: 'Este es un test fuera del servidor Express'
}).then(() => {
  console.log("✅ Correo enviado correctamente");
}).catch((err) => {
  console.error("❌ Error:", err);
});
