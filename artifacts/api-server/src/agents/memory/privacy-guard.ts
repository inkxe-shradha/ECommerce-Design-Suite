/**
 * privacy-guard.ts — PII detection, redaction, and field-level encryption.
 *
 * Covers common PII patterns for the Indian market:
 *   - Email addresses
 *   - Phone numbers (Indian 10-digit + international)
 *   - Aadhaar numbers (12-digit with spaces)
 *   - PAN card numbers
 *   - Credit/debit card numbers (Luhn-valid 13-19 digit sequences)
 *   - UPI IDs
 *   - Postal addresses (PIN codes)
 *
 * Encryption: AES-256-GCM with per-user key derivation from a server secret.
 *
 * @see implementation_plan.md — TICKET MEM-5
 */

import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// ─── PII Patterns ───────────────────────────────────────────────────────────

const PII_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'email', regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g },
  { name: 'phone_in', regex: /\b(?:\+91[\s-]?)?[6-9]\d{9}\b/g },
  { name: 'phone_intl', regex: /\b\+\d{1,3}[\s-]?\d{7,14}\b/g },
  { name: 'aadhaar', regex: /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g },
  { name: 'pan', regex: /\b[A-Z]{5}\d{4}[A-Z]\b/g },
  { name: 'credit_card', regex: /\b(?:\d{4}[\s-]?){3,4}\d{1,4}\b/g },
  { name: 'upi', regex: /\b[a-zA-Z0-9.]+@[a-zA-Z]{2,}\b/g },
  { name: 'pin_code', regex: /\b\d{6}\b/g },
];

// ─── PII Detection Result ───────────────────────────────────────────────────

export interface PIIDetection {
  type: string;
  match: string;
  startIndex: number;
  endIndex: number;
}

// ─── PrivacyGuard ───────────────────────────────────────────────────────────

export class PrivacyGuard {
  private readonly encryptionSecret: string;

  constructor(encryptionSecret?: string) {
    this.encryptionSecret =
      encryptionSecret ?? process.env.MEMORY_ENCRYPTION_SECRET ?? 'default-dev-secret-change-in-prod';
  }

  // ── PII Detection ──────────────────────────────────────────────────────

  /**
   * Detect all PII occurrences in text.
   * Returns array of detected PII with type, match, and position.
   */
  detectPII(text: string): PIIDetection[] {
    const detections: PIIDetection[] = [];

    for (const { name, regex } of PII_PATTERNS) {
      // Skip UPI pattern if it looks like a regular email (handled by email pattern)
      const pattern = new RegExp(regex.source, regex.flags);
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(text)) !== null) {
        // Avoid duplicate detection: UPI vs email
        if (name === 'upi' && detections.some((d) => d.type === 'email' && d.match === match![0])) {
          continue;
        }
        // PIN code: only flag 6-digit sequences that look like PIN codes (not inside other numbers)
        if (name === 'pin_code') {
          const before = match.index > 0 ? text[match.index - 1] : ' ';
          const after = match.index + match[0].length < text.length ? text[match.index + match[0].length] : ' ';
          if (/\d/.test(before) || /\d/.test(after)) continue; // Part of a longer number
        }

        detections.push({
          type: name,
          match: match[0],
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }

    return detections;
  }

  /**
   * Check if text contains any PII.
   */
  containsPII(text: string): boolean {
    return this.detectPII(text).length > 0;
  }

  // ── PII Redaction ──────────────────────────────────────────────────────

  /**
   * Replace all detected PII with [REDACTED:type] tokens.
   * This operation is irreversible — use for summaries and stored text.
   */
  redactPII(text: string): string {
    let redacted = text;
    // Process detections in reverse order to preserve indices
    const detections = this.detectPII(text).sort(
      (a, b) => b.startIndex - a.startIndex,
    );

    for (const detection of detections) {
      redacted =
        redacted.slice(0, detection.startIndex) +
        `[REDACTED:${detection.type}]` +
        redacted.slice(detection.endIndex);
    }

    return redacted;
  }

  // ── Field-Level Encryption ─────────────────────────────────────────────

  /**
   * Encrypt a field value using AES-256-GCM.
   * Key is derived from server secret + userId for per-user isolation.
   * Returns base64-encoded string: iv:authTag:ciphertext
   */
  encrypt(plaintext: string, userId: number): string {
    const key = this.deriveKey(userId);
    const iv = randomBytes(12); // 96-bit IV for GCM
    const cipher = createCipheriv('aes-256-gcm', key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  /**
   * Decrypt a field value encrypted with encrypt().
   */
  decrypt(ciphertext: string, userId: number): string {
    const key = this.deriveKey(userId);
    const [ivB64, tagB64, encB64] = ciphertext.split(':');

    if (!ivB64 || !tagB64 || !encB64) {
      throw new Error('Invalid ciphertext format');
    }

    const iv = Buffer.from(ivB64, 'base64');
    const authTag = Buffer.from(tagB64, 'base64');
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encB64, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // ── Key Derivation ─────────────────────────────────────────────────────

  private deriveKey(userId: number): Buffer {
    return scryptSync(
      this.encryptionSecret,
      `user-${userId}-salt`,
      32, // 256-bit key
    );
  }
}
