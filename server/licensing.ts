import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { db } from './db.ts';

// Server-side HMAC Secret (never exposed to client)
const SECRET_KEY = process.env.NUTRIGUARD_LICENSE_SECRET || 'nutriguard-defense-hmac-sha256-anti-tamper-key-2026';

// 14-day free trial duration in milliseconds (14 days = 336 hours)
export const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;

export interface LicensePayload {
  deviceId: string;
  userEmail: string;
  isPaid: boolean;
  plan: 'Trial' | 'Pro' | 'Enterprise' | 'Lifetime';
  trialStartedAt: number;
  trialExpiresAt: number;
  paidExpiresAt?: number;
  stellarTxHash?: string;
  stellarAsset?: string;
  stellarAmount?: string;
  nonce: string;
}

export interface LicenseVerificationResult {
  valid: boolean;
  isExpired: boolean;
  isPaid: boolean;
  plan: string;
  daysRemaining: number;
  hoursRemaining: number;
  reason?: string;
  payload?: LicensePayload;
}

export class LicensingEngine {
  /**
   * Cryptographically signs a license payload using HMAC-SHA256
   */
  public signToken(payload: LicensePayload): string {
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadStr).digest('base64url');
    return `${payloadStr}.${signature}`;
  }

  /**
   * Verifies an incoming license token cryptographically
   */
  public verifyToken(token: string): LicenseVerificationResult {
    if (!token || typeof token !== 'string' || !token.includes('.')) {
      return {
        valid: false,
        isExpired: true,
        isPaid: false,
        plan: 'None',
        daysRemaining: 0,
        hoursRemaining: 0,
        reason: 'Missing or malformed license token.',
      };
    }

    const [payloadStr, signature] = token.split('.');
    const expectedSignature = crypto.createHmac('sha256', SECRET_KEY).update(payloadStr).digest('base64url');

    // Constant-time compare to prevent timing side-channel attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return {
        valid: false,
        isExpired: true,
        isPaid: false,
        plan: 'None',
        daysRemaining: 0,
        hoursRemaining: 0,
        reason: 'Tampered or counterfeit cryptographic token detected.',
      };
    }

    let payload: LicensePayload;
    try {
      payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf-8'));
    } catch {
      return {
        valid: false,
        isExpired: true,
        isPaid: false,
        plan: 'None',
        daysRemaining: 0,
        hoursRemaining: 0,
        reason: 'Corrupted payload structure.',
      };
    }

    const now = Date.now();

    // Check if Paid license is active
    if (payload.isPaid) {
      const paidExpires = payload.paidExpiresAt || Infinity;
      if (now <= paidExpires) {
        const remainingMs = Math.max(0, paidExpires - now);
        return {
          valid: true,
          isExpired: false,
          isPaid: true,
          plan: payload.plan,
          daysRemaining: Math.ceil(remainingMs / (24 * 60 * 60 * 1000)),
          hoursRemaining: Math.ceil(remainingMs / (60 * 60 * 1000)),
          payload,
        };
      } else {
        return {
          valid: false,
          isExpired: true,
          isPaid: false,
          plan: payload.plan,
          daysRemaining: 0,
          hoursRemaining: 0,
          reason: 'Your paid subscription has expired. Please renew on Stellar.',
          payload,
        };
      }
    }

    // Free 14-Day Trial Evaluation
    const trialRemainingMs = payload.trialExpiresAt - now;
    if (trialRemainingMs > 0) {
      return {
        valid: true,
        isExpired: false,
        isPaid: false,
        plan: 'Trial (14-Day Full Access)',
        daysRemaining: Math.ceil(trialRemainingMs / (24 * 60 * 60 * 1000)),
        hoursRemaining: Math.ceil(trialRemainingMs / (60 * 60 * 1000)),
        payload,
      };
    }

    // Trial has expired
    return {
      valid: false,
      isExpired: true,
      isPaid: false,
      plan: 'Trial Expired',
      daysRemaining: 0,
      hoursRemaining: 0,
      reason: 'Your 14-day free trial has expired. Upgrade via Stellar to unlock unlimited AI protection.',
      payload,
    };
  }

  /**
   * Obtains or creates an authoritative 14-day trial record
   */
  public getOrCreateTrial(deviceId: string, userEmail: string = 'guest@nutriguard.ai'): { token: string; payload: LicensePayload; isNew: boolean } {
    // Check if this device already registered a trial in the database
    const existingRegistration = db.getTrialRegistration(deviceId);

    if (existingRegistration) {
      const payload: LicensePayload = {
        deviceId,
        userEmail: existingRegistration.userEmail || userEmail,
        isPaid: existingRegistration.isPaid || false,
        plan: existingRegistration.plan as any,
        trialStartedAt: existingRegistration.trialStartedAt,
        trialExpiresAt: existingRegistration.trialExpiresAt,
        paidExpiresAt: existingRegistration.paidExpiresAt,
        stellarTxHash: existingRegistration.stellarTxHash,
        nonce: crypto.randomBytes(6).toString('hex'),
      };
      return {
        token: this.signToken(payload),
        payload,
        isNew: false,
      };
    }

    // Create fresh 14-day trial
    const now = Date.now();
    const trialExpiresAt = now + FOURTEEN_DAYS_MS;

    const payload: LicensePayload = {
      deviceId,
      userEmail,
      isPaid: false,
      plan: 'Trial',
      trialStartedAt: now,
      trialExpiresAt: trialExpiresAt,
      nonce: crypto.randomBytes(6).toString('hex'),
    };

    // Record in database
    db.saveTrialRegistration(deviceId, {
      deviceId,
      userEmail,
      isPaid: false,
      plan: 'Trial',
      trialStartedAt: now,
      trialExpiresAt: trialExpiresAt,
      createdAt: new Date().toISOString(),
    });

    return {
      token: this.signToken(payload),
      payload,
      isNew: true,
    };
  }

  /**
   * Activates a paid Stellar license on a device
   */
  public activateStellarLicense(params: {
    deviceId: string;
    userEmail?: string;
    plan: 'Pro' | 'Enterprise' | 'Lifetime';
    durationDays: number;
    stellarTxHash: string;
    stellarAsset: string;
    stellarAmount: string;
  }): { token: string; payload: LicensePayload } {
    const now = Date.now();
    const paidExpiresAt = now + params.durationDays * 24 * 60 * 60 * 1000;

    const payload: LicensePayload = {
      deviceId: params.deviceId,
      userEmail: params.userEmail || 'stellar-subscriber@nutriguard.ai',
      isPaid: true,
      plan: params.plan,
      trialStartedAt: now - 1000,
      trialExpiresAt: paidExpiresAt,
      paidExpiresAt: paidExpiresAt,
      stellarTxHash: params.stellarTxHash,
      stellarAsset: params.stellarAsset,
      stellarAmount: params.stellarAmount,
      nonce: crypto.randomBytes(6).toString('hex'),
    };

    // Persist in DB
    db.saveTrialRegistration(params.deviceId, {
      deviceId: params.deviceId,
      userEmail: payload.userEmail,
      isPaid: true,
      plan: params.plan,
      trialStartedAt: payload.trialStartedAt,
      trialExpiresAt: payload.trialExpiresAt,
      paidExpiresAt: paidExpiresAt,
      stellarTxHash: params.stellarTxHash,
      createdAt: new Date().toISOString(),
    });

    return {
      token: this.signToken(payload),
      payload,
    };
  }
}

export const licensingEngine = new LicensingEngine();

// Express Middleware: Anti-Bypass Guard for AI & Forensic Endpoints
export function requireValidSubscriptionOrTrial(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'] || '';
  const customHeader = (req.headers['x-nutriguard-token'] as string) || '';
  
  let token = customHeader;
  if (!token && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  }

  if (!token) {
    // If no token is provided, check if client sent a deviceId in body or header to auto-register initial trial
    const deviceId = (req.headers['x-device-id'] as string) || (req.body && req.body.deviceId);
    if (deviceId) {
      const trial = licensingEngine.getOrCreateTrial(deviceId);
      token = trial.token;
      res.setHeader('x-nutriguard-token', token);
    } else {
      return res.status(402).json({
        success: false,
        error: 'SUBSCRIPTION_OR_TRIAL_REQUIRED',
        message: 'A cryptographically signed license or 14-day free trial token is required to access AI toxicology analysis.',
        requiresPayment: true,
        stellarTreasury: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJULST',
      });
    }
  }

  const verification = licensingEngine.verifyToken(token);

  if (!verification.valid) {
    return res.status(402).json({
      success: false,
      error: 'TRIAL_EXPIRED_PAYMENT_REQUIRED',
      message: verification.reason || 'Your 14-day free trial has expired. Subscribe via Stellar to continue.',
      daysRemaining: 0,
      hoursRemaining: 0,
      isExpired: true,
      requiresPayment: true,
      stellarTreasury: 'GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJULST',
    });
  }

  // Attach verified license to request
  (req as any).license = verification;
  next();
}
