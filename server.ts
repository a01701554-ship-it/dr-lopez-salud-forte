import express, { Request, Response } from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { createClient } from '@supabase/supabase-js';
import { academyDb } from './lib/academy/db';
import {
  verifyShopifyWebhookHmac,
  verifyShopifyAppProxySignature,
  generateCloudflareStreamToken,
  generateGuestClaimToken,
  verifyGuestClaimToken,
} from './lib/academy/security';
import { Course, Entitlement, ProcessedWebhook, StudentSession } from './lib/academy/types';
import {
  hashPassword,
  verifyPassword,
  generateSecureToken,
  hashToken,
  extractYouTubeVideoId,
  buildYouTubeEmbedUrl,
  generateTotpSecret,
  verifyTotpCode,
} from './lib/academy/auth-service';

const PORT = 3000;

// Cookie & Token Helper Functions
function parseCookies(req: Request): Record<string, string> {
  const list: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach((cookie) => {
    let [name, ...rest] = cookie.split('=');
    name = name?.trim();
    if (!name) return;
    const value = rest.join('=').trim();
    list[name] = decodeURIComponent(value);
  });
  return list;
}

function setSessionCookie(res: Response, sessionId: string) {
  const maxAge = 14 * 24 * 60 * 60; // 14 days in seconds
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    `sf_session=${encodeURIComponent(sessionId)}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=${maxAge}`,
    isProd ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

function clearSessionCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  const cookieOptions = [
    `sf_session=`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    `Max-Age=0`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    isProd ? 'Secure' : '',
  ].filter(Boolean).join('; ');

  res.setHeader('Set-Cookie', cookieOptions);
}

function base64UrlEncode(buffer: Buffer): string {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generatePkce() {
  const codeVerifier = base64UrlEncode(crypto.randomBytes(32));
  const codeChallenge = base64UrlEncode(
    crypto.createHash('sha256').update(codeVerifier).digest()
  );
  return { codeVerifier, codeChallenge };
}

async function startServer() {
  const app = express();

  // Parse raw body for Webhooks before standard JSON parser
  app.use(
    '/api/webhooks/shopify',
    express.raw({ type: 'application/json' })
  );

  // JSON parser for all other routes
  app.use(express.json());

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      service: 'Salud Forte Medical & Academy Platform',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // ============================================================================
  // DOCTOR MAURICIO GALINDO & ADMIN INITIALIZATION
  // ============================================================================
  const DOCTOR_EMAIL = 'dr.mauricio.galindo@saludforte.com';
  let doctorUser = academyDb.getUserByEmail(DOCTOR_EMAIL);
  if (!doctorUser) {
    hashPassword('GalindoSaludForte2026!').then((hash) => {
      academyDb.saveUser({
        id: 'usr_doc_mauricio_galindo',
        email: DOCTOR_EMAIL,
        full_name: 'Dr. Mauricio Benjamín Galindo López',
        first_name: 'Mauricio Benjamín',
        last_name: 'Galindo López',
        role: 'ADMIN',
        email_verified: true,
        email_verified_at: new Date().toISOString(),
        password_hash: hash,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        marketing_consent: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      console.log('[Auth Init] Initialized Dr. Mauricio Galindo default administrator account.');
    }).catch(console.error);
  }

  // Helper to send transactional emails via Resend or log to console
  const sendTransactionalEmail = async (to: string, subject: string, html: string) => {
    const hasEmailConfig =
      process.env.RESEND_API_KEY &&
      process.env.EMAIL_FROM_ADDRESS &&
      !process.env.RESEND_API_KEY.includes('replace_with');

    if (hasEmailConfig) {
      try {
        const { Resend } = await import('resend');
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: `${process.env.EMAIL_FROM_NAME || 'Dr. Mauricio Galindo | Salud Forte'} <${process.env.EMAIL_FROM_ADDRESS}>`,
          to: [to],
          subject,
          html,
        });
        console.log(`[Email Service] Sent email to ${to}: "${subject}"`);
        return true;
      } catch (err) {
        console.error(`[Email Service] Error sending email to ${to}:`, err);
        return false;
      }
    } else {
      console.log(`\n================ TRANSACTIONAL EMAIL ================`);
      console.log(`TO: ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`=====================================================\n`);
      return false;
    }
  };

  // ============================================================================
  // SECURE AUTHENTICATION SYSTEM (ARGON2ID & PERSISTENT COOKIES)
  // ============================================================================

  // 1. Register Account (/api/auth/register)
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { first_name, last_name, email, password, confirm_password, terms_accepted, marketing_consent } = req.body;

      if (!first_name || !last_name || !email || !password || !confirm_password) {
        return res.status(400).json({ error: 'Por favor completa todos los campos requeridos.' });
      }

      if (!terms_accepted) {
        return res.status(400).json({ error: 'Debes aceptar los Términos de Servicio y el Aviso de Privacidad.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      if (!normalizedEmail.includes('@') || normalizedEmail.length < 5) {
        return res.status(400).json({ error: 'Proporciona un correo electrónico válido.' });
      }

      if (password.length < 10) {
        return res.status(400).json({ error: 'La contraseña debe tener al menos 10 caracteres.' });
      }

      if (password.length > 128) {
        return res.status(400).json({ error: 'La contraseña no puede exceder 128 caracteres.' });
      }

      if (password !== confirm_password) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
      }

      // Check if user already exists
      const existingUser = academyDb.getUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(400).json({
          error: 'Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.',
        });
      }

      // Hash password using Argon2id
      const passwordHash = await hashPassword(password);

      // Generate cryptographically secure verification token
      const { token: rawToken, hash: tokenHash, expiresAt: tokenExpiresAt } = generateSecureToken(24);

      // Determine role: Doctor emails receive ADMIN & INSTRUCTOR
      const isDoctorEmail =
        normalizedEmail === DOCTOR_EMAIL ||
        normalizedEmail === 'contacto@saludforte.com' ||
        (process.env.DOCTOR_ADMIN_EMAIL && normalizedEmail === process.env.DOCTOR_ADMIN_EMAIL.toLowerCase().trim());

      const fullName = `${first_name.trim()} ${last_name.trim()}`;
      const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      const newUser = academyDb.saveUser({
        id: userId,
        email: normalizedEmail,
        normalized_email: normalizedEmail,
        full_name: fullName,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: isDoctorEmail ? 'ADMIN' : 'CUSTOMER',
        status: 'ACTIVE',
        email_verified: false,
        password_hash: passwordHash,
        verification_token_hash: tokenHash,
        verification_token_expires_at: tokenExpiresAt,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        privacy_accepted: true,
        privacy_accepted_at: new Date().toISOString(),
        marketing_consent: !!marketing_consent,
        marketing_consent_at: marketing_consent ? new Date().toISOString() : undefined,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      // Construct verification URL
      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const verificationUrl = `${appUrl}/cuenta/verificar-correo?token=${rawToken}`;

      // Verification email HTML template
      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F0; color: #0C1A24; margin: 0; padding: 24px; }
            .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(179, 154, 106, 0.25); overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            .header { background-color: #0C1A24; padding: 32px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0 0 6px 0; font-family: Georgia, serif; font-size: 24px; color: #B39A6A; font-weight: normal; }
            .header p { margin: 0; font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #E0DACB; }
            .content { padding: 32px; font-size: 14px; line-height: 1.6; color: #0C1A24; }
            .button-wrap { text-align: center; margin: 28px 0; }
            .btn { display: inline-block; background-color: #0C1A24; color: #ffffff !important; font-size: 12px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; text-decoration: none; padding: 14px 32px; border-radius: 9999px; }
            .notice { font-size: 12px; color: #64748b; background: #f8fafc; padding: 16px; border-radius: 10px; margin-top: 24px; border: 1px solid #e2e8f0; }
            .footer { background: #fafaf9; padding: 20px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid rgba(179, 154, 106, 0.15); }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Salud Forte</h1>
              <p>Dr. Mauricio Galindo &bull; Plataforma Médica</p>
            </div>
            <div class="content">
              <p>Hola <strong>${first_name}</strong>,</p>
              <p>Gracias por crear tu cuenta en Salud Forte. Para proteger la privacidad de tu historial médico, tus compras y tus masterclasses, por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
              <div class="button-wrap">
                <a href="${verificationUrl}" class="btn">VERIFICAR MI CORREO ELECTRÓNICO</a>
              </div>
              <p style="font-size: 12px; color: #64748b;">Si el botón no funciona, copia y pega este enlace en tu navegador:<br><a href="${verificationUrl}" style="color: #B39A6A; word-break: break-all;">${verificationUrl}</a></p>
              <div class="notice">
                <strong>Seguridad y Privacidad:</strong> Este enlace es personal, de un solo uso y expira en 24 horas.
              </div>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} Salud Forte &bull; Dr. Mauricio Benjamín Galindo López. Todos los derechos reservados.
            </div>
          </div>
        </body>
        </html>
      `;

      await sendTransactionalEmail(normalizedEmail, 'Verifica tu correo electrónico - Salud Forte', emailHtml);

      console.log(`[Registration] User registered: ${normalizedEmail} (ID: ${userId})`);
      console.log(`[Verification Link]: ${verificationUrl}`);

      // Create persistent session so user is logged in
      const session = academyDb.createServerSession({
        userId: newUser.id,
        email: newUser.email,
        full_name: newUser.full_name,
        role: newUser.role,
        ttlDays: 14,
      });

      setSessionCookie(res, session.sessionId);

      return res.status(201).json({
        success: true,
        message: 'Cuenta creada exitosamente. Hemos enviado un enlace de verificación a tu correo electrónico.',
        verificationUrl,
        verificationToken: rawToken,
        user: {
          id: newUser.id,
          email: newUser.email,
          full_name: newUser.full_name,
          first_name: newUser.first_name,
          last_name: newUser.last_name,
          role: newUser.role,
          email_verified: newUser.email_verified,
          marketing_consent: newUser.marketing_consent,
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
        },
      });
    } catch (err: any) {
      console.error('[Registration Error]', err);
      return res.status(500).json({ error: 'Ocurrió un error al procesar el registro.' });
    }
  });

  // 2. Login with Email & Password (/api/auth/login)
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Proporciona tu correo electrónico y contraseña.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = academyDb.getUserByEmail(normalizedEmail);

      // Check account lockout status
      if (user && user.status === 'LOCKED' && user.locked_until && user.locked_until > Date.now()) {
        const minutesLeft = Math.ceil((user.locked_until - Date.now()) / (60 * 1000));
        return res.status(423).json({
          error: `Tu cuenta se encuentra bloqueada temporalmente por seguridad debido a múltiples intentos fallidos. Intenta nuevamente en ${minutesLeft} minutos o recupera tu contraseña.`,
        });
      }

      // Prevent email enumeration: constant-time or generic failure
      if (!user || !user.password_hash) {
        return res.status(401).json({ error: 'Correo electrónico o contraseña incorrectos.' });
      }

      const isPasswordValid = await verifyPassword(user.password_hash, password);
      if (!isPasswordValid) {
        const attemptResult = academyDb.recordLoginAttempt(normalizedEmail, false);
        if (attemptResult.locked) {
          return res.status(423).json({
            error: 'Has superado el límite de intentos fallidos. Por seguridad, tu cuenta ha sido bloqueada temporalmente por 15 minutos.',
          });
        }
        return res.status(401).json({
          error: attemptResult.remainingAttempts !== undefined
            ? `Correo electrónico o contraseña incorrectos. (${attemptResult.remainingAttempts} intentos restantes)`
            : 'Correo electrónico o contraseña incorrectos.',
        });
      }

      // Reset failed attempts on success
      academyDb.recordLoginAttempt(normalizedEmail, true);

      // Update last login timestamp
      user.last_login_at = new Date().toISOString();
      academyDb.saveUser(user);

      // Create persistent server session (14 days)
      const session = academyDb.createServerSession({
        userId: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        shopifyCustomerGid: user.shopifyCustomerGid,
        mfaVerified: !user.mfa_enabled,
        ttlDays: 14,
      });

      // Set secure HttpOnly cookie
      setSessionCookie(res, session.sessionId);

      // Log access audit
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: 'salud-forte',
        customerGid: user.shopifyCustomerGid || `usr_${user.id}`,
        action: 'user_login',
        result: 'granted',
        createdAt: new Date().toISOString(),
      });

      return res.json({
        success: true,
        message: 'Sesión iniciada correctamente.',
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          email_verified: user.email_verified,
          marketing_consent: user.marketing_consent,
          mfa_enabled: !!user.mfa_enabled,
          shopifyCustomerGid: user.shopifyCustomerGid,
        },
        session: {
          sessionId: session.sessionId,
          expiresAt: session.expiresAt,
        },
      });
    } catch (err: any) {
      console.error('[Login Error]', err);
      return res.status(500).json({ error: 'Error interno al procesar el inicio de sesión.' });
    }
  });

  // 3. Verify Email Address (/api/auth/verify-email)
  app.post('/api/auth/verify-email', (req: Request, res: Response) => {
    try {
      const { token } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Token de verificación no proporcionado.' });
      }

      const tokenHash = hashToken(token);
      const user = academyDb.getUserByVerificationToken(tokenHash);

      if (!user) {
        return res.status(400).json({ error: 'El enlace de verificación es inválido o ha expirado.' });
      }

      if (user.verification_token_expires_at && Date.now() > user.verification_token_expires_at) {
        return res.status(400).json({ error: 'El enlace de verificación ha expirado. Solicita uno nuevo.' });
      }

      // Mark verified
      user.email_verified = true;
      user.email_verified_at = new Date().toISOString();
      user.verification_token_hash = undefined;
      user.verification_token_expires_at = undefined;
      academyDb.saveUser(user);

      // Automatically link any past entitlements for this verified email
      const linkedEntitlements = academyDb.getEntitlementsForCustomer('', user.email);
      if (linkedEntitlements.length > 0 && !user.shopifyCustomerGid) {
        user.shopifyCustomerGid = linkedEntitlements[0].customerGid;
        academyDb.saveUser(user);
      }

      console.log(`[Email Verified] Email confirmed for ${user.email}. Linked courses: ${linkedEntitlements.length}`);

      return res.json({
        success: true,
        message: 'Tu correo electrónico ha sido verificado satisfactoriamente.',
      });
    } catch (err: any) {
      console.error('[Verify Email Error]', err);
      return res.status(500).json({ error: 'Error al verificar el correo electrónico.' });
    }
  });

  // 4. Request Password Reset (/api/auth/forgot-password)
  app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Proporciona tu correo electrónico.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = academyDb.getUserByEmail(normalizedEmail);

      // Generic response to avoid account enumeration
      const genericMsg = 'Si existe una cuenta asociada a este correo, recibirás un enlace seguro para restablecer tu contraseña.';

      if (user) {
        const { token: resetToken, hash: resetTokenHash, expiresAt: resetExpiresAt } = generateSecureToken(1);
        user.reset_token_hash = resetTokenHash;
        user.reset_token_expires_at = resetExpiresAt;
        academyDb.saveUser(user);

        const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
        const resetUrl = `${appUrl}/cuenta/reset-password?token=${resetToken}`;

        const resetEmailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F6F0; color: #0C1A24; margin: 0; padding: 24px; }
              .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(179, 154, 106, 0.25); overflow: hidden; }
              .header { background: #0C1A24; padding: 32px; text-align: center; color: #ffffff; }
              .header h1 { margin: 0; font-family: Georgia, serif; font-size: 24px; color: #B39A6A; }
              .content { padding: 32px; font-size: 14px; line-height: 1.6; }
              .btn { display: inline-block; background: #0C1A24; color: #ffffff !important; font-size: 12px; font-weight: 600; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 9999px; margin: 24px 0; }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="header">
                <h1>Salud Forte</h1>
              </div>
              <div class="content">
                <p>Hola <strong>${user.full_name}</strong>,</p>
                <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Salud Forte.</p>
                <div style="text-align: center;">
                  <a href="${resetUrl}" class="btn">RESTABLECER MI CONTRASEÑA</a>
                </div>
                <p style="font-size: 12px; color: #64748b;">Este enlace es válido durante <strong>1 hora</strong> y solo puede utilizarse una vez. Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
              </div>
            </div>
          </body>
          </html>
        `;

        await sendTransactionalEmail(normalizedEmail, 'Restablecimiento de contraseña - Salud Forte', resetEmailHtml);
        console.log(`[Password Reset Link for ${normalizedEmail}]: ${resetUrl}`);
      }

      return res.json({ success: true, message: genericMsg });
    } catch (err: any) {
      console.error('[Forgot Password Error]', err);
      return res.status(500).json({ error: 'Error al procesar la solicitud de restablecimiento.' });
    }
  });

  // 5. Submit New Password (/api/auth/reset-password)
  app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
    try {
      const { token, password, confirm_password } = req.body;

      if (!token || !password || !confirm_password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
      }

      if (password.length < 10) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 10 caracteres.' });
      }

      if (password !== confirm_password) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden.' });
      }

      const tokenHash = hashToken(token);
      const user = academyDb.getUserByResetToken(tokenHash);

      if (!user) {
        return res.status(400).json({ error: 'El enlace de restablecimiento es inválido o ha expirado.' });
      }

      if (user.reset_token_expires_at && Date.now() > user.reset_token_expires_at) {
        return res.status(400).json({ error: 'El enlace de restablecimiento ha expirado. Solicita uno nuevo.' });
      }

      // Hash new password using Argon2id
      user.password_hash = await hashPassword(password);
      user.reset_token_hash = undefined;
      user.reset_token_expires_at = undefined;
      user.password_changed_at = new Date().toISOString();
      user.failed_login_attempts = 0;
      user.locked_until = undefined;
      if (user.status === 'LOCKED') user.status = 'ACTIVE';
      user.updated_at = new Date().toISOString();
      academyDb.saveUser(user);

      // Invalidate all existing sessions for security
      academyDb.destroyAllUserSessions(user.id);

      console.log(`[Password Reset] Password updated successfully for user ${user.email}`);

      return res.json({
        success: true,
        message: 'Tu contraseña ha sido actualizada con éxito. Ya puedes iniciar sesión con tu nueva clave.',
      });
    } catch (err: any) {
      console.error('[Reset Password Error]', err);
      return res.status(500).json({ error: 'Error al actualizar la contraseña.' });
    }
  });

  // 5.1 Resend Email Verification (/api/auth/resend-verification)
  app.post('/api/auth/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Proporciona tu correo electrónico.' });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = academyDb.getUserByEmail(normalizedEmail);

      if (!user) {
        return res.json({
          success: true,
          message: 'Si tu cuenta existe y aún no ha sido verificada, te hemos enviado un nuevo enlace.',
        });
      }

      if (user.email_verified) {
        return res.json({
          success: true,
          message: 'Tu correo electrónico ya se encuentra verificado. Puedes acceder a tu cuenta con normalidad.',
        });
      }

      const { token: rawToken, hash: tokenHash, expiresAt: tokenExpiresAt } = generateSecureToken(24);
      user.verification_token_hash = tokenHash;
      user.verification_token_expires_at = tokenExpiresAt;
      academyDb.saveUser(user);

      const appUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
      const verificationUrl = `${appUrl}/cuenta/verificar-correo?token=${rawToken}`;

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #F8F6F0; color: #0C1A24; margin: 0; padding: 24px; }
            .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid rgba(179, 154, 106, 0.25); overflow: hidden; }
            .header { background-color: #0C1A24; padding: 32px; text-align: center; color: #ffffff; }
            .header h1 { margin: 0; font-family: Georgia, serif; font-size: 24px; color: #B39A6A; }
            .content { padding: 32px; font-size: 14px; line-height: 1.6; }
            .btn { display: inline-block; background: #0C1A24; color: #ffffff !important; font-size: 12px; font-weight: 600; text-transform: uppercase; text-decoration: none; padding: 14px 28px; border-radius: 9999px; margin: 24px 0; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>Salud Forte</h1>
            </div>
            <div class="content">
              <p>Hola <strong>${user.full_name}</strong>,</p>
              <p>Has solicitado un nuevo enlace para verificar tu correo electrónico en Salud Forte.</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="btn">VERIFICAR MI CORREO ELECTRÓNICO</a>
              </div>
              <p style="font-size: 12px; color: #64748b;">Este enlace es personal y expira en 24 horas.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      await sendTransactionalEmail(normalizedEmail, 'Verifica tu correo electrónico - Salud Forte', emailHtml);
      console.log(`[Resend Verification for ${normalizedEmail}]: ${verificationUrl}`);

      return res.json({
        success: true,
        message: 'Hemos enviado un nuevo enlace de verificación a tu correo.',
        verificationUrl,
      });
    } catch (err: any) {
      console.error('[Resend Verification Error]', err);
      return res.status(500).json({ error: 'Error al enviar enlace de verificación.' });
    }
  });

  // 5.2 Change Password (/api/auth/change-password)
  app.post('/api/auth/change-password', async (req: Request, res: Response) => {
    try {
      const cookies = parseCookies(req);
      const sessionId = cookies.sf_session;
      if (!sessionId) {
        return res.status(401).json({ error: 'Debes iniciar sesión para cambiar tu contraseña.' });
      }

      const session = academyDb.getServerSession(sessionId);
      if (!session) {
        return res.status(401).json({ error: 'Sesión no válida o expirada.' });
      }

      const { current_password, new_password, confirm_password } = req.body;
      if (!current_password || !new_password || !confirm_password) {
        return res.status(400).json({ error: 'Todos los campos son requeridos.' });
      }

      if (new_password.length < 10) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 10 caracteres.' });
      }

      if (new_password !== confirm_password) {
        return res.status(400).json({ error: 'Las contraseñas nuevas no coinciden.' });
      }

      const user = academyDb.getUserById(session.userId) || academyDb.getUserByEmail(session.email);
      if (!user || !user.password_hash) {
        return res.status(400).json({ error: 'Usuario no encontrado o sin contraseña configurada.' });
      }

      const isCurrentValid = await verifyPassword(user.password_hash, current_password);
      if (!isCurrentValid) {
        return res.status(400).json({ error: 'La contraseña actual no es correcta.' });
      }

      user.password_hash = await hashPassword(new_password);
      user.password_changed_at = new Date().toISOString();
      user.updated_at = new Date().toISOString();
      academyDb.saveUser(user);

      return res.json({
        success: true,
        message: 'Contraseña cambiada exitosamente.',
      });
    } catch (err: any) {
      console.error('[Change Password Error]', err);
      return res.status(500).json({ error: 'Error al cambiar la contraseña.' });
    }
  });

  // 6. Get Current Authenticated Session & Profile (/api/auth/me)
  app.get('/api/auth/me', (req: Request, res: Response) => {
    const cookies = parseCookies(req);
    let sessionId = cookies.sf_session;

    if (!sessionId && req.headers.authorization?.startsWith('Bearer ')) {
      sessionId = req.headers.authorization.split(' ')[1];
    }

    if (!sessionId) {
      return res.status(401).json({ authenticated: false, message: 'No hay sesión activa.' });
    }

    const session = academyDb.getServerSession(sessionId);
    if (!session) {
      clearSessionCookie(res);
      return res.status(401).json({ authenticated: false, message: 'Sesión expirada o no válida.' });
    }

    let user = academyDb.getUserById(session.userId) || academyDb.getUserByEmail(session.email);
    if (!user) {
      user = academyDb.saveUser({
        id: session.userId,
        email: session.email,
        full_name: session.full_name,
        role: (session.role as any) || 'CUSTOMER',
        email_verified: true,
        terms_accepted: true,
        created_at: new Date(session.createdAt).toISOString(),
      });
    }

    // Check entitlements
    const entitlements = academyDb.getEntitlementsForCustomer(
      user.shopifyCustomerGid || `customer_${user.id}`,
      user.email
    );

    return res.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        email_verified: user.email_verified,
        marketing_consent: user.marketing_consent,
        mfa_enabled: !!user.mfa_enabled,
        shopifyCustomerGid: user.shopifyCustomerGid,
      },
      profile: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        email_verified: user.email_verified,
        shopifyCustomerGid: user.shopifyCustomerGid,
      },
      entitlementsCount: entitlements.filter((e) => e.status === 'active').length,
      session: {
        sessionId: session.sessionId,
        expiresAt: session.expiresAt,
      },
    });
  });

  // 7. Logout Endpoint (/api/auth/logout)
  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const cookies = parseCookies(req);
    const sessionId = cookies.sf_session;

    if (sessionId) {
      academyDb.destroyServerSession(sessionId);
    }

    clearSessionCookie(res);

    return res.json({
      success: true,
      message: 'Has cerrado sesión correctamente.',
    });
  });

  // 8. Bootstrap / Promote Doctor Mauricio Galindo as Admin
  app.post('/api/admin/doctor/bootstrap', async (req: Request, res: Response) => {
    try {
      const { email, password, key } = req.body;
      const expectedKey = process.env.ADMIN_BOOTSTRAP_KEY || 'SaludForteDoctorAdmin2026!';

      if (!key || key !== expectedKey) {
        return res.status(403).json({ error: 'Clave maestra de autorización inválida.' });
      }

      const targetEmail = (email || DOCTOR_EMAIL).toLowerCase().trim();
      let user = academyDb.getUserByEmail(targetEmail);

      const passwordHash = password ? await hashPassword(password) : await hashPassword('GalindoSaludForte2026!');

      if (user) {
        user.role = 'ADMIN';
        user.email_verified = true;
        user.password_hash = passwordHash;
        user.updated_at = new Date().toISOString();
        academyDb.saveUser(user);
      } else {
        user = academyDb.saveUser({
          id: 'usr_doc_mauricio_galindo',
          email: targetEmail,
          full_name: 'Dr. Mauricio Benjamín Galindo López',
          first_name: 'Mauricio Benjamín',
          last_name: 'Galindo López',
          role: 'ADMIN',
          email_verified: true,
          password_hash: passwordHash,
          terms_accepted: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return res.json({
        success: true,
        message: `Cuenta del Dr. Mauricio Galindo (${targetEmail}) configurada con privilegios de ADMINISTRADOR e INSTRUCTOR.`,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // ============================================================================
  // CAPA 2 & 3: SHOPIFY OFFICIAL WEBHOOKS (orders/paid, refunds/create, etc.)
  // ============================================================================
  app.post('/api/webhooks/shopify', async (req: Request, res: Response) => {
    const hmacHeader = req.header('x-shopify-hmac-sha256');
    const topic = req.header('x-shopify-topic');
    const shop = req.header('x-shopify-shop-domain') || 'salud-forte.myshopify.com';
    const webhookId = req.header('x-shopify-webhook-id') || `wh_${Date.now()}`;
    const rawBody = req.body;

    const webhookSecret =
      process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET || '';

    // If secret exists, strictly verify HMAC
    if (webhookSecret && !webhookSecret.includes('replace_with')) {
      const isValid = verifyShopifyWebhookHmac(rawBody, hmacHeader, webhookSecret);
      if (!isValid) {
        console.warn(`[Security] Rejected unauthorized Shopify webhook ${webhookId} for topic ${topic}`);
        academyDb.logAccessAudit({
          id: `audit_${Date.now()}`,
          shop,
          customerGid: 'system',
          courseId: 'none',
          action: 'catalog_view',
          result: 'denied',
          reason: `Invalid webhook HMAC signature for ${topic}`,
          createdAt: new Date().toISOString(),
        });
        return res.status(401).send('Unauthorized: Invalid HMAC signature');
      }
    } else {
      console.log(`[Dev Webhook] Running in dev mode without SHOPIFY_WEBHOOK_SECRET: processing topic ${topic}`);
    }

    // Idempotency: Ignore duplicate webhook deliveries
    if (academyDb.isWebhookProcessed(webhookId)) {
      console.log(`[Webhook] Duplicate webhook ${webhookId} already processed. Skipping.`);
      return res.status(200).json({ status: 'already_processed' });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody.toString('utf8'));
    } catch (err) {
      return res.status(400).send('Malformed JSON');
    }

    try {
      if (topic === 'orders/paid') {
        const orderGid = payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`;
        const orderNumber = payload.name || `#${payload.order_number}`;
        const customerGid =
          payload.customer?.admin_graphql_api_id ||
          (payload.customer?.id ? `gid://shopify/Customer/${payload.customer.id}` : `gid://shopify/Customer/guest_${Date.now()}`);
        const customerEmail = payload.email || payload.customer?.email || 'cliente@saludforte.com';
        const customerName = payload.customer
          ? `${payload.customer.first_name || ''} ${payload.customer.last_name || ''}`.trim()
          : undefined;

        const lineItems = payload.line_items || [];
        let grantedCount = 0;

        for (const item of lineItems) {
          const variantGid = `gid://shopify/ProductVariant/${item.variant_id}`;
          const course = academyDb.getCourseByVariantGid(variantGid);

          if (course) {
            const lineItemGid = `gid://shopify/LineItem/${item.id}`;
            academyDb.grantEntitlement({
              shop,
              customerGid,
              customerEmail,
              customerName,
              courseId: course.id,
              orderGid,
              orderNumber,
              lineItemGid,
            });
            grantedCount++;
            console.log(`[Webhook] Entitlement GRANTED to ${customerEmail} for course "${course.title}" (Order ${orderNumber})`);
          }
        }

        academyDb.recordWebhook({
          id: `pwh_${Date.now()}`,
          shop,
          webhookId,
          topic: 'orders/paid',
          receivedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          status: 'success',
          payloadSummary: `Order ${orderNumber} processed: ${grantedCount} masterclasses granted`,
        });

        return res.status(200).json({ status: 'success', granted: grantedCount });
      }

      if (topic === 'refunds/create') {
        const orderId = payload.order_id;
        const orderGid = `gid://shopify/Order/${orderId}`;
        const refundLineItems = payload.refund_line_items || [];

        let revokedCount = 0;
        if (refundLineItems.length > 0) {
          // Line-item specific refund
          for (const rli of refundLineItems) {
            const lineItemGid = `gid://shopify/LineItem/${rli.line_item_id}`;
            const revoked = academyDb.revokeEntitlementByOrder(
              orderGid,
              'Reembolso de línea en Shopify',
              lineItemGid
            );
            revokedCount += revoked.length;
          }
        } else {
          // Full order refund
          const revoked = academyDb.revokeEntitlementByOrder(
            orderGid,
            'Reembolso total del pedido en Shopify'
          );
          revokedCount += revoked.length;
        }

        academyDb.recordWebhook({
          id: `pwh_${Date.now()}`,
          shop,
          webhookId,
          topic: 'refunds/create',
          receivedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          status: 'success',
          payloadSummary: `Refund on order ${orderId}: ${revokedCount} entitlements revoked`,
        });

        return res.status(200).json({ status: 'success', revoked: revokedCount });
      }

      if (topic === 'orders/cancelled') {
        const orderGid = payload.admin_graphql_api_id || `gid://shopify/Order/${payload.id}`;
        const revoked = academyDb.revokeEntitlementByOrder(
          orderGid,
          'Pedido cancelado en Shopify'
        );

        academyDb.recordWebhook({
          id: `pwh_${Date.now()}`,
          shop,
          webhookId,
          topic: 'orders/cancelled',
          receivedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
          status: 'success',
          payloadSummary: `Order ${orderGid} cancelled: ${revoked.length} entitlements revoked`,
        });

        return res.status(200).json({ status: 'success', revoked: revoked.length });
      }

      // Default acknowledge for other topics
      academyDb.recordWebhook({
        id: `pwh_${Date.now()}`,
        shop,
        webhookId,
        topic: topic || 'unknown',
        receivedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        status: 'ignored',
        payloadSummary: `Topic ${topic} acknowledged without entitlement action`,
      });

      return res.status(200).json({ status: 'acknowledged' });
    } catch (err: any) {
      console.error('[Webhook] Error processing webhook:', err);
      return res.status(500).json({ status: 'error', message: err.message });
    }
  });

  // ============================================================================
  // PUBLIC ACADEMY ENDPOINTS
  // ============================================================================

  // 1. Catalog of masterclasses
  app.get('/api/academia/courses', (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;
    const courses = academyDb.getCourses({ category });

    // Sanitize output for public view: strip private video IDs
    const publicCatalog = courses.map((course) => {
      const { modules, ...courseSummary } = course;
      return {
        ...courseSummary,
        modulesCount: modules?.length || 0,
      };
    });

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({ courses: publicCatalog });
  });

  // 2. Course public sales detail
  app.get('/api/academia/courses/:slug', (req: Request, res: Response) => {
    const { slug } = req.params;
    const course = academyDb.getCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    // Public syllabus: show titles & summaries, but hide private video UIDs (except preview)
    const sanitizedModules = (course.modules || []).map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((les) => ({
        id: les.id,
        moduleId: les.moduleId,
        slug: les.slug,
        title: les.title,
        summary: les.summary,
        position: les.position,
        durationSeconds: les.durationSeconds,
        isPreview: les.isPreview,
        // Only deliver video UID if it's explicitly a free sample lesson
        privateVideoUid: les.isPreview ? les.privateVideoUid : undefined,
        attachmentsCount: les.attachments?.length || 0,
      })),
    }));

    res.setHeader('Cache-Control', 'public, max-age=60');
    res.json({
      course: {
        ...course,
        modules: sanitizedModules,
      },
    });
  });

  // ============================================================================
  // STUDENT AUTHENTICATION & PRIVATE LIBRARY ("MIS MASTERCLASSES")
  // ============================================================================

  // Helper to extract student identity from session cookie or Authorization header
  const getAuthenticatedStudent = (
    req: Request
  ): (StudentSession & { role?: string; id?: string; verified: boolean }) | null => {
    // 1. Check HttpOnly sf_session cookie first (standard browser session)
    const cookies = parseCookies(req);
    let sessionId = cookies.sf_session;

    if (!sessionId && req.headers.authorization?.startsWith('Bearer ')) {
      const candidate = req.headers.authorization.split(' ')[1];
      if (candidate && !candidate.startsWith('{')) {
        sessionId = candidate;
      }
    }

    if (sessionId) {
      const serverSession = academyDb.getServerSession(sessionId);
      if (serverSession) {
        const user = academyDb.getUserById(serverSession.userId) || academyDb.getUserByEmail(serverSession.email);
        return {
          customerGid: (user as any)?.shopifyCustomerGid || `usr_${serverSession.userId}`,
          email: serverSession.email,
          name: serverSession.full_name,
          verified: !!user?.email_verified,
          role: serverSession.role || user?.role || 'CUSTOMER',
          expiresAt: serverSession.expiresAt,
          id: serverSession.userId,
        };
      }
    }

    // 2. Legacy / app proxy base64url JSON token
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = JSON.parse(Buffer.from(token, 'base64url').toString('utf8'));
        if (decoded.customerGid && decoded.expiresAt > Date.now()) {
          const user = academyDb.getUserByEmail(decoded.email);
          return {
            customerGid: decoded.customerGid,
            email: decoded.email,
            name: decoded.name || 'Alumno Verificado',
            verified: user ? user.email_verified : decoded.verified ?? true,
            role: user?.role || 'CUSTOMER',
            expiresAt: decoded.expiresAt,
            id: user?.id,
          };
        }
      } catch (e) {
        // Invalid token
      }
    }

    // 3. Fallback query parameter for App Proxy / iframe compatibility
    const customerGidParam = req.query.logged_in_customer_id as string;
    if (customerGidParam) {
      const customerEmail = (req.query.customer_email as string) || 'alumno@saludforte.com';
      const user = academyDb.getUserByEmail(customerEmail);
      return {
        customerGid: `gid://shopify/Customer/${customerGidParam}`,
        email: customerEmail,
        name: 'Alumno Verificado',
        verified: user ? user.email_verified : true,
        role: user?.role || 'CUSTOMER',
        expiresAt: Date.now() + 1000 * 60 * 60 * 24,
        id: user?.id,
      };
    }

    return null;
  };

  // Student login / demo login
  app.post('/api/academia/auth/session', (req: Request, res: Response) => {
    const { email } = req.body;
    if (!email || typeof email !== 'string') {
      return res.status(400).json({ error: 'El correo electrónico es requerido' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    // Look up entitlements by email
    const entitlements = academyDb.getEntitlementsForCustomer('', normalizedEmail);

    let customerGid = 'gid://shopify/Customer/123456789';
    let customerName = 'Alumno Salud Forte';

    if (entitlements.length > 0) {
      customerGid = entitlements[0].customerGid;
      customerName = entitlements[0].customerName || 'Mariana Fuentes';
    }

    const session: StudentSession = {
      customerGid,
      email: normalizedEmail,
      name: customerName,
      verified: true,
      expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
    };

    const token = Buffer.from(JSON.stringify(session)).toString('base64url');

    res.json({
      session,
      token,
      entitlementsCount: entitlements.filter((e) => e.status === 'active').length,
    });
  });

  // Student Library ("Mis masterclasses")
  app.get('/api/academia/my-library', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const student = getAuthenticatedStudent(req);

    if (!student) {
      return res.status(401).json({
        error: 'Inicia sesión para acceder a tu biblioteca personal de masterclasses.',
        code: 'UNAUTHENTICATED',
      });
    }

    const isDoctor = student.role === 'ADMIN' || student.role === 'INSTRUCTOR';
    const allCourses = academyDb.getCourses();

    let entitlements = academyDb.getEntitlementsForCustomer(student.customerGid, student.email);

    // If Dr. Mauricio Galindo or Admin, synthesize active access for all courses
    if (isDoctor) {
      const activeCourseIds = new Set(entitlements.map((e) => e.courseId));
      for (const c of allCourses) {
        if (!activeCourseIds.has(c.id)) {
          entitlements.push({
            id: `admin_ent_${c.id}`,
            shop: 'salud-forte',
            customerGid: student.customerGid,
            customerEmail: student.email,
            customerName: student.name,
            courseId: c.id,
            status: 'active',
            grantedAt: new Date().toISOString(),
          } as Entitlement);
        }
      }
    }

    const libraryItems = entitlements.map((ent) => {
      const course = academyDb.getCourseById(ent.courseId);
      const progressList = academyDb.getStudentProgress(student.customerGid, ent.courseId, student.email);

      const totalLessons = course?.lessonCount || 1;
      const completedLessons = progressList.filter((p) => p.status === 'completed').length;
      const progressPercent = Math.min(100, Math.round((completedLessons / totalLessons) * 100));

      // Find last active lesson or default to first
      const lastProgress = progressList.sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

      return {
        entitlementId: ent.id,
        status: ent.status, // 'active' | 'revoked' | 'suspended'
        grantedAt: ent.grantedAt,
        revocationReason: ent.revocationReason,
        course: course
          ? {
              id: course.id,
              slug: course.slug,
              title: course.title,
              subtitle: course.subtitle,
              image: course.image,
              imageFallback: course.imageFallback,
              imageAlt: course.imageAlt,
              imageWidth: course.imageWidth,
              imageHeight: course.imageHeight,
              coverImage: course.coverImage,
              categoryLabel: course.categoryLabel,
              durationMinutes: course.durationMinutes,
              lessonCount: course.lessonCount,
              instructor: course.instructor,
            }
          : null,
        progress: {
          percent: progressPercent,
          completedCount: completedLessons,
          totalCount: totalLessons,
          lastLessonId: lastProgress?.lessonId || null,
        },
      };
    });

    res.json({
      student: {
        email: student.email,
        name: student.name,
        role: student.role,
        verified: student.verified,
      },
      library: libraryItems,
    });
  });

  // ============================================================================
  // CAPA 4: PROTECTED LESSON PLAYER & VIDEO PLAYBACK (YOUTUBE & CLOUDFLARE)
  // ============================================================================

  // Get full lesson data (Strict entitlement validation)
  app.get('/api/academia/courses/:slug/lessons/:lessonSlug', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const course = academyDb.getCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    // Find requested lesson
    let targetLesson: any = null;
    let targetModule: any = null;

    for (const mod of course.modules || []) {
      for (const les of mod.lessons) {
        if (les.slug === lessonSlug) {
          targetLesson = les;
          targetModule = mod;
          break;
        }
      }
      if (targetLesson) break;
    }

    if (!targetLesson) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    // Free preview bypass
    if (targetLesson.isPreview) {
      return res.json({
        course: {
          id: course.id,
          slug: course.slug,
          title: course.title,
          instructor: course.instructor,
          modules: course.modules,
        },
        module: {
          id: targetModule.id,
          title: targetModule.title,
        },
        lesson: targetLesson,
        entitlementStatus: 'preview',
      });
    }

    // Strict validation for paid lessons
    const student = getAuthenticatedStudent(req);
    if (!student) {
      return res.status(401).json({
        error: 'Esta lección requiere acceso activo. Por favor inicia sesión con tu cuenta.',
        code: 'UNAUTHENTICATED',
      });
    }

    const isDoctor = student.role === 'ADMIN' || student.role === 'INSTRUCTOR';

    // Verify email requirement for students
    if (!isDoctor && !student.verified) {
      return res.status(403).json({
        error: 'Debes verificar tu correo electrónico para acceder a las lecciones de tus masterclasses.',
        code: 'EMAIL_VERIFICATION_REQUIRED',
      });
    }

    // Check entitlement
    const entitlement = isDoctor
      ? ({ id: 'admin_ent', status: 'active' } as any)
      : academyDb.getActiveEntitlement(student.customerGid, course.id, student.email);

    if (!entitlement) {
      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: course.shop,
        customerGid: student.customerGid,
        courseId: course.id,
        lessonId: targetLesson.id,
        action: 'lesson_access',
        result: 'denied',
        reason: 'No active entitlement found',
        createdAt: new Date().toISOString(),
      });

      return res.status(403).json({
        error: 'No tienes una licencia activa para esta masterclass. Si ya la adquiriste, asegúrate de haber ingresado con el mismo correo utilizado en tu compra.',
        code: 'ENTITLEMENT_REQUIRED',
      });
    }

    // Fetch student's progress for this course
    const progress = academyDb.getStudentProgress(student.customerGid, course.id);

    academyDb.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: course.shop,
      customerGid: student.customerGid,
      courseId: course.id,
      lessonId: targetLesson.id,
      action: 'lesson_access',
      result: 'granted',
      createdAt: new Date().toISOString(),
    });

    res.json({
      course: {
        id: course.id,
        slug: course.slug,
        title: course.title,
        instructor: course.instructor,
        modules: course.modules,
      },
      module: {
        id: targetModule.id,
        title: targetModule.title,
      },
      lesson: targetLesson,
      progress,
      entitlementStatus: entitlement.status,
    });
  });

  // Request Video Playback Details (YouTube embed or Cloudflare Stream token)
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/token', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug } = req.params;
    const course = academyDb.getCourseBySlug(slug);

    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    let targetLesson: any = null;
    for (const mod of course.modules || []) {
      for (const les of mod.lessons) {
        if (les.slug === lessonSlug) {
          targetLesson = les;
          break;
        }
      }
      if (targetLesson) break;
    }

    if (!targetLesson) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    // If not a preview, verify student's active entitlement
    let customerGid = 'preview_user';
    let isDoctor = false;

    if (!targetLesson.isPreview) {
      const student = getAuthenticatedStudent(req);
      if (!student) {
        return res.status(401).json({ error: 'Inicia sesión para reproducir el video' });
      }

      isDoctor = student.role === 'ADMIN' || student.role === 'INSTRUCTOR';

      if (!isDoctor) {
        if (!student.verified) {
          return res.status(403).json({ error: 'Verifica tu correo para reproducir la clase.' });
        }

        const entitlement = academyDb.getActiveEntitlement(student.customerGid, course.id, student.email);
        if (!entitlement) {
          return res.status(403).json({ error: 'Acceso no autorizado a este video' });
        }
      }

      customerGid = student.customerGid;
    }

    // 1. YouTube Video Resolution
    const isYouTube =
      targetLesson.videoProvider === 'youtube' ||
      Boolean(targetLesson.videoExternalId) ||
      (targetLesson.videoUrl && targetLesson.videoUrl.includes('youtu'));

    if (isYouTube) {
      const ytId = targetLesson.videoExternalId || extractYouTubeVideoId(targetLesson.videoUrl || '');
      const embedUrl = buildYouTubeEmbedUrl(ytId || '', { unlistedNotice: true });

      academyDb.logAccessAudit({
        id: `audit_${Date.now()}`,
        shop: course.shop,
        customerGid,
        courseId: course.id,
        lessonId: targetLesson.id,
        action: 'youtube_video_playback',
        result: 'granted',
        createdAt: new Date().toISOString(),
      });

      return res.json({
        type: 'youtube',
        videoId: ytId,
        embedUrl,
        title: targetLesson.title,
        courseTitle: course.title,
        notice: 'Video educativo en YouTube (No listado) para alumnos de Salud Forte.',
      });
    }

    // 2. Cloudflare Stream Token Resolution
    const tokenResult = generateCloudflareStreamToken(
      targetLesson.privateVideoUid,
      customerGid,
      { expirationMinutes: 10 }
    );

    academyDb.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: course.shop,
      customerGid,
      courseId: course.id,
      lessonId: targetLesson.id,
      action: 'cloudflare_token_request',
      result: 'granted',
      createdAt: new Date().toISOString(),
    });

    res.json({
      type: 'cloudflare',
      ...tokenResult,
    });
  });

  // Save lesson progress & mark completed
  app.post('/api/academia/courses/:slug/lessons/:lessonSlug/progress', (req: Request, res: Response) => {
    const { slug, lessonSlug } = req.params;
    const student = getAuthenticatedStudent(req);

    if (!student) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const course = academyDb.getCourseBySlug(slug);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    let targetLessonId: string | null = null;
    for (const mod of course.modules || []) {
      for (const les of mod.lessons) {
        if (les.slug === lessonSlug) {
          targetLessonId = les.id;
          break;
        }
      }
      if (targetLessonId) break;
    }

    if (!targetLessonId) {
      return res.status(404).json({ error: 'Lección no encontrada' });
    }

    const resolvedStatus = req.body.status || (req.body.completed ? 'completed' : 'in_progress');
    const resolvedPosition = req.body.positionSeconds || req.body.lastPositionSeconds || 0;

    const updated = academyDb.saveLessonProgress(
      student.customerGid,
      course.id,
      targetLessonId,
      resolvedStatus,
      resolvedPosition,
      student.email
    );

    res.json({ success: true, progress: updated });
  });

  // Protected PDF attachment download
  app.get('/api/academia/courses/:slug/lessons/:lessonSlug/attachment/:attachmentId', (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'private, no-store');
    const { slug, lessonSlug, attachmentId } = req.params;
    const student = getAuthenticatedStudent(req);

    if (!student) {
      return res.status(401).send('Inicia sesión para descargar este material');
    }

    const course = academyDb.getCourseBySlug(slug);
    if (!course) {
      return res.status(404).send('Masterclass no encontrada');
    }

    const entitlement = academyDb.getActiveEntitlement(
      student.customerGid,
      course.id,
      student.email
    );

    if (!entitlement) {
      return res.status(403).send('Acceso no autorizado al material descargable');
    }

    academyDb.logAccessAudit({
      id: `audit_${Date.now()}`,
      shop: course.shop,
      customerGid: student.customerGid,
      courseId: course.id,
      action: 'attachment_download',
      result: 'granted',
      reason: `Attachment ${attachmentId} downloaded`,
      createdAt: new Date().toISOString(),
    });

    // Provide clean educational resource download header
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SaludForte_${lessonSlug}_Guia.pdf"`);
    res.send(
      Buffer.from(
        `%PDF-1.4\n1 0 obj\n<< /Title (Academia Salud Forte - ${course.title}) /Author (Dr. Mauricio Benjamin Galindo Lopez) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF`
      )
    );
  });

  // ============================================================================
  // ADMIN PANEL ENDPOINTS (/api/admin/academia/*)
  // ============================================================================
  app.get('/api/admin/academia/overview', (req: Request, res: Response) => {
    const courses = academyDb.getCourses();
    const entitlements = academyDb.getAllEntitlements();
    const webhooks = academyDb.getProcessedWebhooks();
    const audits = academyDb.getAccessAudits().slice(0, 50);

    res.json({
      coursesCount: courses.length,
      activeStudentsCount: new Set(entitlements.filter((e) => e.status === 'active').map((e) => e.customerEmail)).size,
      totalEntitlementsCount: entitlements.length,
      activeEntitlementsCount: entitlements.filter((e) => e.status === 'active').length,
      revokedEntitlementsCount: entitlements.filter((e) => e.status === 'revoked').length,
      webhooksProcessedCount: webhooks.length,
      recentWebhooks: webhooks.slice(0, 10),
      recentAudits: audits,
      systemStatus: {
        shopifyShopDomain: process.env.SHOPIFY_SHOP_DOMAIN || 'salud-forte.myshopify.com',
        isStorefrontTokenSet: Boolean(process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN),
        isWebhookSecretSet: Boolean(process.env.SHOPIFY_WEBHOOK_SECRET || process.env.SHOPIFY_API_SECRET),
        isCloudflareStreamKeySet: Boolean(process.env.CLOUDFLARE_STREAM_KEY_ID),
      },
    });
  });

  // Manual entitlement grant (from Admin UI)
  app.post('/api/admin/academia/entitlements/grant', (req: Request, res: Response) => {
    const { customerEmail, customerName, courseId, orderNumber } = req.body;
    if (!customerEmail || !courseId) {
      return res.status(400).json({ error: 'customerEmail y courseId son requeridos' });
    }

    const course = academyDb.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada' });
    }

    const ent = academyDb.grantEntitlement({
      shop: 'salud-forte.myshopify.com',
      customerGid: `gid://shopify/Customer/manual_${Date.now()}`,
      customerEmail,
      customerName: customerName || 'Alumno Otorgado Manualmente',
      courseId,
      orderGid: `gid://shopify/Order/manual_${Date.now()}`,
      orderNumber: orderNumber || '#MANUAL',
      lineItemGid: `gid://shopify/LineItem/manual_${Date.now()}`,
    });

    res.json({ success: true, entitlement: ent });
  });

  // Update entitlement status (active, suspended, revoked)
  app.post('/api/admin/academia/entitlements/:id/status', (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, reason } = req.body;

    const updated = academyDb.updateEntitlementStatus(id, status, reason);
    if (!updated) {
      return res.status(404).json({ error: 'Entitlement no encontrado' });
    }

    res.json({ success: true, entitlement: updated });
  });

  // Webhook Simulator for Testing
  app.post('/api/admin/academia/simulate-webhook', (req: Request, res: Response) => {
    const { topic, orderNumber, customerEmail, courseVariantGid } = req.body;

    if (topic === 'orders/paid') {
      const course = academyDb.getCourseByVariantGid(courseVariantGid);
      if (!course) {
        return res.status(400).json({ error: 'Variante de Shopify no encontrada en el catálogo' });
      }

      const orderGid = `gid://shopify/Order/sim_${Date.now()}`;
      const ent = academyDb.grantEntitlement({
        shop: 'salud-forte.myshopify.com',
        customerGid: `gid://shopify/Customer/sim_${Date.now()}`,
        customerEmail: customerEmail || 'test@saludforte.com',
        customerName: 'Cliente Simulado de Prueba',
        courseId: course.id,
        orderGid,
        orderNumber: orderNumber || '#SIM-999',
        lineItemGid: `gid://shopify/LineItem/sim_${Date.now()}`,
      });

      academyDb.recordWebhook({
        id: `sim_wh_${Date.now()}`,
        shop: 'salud-forte.myshopify.com',
        webhookId: `sim_webhook_${Date.now()}`,
        topic: 'orders/paid',
        receivedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        status: 'success',
        payloadSummary: `[SIMULADO] Pedido ${orderNumber || '#SIM-999'} concedió "${course.title}"`,
      });

      return res.json({ success: true, entitlement: ent });
    }

    if (topic === 'refunds/create') {
      const { orderGid } = req.body;
      const revoked = academyDb.revokeEntitlementByOrder(
        orderGid,
        'Reembolso simulado desde el panel de pruebas'
      );

      academyDb.recordWebhook({
        id: `sim_wh_${Date.now()}`,
        shop: 'salud-forte.myshopify.com',
        webhookId: `sim_webhook_${Date.now()}`,
        topic: 'refunds/create',
        receivedAt: new Date().toISOString(),
        processedAt: new Date().toISOString(),
        status: 'success',
        payloadSummary: `[SIMULADO] Reembolso en ${orderGid} revocó ${revoked.length} accesos`,
      });

      return res.json({ success: true, revokedCount: revoked.length });
    }

    res.status(400).json({ error: 'Topic no soportado en simulación' });
  });

  // ============================================================================
  // DR. MAURICIO GALINDO - EXCLUSIVE ACADEMY & INSTRUCTOR CRUD API
  // ============================================================================

  // Helper middleware/check for admin or instructor rights
  const requireAdmin = (req: Request, res: Response): boolean => {
    const student = getAuthenticatedStudent(req);
    if (!student || (student.role !== 'ADMIN' && student.role !== 'INSTRUCTOR')) {
      res.status(403).json({ error: 'Acceso reservado exclusivamente para el Dr. Mauricio Galindo (Administrador).' });
      return false;
    }
    return true;
  };

  // 1. Get all courses with full details (Admin)
  app.get('/api/admin/courses', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const courses = academyDb.getCourses();
    return res.json({ courses });
  });

  // 2. Create new course
  app.post('/api/admin/courses', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const course = academyDb.createCourse(req.body);
      return res.status(201).json({ success: true, course });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 3. Update course
  app.put('/api/admin/courses/:id', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const updated = academyDb.updateCourse(req.params.id, req.body);
      if (!updated) return res.status(404).json({ error: 'Masterclass no encontrada' });
      return res.json({ success: true, course: updated });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 4. Delete course
  app.delete('/api/admin/courses/:id', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const deleted = academyDb.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Masterclass no encontrada' });
    return res.json({ success: true, message: 'Masterclass eliminada correctamente.' });
  });

  // 5. Add Module
  app.post('/api/admin/courses/:id/modules', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const course = academyDb.addModule(req.params.id, req.body);
      if (!course) return res.status(404).json({ error: 'Masterclass no encontrada' });
      return res.status(201).json({ success: true, course });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 6. Update Module
  app.put('/api/admin/courses/:id/modules/:moduleId', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const course = academyDb.updateModule(req.params.id, req.params.moduleId, req.body);
      if (!course) return res.status(404).json({ error: 'Módulo o Masterclass no encontrados' });
      return res.json({ success: true, course });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 7. Delete Module
  app.delete('/api/admin/courses/:id/modules/:moduleId', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const course = academyDb.deleteModule(req.params.id, req.params.moduleId);
    if (!course) return res.status(404).json({ error: 'Módulo o Masterclass no encontrados' });
    return res.json({ success: true, course });
  });

  // 8. Add Lesson (with YouTube video resolution)
  app.post('/api/admin/courses/:id/modules/:moduleId/lessons', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const lessonData = { ...req.body };
      if (lessonData.videoUrl) {
        const ytId = extractYouTubeVideoId(lessonData.videoUrl);
        if (ytId) {
          lessonData.videoProvider = 'youtube';
          lessonData.videoExternalId = ytId;
        }
      }
      const course = academyDb.addLesson(req.params.id, req.params.moduleId, lessonData);
      if (!course) return res.status(404).json({ error: 'Módulo o Masterclass no encontrados' });
      return res.status(201).json({ success: true, course });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 9. Update Lesson
  app.put('/api/admin/courses/:id/modules/:moduleId/lessons/:lessonId', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    try {
      const lessonData = { ...req.body };
      if (lessonData.videoUrl) {
        const ytId = extractYouTubeVideoId(lessonData.videoUrl);
        if (ytId) {
          lessonData.videoProvider = 'youtube';
          lessonData.videoExternalId = ytId;
        }
      }
      const course = academyDb.updateLesson(req.params.id, req.params.moduleId, req.params.lessonId, lessonData);
      if (!course) return res.status(404).json({ error: 'Lección no encontrada' });
      return res.json({ success: true, course });
    } catch (err: any) {
      return res.status(400).json({ error: err.message });
    }
  });

  // 10. Delete Lesson
  app.delete('/api/admin/courses/:id/modules/:moduleId/lessons/:lessonId', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const course = academyDb.deleteLesson(req.params.id, req.params.moduleId, req.params.lessonId);
    if (!course) return res.status(404).json({ error: 'Lección no encontrada' });
    return res.json({ success: true, course });
  });

  // 11. Parse & validate YouTube video URL
  app.post('/api/admin/youtube/parse', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Proporciona una URL de YouTube' });
    }

    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      return res.status(400).json({
        valid: false,
        error: 'No se pudo identificar un ID de video válido de YouTube. Formatos soportados: youtube.com/watch?v=..., youtu.be/..., youtube.com/embed/...',
      });
    }

    const embedUrl = buildYouTubeEmbedUrl(videoId, { unlistedNotice: true });
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    return res.json({
      valid: true,
      videoId,
      embedUrl,
      thumbnailUrl,
      message: 'Enlace de YouTube procesado correctamente. Recuerda configurar el video como "No listado" (Unlisted).',
    });
  });

  // 12. Student directory with consent and enrolment filters
  app.get('/api/admin/students', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const marketingOnly = req.query.marketing_only === 'true';
    let users = academyDb.getAllUsers();

    if (marketingOnly) {
      users = users.filter((u) => u.marketing_consent);
    }

    const entitlements = academyDb.getAllEntitlements();
    const courses = academyDb.getCourses();

    const students = users.map((u) => {
      const userEntitlements = entitlements.filter(
        (e) => e.customerEmail.toLowerCase() === u.email.toLowerCase() || (u.shopifyCustomerGid && e.customerGid === u.shopifyCustomerGid)
      );

      const enrolledCourses = userEntitlements.map((e) => {
        const c = courses.find((crs) => crs.id === e.courseId);
        return {
          entitlementId: e.id,
          courseId: e.courseId,
          courseTitle: c ? c.title : e.courseId,
          status: e.status,
          grantedAt: e.grantedAt,
        };
      });

      return {
        id: u.id,
        email: u.email,
        full_name: u.full_name,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        email_verified: u.email_verified,
        marketing_consent: u.marketing_consent,
        marketing_consent_at: u.marketing_consent_at,
        terms_accepted: u.terms_accepted,
        created_at: u.created_at,
        last_login_at: u.last_login_at,
        enrolledCourses,
        enrolledCoursesCount: enrolledCourses.filter((c) => c.status === 'active').length,
      };
    });

    return res.json({
      students,
      totalCount: students.length,
      marketingSubscribersCount: users.filter((u) => u.marketing_consent).length,
    });
  });

  // 13. Grant masterclass to student manually
  app.post('/api/admin/students/grant-course', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const { customerEmail, customerName, courseId } = req.body;

    if (!customerEmail || !courseId) {
      return res.status(400).json({ error: 'customerEmail y courseId son requeridos.' });
    }

    const normalizedEmail = customerEmail.toLowerCase().trim();
    const course = academyDb.getCourseById(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Masterclass no encontrada.' });
    }

    let user = academyDb.getUserByEmail(normalizedEmail);
    const customerGid = user?.shopifyCustomerGid || `usr_${user?.id || 'manual'}`;

    const entitlement = academyDb.grantEntitlement({
      shop: 'salud-forte',
      customerGid,
      customerEmail: normalizedEmail,
      customerName: customerName || user?.full_name || 'Alumno Autorizado',
      courseId: course.id,
      orderGid: `admin_manual_${Date.now()}`,
      orderNumber: '#DOCTOR-MANUAL',
      lineItemGid: `admin_line_${Date.now()}`,
    });

    return res.json({
      success: true,
      message: `Acceso a "${course.title}" otorgado exitosamente a ${normalizedEmail}.`,
      entitlement,
    });
  });

  // 14. Revoke masterclass access
  app.post('/api/admin/students/revoke-course', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const { entitlementId, reason } = req.body;

    if (!entitlementId) {
      return res.status(400).json({ error: 'entitlementId es requerido' });
    }

    const updated = academyDb.updateEntitlementStatus(entitlementId, 'revoked', reason || 'Revocado por el Dr. Mauricio Galindo');
    if (!updated) {
      return res.status(404).json({ error: 'Licencia no encontrada' });
    }

    return res.json({
      success: true,
      message: 'Licencia revocada correctamente.',
      entitlement: updated,
    });
  });

  // 15. Comprehensive Academy & Student Metrics
  app.get('/api/admin/metrics', (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const courses = academyDb.getCourses();
    const users = academyDb.getAllUsers();
    const entitlements = academyDb.getAllEntitlements();
    const audits = academyDb.getAccessAudits();

    let totalLessons = 0;
    for (const c of courses) {
      for (const m of c.modules || []) {
        totalLessons += m.lessons.length;
      }
    }

    const activeEntitlements = entitlements.filter((e) => e.status === 'active');
    const marketingUsers = users.filter((u) => u.marketing_consent);
    const verifiedUsers = users.filter((u) => u.email_verified);

    return res.json({
      metrics: {
        totalCourses: courses.length,
        totalLessons,
        totalRegisteredUsers: users.length,
        verifiedUsersCount: verifiedUsers.length,
        marketingSubscribersCount: marketingUsers.length,
        totalEntitlements: entitlements.length,
        activeEntitlementsCount: activeEntitlements.length,
        revokedEntitlementsCount: entitlements.filter((e) => e.status === 'revoked').length,
        recentAuditsCount: audits.length,
      },
      recentAudits: audits.slice(0, 20),
    });
  });

  // Static assets under /images directly served from public/images
  app.use('/images', express.static(path.join(process.cwd(), 'public/images')));

  // ============================================================================
  // VITE MIDDLEWARE (DEVELOPMENT) & STATIC SERVE (PRODUCTION)
  // ============================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Salud Forte] Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
