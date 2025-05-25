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
} else {
  transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 587,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS
    }
  });
}

exports.sendEmail = async ({ to, subject, text }) => {
  console.log(`📧 Preparando para enviar a: ${to}`);

  const info = await transporter.sendMail({
    from: '"Residencia" <notificaciones@residencia.com>',
    to,
    subject,
    text
  });

  console.log(`✅ Correo enviado a ${to} (ID: ${info.messageId})`);

  const preview = nodemailer.getTestMessageUrl(info);
  if (preview) {
    console.log(`🔗 Vista previa en Ethereal: ${preview}`);
  }
};
