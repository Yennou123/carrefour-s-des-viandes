
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LENGTH = 1000;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const inMemoryHits = new Map<string, { count: number; resetAt: number }>();

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const current = inMemoryHits.get(key);
  if (!current || current.resetAt <= now) {
    inMemoryHits.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }
  current.count += 1;
  inMemoryHits.set(key, current);
  return current.count > RATE_LIMIT_MAX;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Méthode non autorisée" });
  }

  const { name, email, message } = req.body;
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (isRateLimited(clientIp)) {
    return res.status(429).json({ message: "Trop de requêtes. Réessayez plus tard." });
  }

  if (!name || !email || !message) {
    return res.status(400).json({ message: "Tous les champs sont requis" });
  }
  if (!emailRegex.test(String(email).trim().toLowerCase())) {
    return res.status(400).json({ message: "Format d'email invalide" });
  }
  if (
    String(name).length > 120 ||
    String(email).length > 254 ||
    String(message).length > MAX_FIELD_LENGTH
  ) {
    return res.status(400).json({ message: "Un ou plusieurs champs dépassent la taille autorisée" });
  }

  const safeName = escapeHtml(String(name).trim());
  const safeEmail = escapeHtml(String(email).trim().toLowerCase());
  const safeMessage = escapeHtml(String(message).trim());

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      replyTo: safeEmail,
      to: "azariaouedraogo44@gmail.com",
      subject: `Nouveau message de ${safeName}`,
      html: `
        <h3>Nouveau message</h3>
        <p><strong>Nom:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Message:</strong><br/> ${safeMessage}</p>
      `,
    });

    return res.status(200).json({ message: "Message envoyé avec succès" });

  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur" });
  }
}