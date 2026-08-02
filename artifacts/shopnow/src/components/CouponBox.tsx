/**
 * CouponBox.tsx
 *
 * Coupon entry UI for the cart order summary.
 * Calls POST /cart/coupon to apply and DELETE /cart/coupon to remove.
 * Reads the current couponApplied and couponInfo from the cart response.
 */

import React, { useState } from 'react';
import { Tag, X, Check, ChevronRight, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getGetCartQueryKey } from '@workspace/api-client-react';

interface CouponInfo {
  code: string;
  campaignName?: string;
  discountType?: string;
  discountValue?: number;
  appliedDiscount?: number;
  eligibleSubtotal?: number;
  rejectionReason?: string;
}

interface CouponBoxProps {
  couponApplied: string | null;
  couponInfo?: CouponInfo | null;
  discount: number;
}

export function CouponBox({
  couponApplied,
  couponInfo,
  discount,
}: CouponBoxProps) {
  const queryClient = useQueryClient();
  const [code, setCode] = useState(couponApplied ?? '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(n);

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/cart/coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ couponCode: code.trim() }),
      });
      const data = await res.json();
      if (data.couponInfo?.rejectionReason) {
        setError(data.couponInfo.rejectionReason);
      }
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch {
      setError('Could not apply coupon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);
    try {
      await fetch('/api/cart/coupon', {
        method: 'DELETE',
        credentials: 'include',
      });
      setCode('');
      await queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
    } catch {
      setError('Could not remove coupon.');
    } finally {
      setLoading(false);
    }
  };

  const isApplied = !!couponApplied && !couponInfo?.rejectionReason;

  return (
    <div className="mt-3">
      {/* Applied coupon banner */}
      {isApplied && (
        <div className="flex items-center justify-between bg-green-50 dark:bg-emerald-950/60 border border-green-200 dark:border-emerald-800 rounded-lg px-3 py-2 mb-2">
          <div className="flex items-center gap-2">
            <Check
              size={14}
              className="text-green-600 dark:text-emerald-400 flex-shrink-0"
            />
            <div>
              <span className="text-xs font-bold text-green-700 dark:text-emerald-300">
                {couponApplied}
              </span>
              {couponInfo?.campaignName && (
                <span className="text-xs text-green-600 dark:text-emerald-400 ml-1">
                  — {couponInfo.campaignName}
                </span>
              )}
              <div className="text-xs text-green-700 dark:text-emerald-300 font-semibold">
                You save {formatPrice(discount)}!
              </div>
            </div>
          </div>
          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-green-600 dark:text-emerald-400 hover:text-red-500 transition-colors"
            aria-label="Remove coupon"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Rejection banner */}
      {couponInfo?.rejectionReason && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 mb-2">
          <X size={13} className="text-red-500 flex-shrink-0" />
          <span className="text-xs text-red-600 dark:text-red-400">
            {couponInfo.rejectionReason}
          </span>
        </div>
      )}

      {/* Entry form */}
      {!isApplied && (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Tag
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              placeholder="Enter coupon code"
              className="w-full pl-7 pr-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-xs font-mono font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <button
            onClick={handleApply}
            disabled={loading || !code.trim()}
            className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1"
          >
            {loading ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <>
                Apply <ChevronRight size={12} />
              </>
            )}
          </button>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
