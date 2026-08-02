/**
 * Shared in-memory coupon selection per session.
 */

const sessionCoupons = new Map<string, string>();

export function getSessionCoupon(sessionId: string): string | undefined {
  return sessionCoupons.get(sessionId);
}

export function setSessionCoupon(sessionId: string, couponCode: string): void {
  sessionCoupons.set(sessionId, couponCode.trim().toUpperCase());
}

export function clearSessionCoupon(sessionId: string): void {
  sessionCoupons.delete(sessionId);
}
