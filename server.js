require('dotenv').config();

const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const nodemailer = require('nodemailer');
const path = require('node:path');

const app = express();
const publicDirectory = path.join(__dirname, 'public');

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      'font-src': ["'self'", 'https://fonts.gstatic.com'],
      'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      'img-src': ["'self'", 'data:', 'https:'],
      'connect-src': ["'self'"],
    },
  },
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(publicDirectory, { extensions: ['html'] }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many messages. Please try again later.' },
});

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok' });
});

app.post('/api/contact', contactLimiter, async (request, response) => {
  const { name, email, message, website } = request.body ?? {};

  if (typeof website === 'string' && website.trim()) {
    return response.status(202).json({ ok: true });
  }

  if (
    typeof name !== 'string' || name.trim().length < 2 || name.length > 100 ||
    typeof email !== 'string' || email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    typeof message !== 'string' || message.trim().length < 10 || message.length > 5000
  ) {
    return response.status(400).json({ error: 'Please check your name, email, and message.' });
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, CONTACT_TO, CONTACT_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !CONTACT_TO || !CONTACT_FROM) {
    return response.status(503).json({
      error: 'The contact form is not configured yet. Please email boluwatifeadek1@gmail.com directly.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT) || 587,
      secure: SMTP_SECURE === 'true',
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    await transporter.sendMail({
      from: CONTACT_FROM,
      to: CONTACT_TO,
      replyTo: { name: name.trim(), address: email.trim() },
      subject: `Portfolio inquiry from ${name.trim()}`,
      text: `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    });

    return response.status(200).json({ ok: true, message: 'Message sent. Thank you for reaching out.' });
  } catch (error) {
    console.error('Contact email delivery failed:', error.message);
    return response.status(502).json({
      error: 'Your message could not be delivered right now. Please email directly instead.',
    });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => console.log(`Portfolio running at http://localhost:${port}`));
}

module.exports = app;