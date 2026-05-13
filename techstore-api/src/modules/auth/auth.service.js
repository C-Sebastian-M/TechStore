// ─── AuthService — S: una sola responsabilidad: autenticación ────────────────────
// Solo maneja: registro con email, verificación de código, login, Google OAuth.
// Perfil y direcciones viven en sus propios servicios (profile.service, address.service).
//
// D: depende de abstracciones (TokenService, PasswordService, EmailService, RecaptchaService)
//    no de implementaciones concretas (jwt, bcrypt, nodemailer, google-auth-library).

import { OAuth2Client } from "google-auth-library";
import prisma from "../../config/prisma.js";
import { TokenService } from "../../shared/utils/TokenService.js";
import { PasswordService } from "../../shared/utils/PasswordService.js";
import { EmailService } from "./email.service.js";
import { RecaptchaService } from "./recaptcha.service.js";
import {
  ConflictError,
  ValidationError,
  UnauthorizedError,
  TooManyRequestsError,
} from "../../shared/errors/AppError.js";

// D: la dependencia de Google se instancia una vez — fácil de mockear en tests
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const MAX_VERIFY_ATTEMPTS = 5;

const PUBLIC_USER_FIELDS = {
  id: true,
  email: true,
  name: true,
  phone: true,
  birthDate: true,
  role: true,
  googleAuth: true,
  createdAt: true,
};

// ─── PASO 1: ENVIAR CÓDIGO DE VERIFICACIÓN ───────────────────────────────────
export async function sendVerificationCode({
  name,
  email,
  password,
  recaptchaToken,
}) {
  // D: depende de RecaptchaService, no de fetch+Google directamente
  await RecaptchaService.verify(recaptchaToken);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new ConflictError("Ya existe una cuenta con ese email.");

  // Rate limit por email: 60s entre reenvíos
  const pending = await prisma.emailVerification.findUnique({
    where: { email },
  });
  if (pending) {
    const secondsSinceSent =
      (Date.now() - new Date(pending.createdAt).getTime()) / 1000;
    if (secondsSinceSent < 60) {
      const wait = Math.ceil(60 - secondsSinceSent);
      throw new TooManyRequestsError(
        `Espera ${wait} segundo${wait !== 1 ? "s" : ""} antes de solicitar un nuevo código.`,
      );
    }
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  // D: depende de PasswordService, no de bcrypt directamente
  const hashedPassword = await PasswordService.hash(password);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.emailVerification.upsert({
    where: { email },
    update: { name, password: hashedPassword, code, expiresAt, attempts: 0 },
    create: { email, name, password: hashedPassword, code, expiresAt },
  });

  // D: depende de EmailService, no de nodemailer directamente
  await EmailService.sendVerificationCode(email, name, code);
  return { message: "Código enviado. Revisa tu correo." };
}

// ─── PASO 2: VERIFICAR CÓDIGO Y CREAR CUENTA ─────────────────────────────────
export async function verifyCodeAndRegister({ email, code }) {
  const record = await prisma.emailVerification.findUnique({
    where: { email },
  });

  if (!record)
    throw new ValidationError("No hay verificación pendiente para este email.");

  if (new Date() > record.expiresAt) {
    await prisma.emailVerification.delete({ where: { email } });
    throw new ValidationError("El código expiró. Solicita uno nuevo.");
  }

  if (record.attempts >= MAX_VERIFY_ATTEMPTS) {
    await prisma.emailVerification.delete({ where: { email } });
    throw new TooManyRequestsError(
      "Demasiados intentos fallidos. Solicita un nuevo código.",
    );
  }

  if (record.code !== code.trim()) {
    await prisma.emailVerification.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    const remaining = MAX_VERIFY_ATTEMPTS - record.attempts - 1;
    throw new ValidationError(
      remaining > 0
        ? `Código incorrecto. Te quedan ${remaining} intento${remaining !== 1 ? "s" : ""}.`
        : "Código incorrecto. Se agotaron los intentos, solicita uno nuevo.",
    );
  }

  const [user] = await prisma.$transaction([
    prisma.user.create({
      data: { name: record.name, email, password: record.password },
      select: PUBLIC_USER_FIELDS,
    }),
    prisma.emailVerification.delete({ where: { email } }),
  ]);

  const token = TokenService.generate(user.id);
  return { user, token };
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  const INVALID_MSG = "Email o contraseña incorrectos.";

  if (!user) {
    // Comparación dummy para evitar timing attacks
    await PasswordService.compare(
      password,
      "$2b$10$invalidhashplaceholderfortimingg",
    );
    throw new UnauthorizedError(INVALID_MSG);
  }

  const isMatch = await PasswordService.compare(password, user.password);
  if (!isMatch) throw new UnauthorizedError(INVALID_MSG);

  const { password: _pw, ...publicUser } = user;
  const token = TokenService.generate(user.id);
  return { user: publicUser, token };
}

// ─── GOOGLE OAUTH ─────────────────────────────────────────────────────────────
export async function loginWithGoogle(credential) {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch {
    throw new UnauthorizedError("Token de Google inválido.");
  }

  if (!payload?.email_verified)
    throw new UnauthorizedError("El correo de Google no está verificado.");

  const email = payload.email.toLowerCase();
  const name = payload.name || payload.given_name || email.split("@")[0];

  let user = await prisma.user.findUnique({
    where: { email },
    select: PUBLIC_USER_FIELDS,
  });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        googleAuth: true,
        password: await PasswordService.hash(PasswordService.generateRandom()),
      },
      select: PUBLIC_USER_FIELDS,
    });
  }

  const token = TokenService.generate(user.id);
  return { user, token };
}
