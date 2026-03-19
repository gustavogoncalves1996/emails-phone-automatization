/* eslint-disable no-undef */
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

const app = express();
app.use(cors());
app.use(express.json());

// ── SMTP Transporter (Outlook / Hotmail) ──
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-mail.outlook.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false,
  },
});

// Verificar conexão ao arrancar
transporter.verify((err) => {
  if (err) {
    console.error('❌ Erro na ligação SMTP:', err.message);
    console.error('   Verifique as credenciais no ficheiro .env');
  } else {
    console.log('✅ SMTP conectado —', process.env.SMTP_USER);
  }
});

// ── Rota: enviar um email ──
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, html, nomeEmpresa } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: to, subject, html',
      });
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    });

    console.log(`📧 Email enviado para ${to} (${nomeEmpresa || 'N/A'}) — ${info.messageId}`);

    res.json({ success: true, messageId: info.messageId });
  } catch (err) {
    console.error('❌ Erro ao enviar email:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Rota: enviar emails em lote ──
app.post('/api/send-emails-batch', async (req, res) => {
  try {
    const { emails } = req.body; // Array de { to, subject, html, nomeEmpresa }

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Campo obrigatório: emails (array)',
      });
    }

    const results = [];

    for (const email of emails) {
      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || process.env.SMTP_USER,
          to: email.to,
          subject: email.subject,
          html: email.html,
        });

        console.log(`📧 Email enviado para ${email.to} — ${info.messageId}`);
        results.push({
          to: email.to,
          success: true,
          messageId: info.messageId,
        });
      } catch (err) {
        console.error(`❌ Falha ao enviar para ${email.to}:`, err.message);
        results.push({
          to: email.to,
          success: false,
          error: err.message,
        });
      }

      // Pequeno delay entre envios para não ser bloqueado
      await new Promise((r) => setTimeout(r, 1500));
    }

    res.json({ success: true, results });
  } catch (err) {
    console.error('❌ Erro no batch:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Health check ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', smtp: process.env.SMTP_USER });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 API de emails a correr em http://localhost:${PORT}`);
});
