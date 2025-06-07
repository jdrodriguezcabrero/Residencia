const express = require('express');
const router = express.Router();
const { sendEmail } = require('../utils/email');

router.get('/test-email', async (req, res) => {
  try {
    await sendEmail({
      to: 'demo@ejemplo.com',
      subject: 'Prueba',
      text: 'Este es un correo de prueba desde Mailtrap.'
    });

    res.json({ message: 'Correo enviado correctamente' });
  } catch (err) {
    console.error('❌ Error al enviar email:', err);
    res.status(500).json({ message: 'Error al enviar el correo' });
  }
});

module.exports = router;
