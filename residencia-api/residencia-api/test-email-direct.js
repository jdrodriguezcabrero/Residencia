require('dotenv').config();
const nodemailer = require('nodemailer');

let transporter;

if (process.env.EMAIL_PROVIDER === 'ethereal') {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
} else if (process.env.EMAIL_PROVIDER === 'mailtrap') {
  transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
} else {
  throw new Error('Proveedor de correo no válido. Usa "ethereal" o "mailtrap".');
}

transporter.sendMail({
  from: '"Residencia" <notificaciones@residencia.com>',
  to: 'demo@ejemplo.com',
  subject: 'Prueba directa',
  text: 'Este es un test fuera del servidor Express'
}).then(info => {
  console.log("✅ Correo enviado correctamente");
  if (process.env.EMAIL_PROVIDER === 'ethereal') {
    console.log(`🔗 Vista previa: ${nodemailer.getTestMessageUrl(info)}`);
  }
}).catch((err) => {
  console.error("❌ Error:", err);
});
