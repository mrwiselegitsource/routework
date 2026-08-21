import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, AlertTriangle, Loader2 } from 'lucide-react';
import { db } from '../../lib/db';

export default function TrackingPasswordGate({ trackingNumber, onUnlocked, onCancel }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [remainingAttempts, setRemainingAttempts] = useState(3);
  const [locked, setLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState(null);
  const [countdown, setCountdown] = useState('');

  // Countdown timer for lockout
  useEffect(() => {
    if (!locked || !lockedUntil) return;
    const interval = setInterval(() => {
      const now = new Date();
      const until = new Date(lockedUntil);
      const diff = until - now;
      if (diff <= 0) {
        setLocked(false);
        setLockedUntil(null);
        setCountdown('');
        setRemainingAttempts(3);
        setError(null);
        clearInterval(interval);
        return;
      }
      const mins = Math.floor(diff / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setCountdown(`${mins}:${secs.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [locked, lockedUntil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim() || locked) return;

    setIsVerifying(true);
    setError(null);

    try {
      const result = await db.verifyTrackingPassword(trackingNumber, password.trim());

      if (result.success) {
        onUnlocked();
      } else {
        if (result.locked) {
          setLocked(true);
          setLockedUntil(result.lockedUntil || new Date(Date.now() + 15 * 60 * 1000).toISOString());
        }
        setRemainingAttempts(result.remainingAttempts ?? 0);
        setError(result.error || 'Invalid tracking credentials.');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsVerifying(false);
      setPassword('');
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 border border-gray-100 text-center w-full max-w-lg mx-auto animate-[fadeIn_0.5s_ease-out]">
      
      {/* Lock Icon */}
      <div className="mx-auto w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        {locked ? (
          <ShieldAlert className="w-10 h-10 text-red-500" />
        ) : (
          <Lock className="w-10 h-10 text-[#0033a0]" />
        )}
      </div>

      <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Protected Shipment</h2>
      
      <p className="text-gray-500 mb-2 text-sm">
        Tracking Number: <span className="font-bold text-gray-700">{trackingNumber}</span>
      </p>

      {locked ? (
        /* Locked State */
        <div className="mt-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-800 font-bold mb-1">Account Temporarily Locked</p>
            <p className="text-red-600 text-sm">
              Too many unsuccessful attempts. Please try again later or contact RouteWorks support.
            </p>
            {countdown && (
              <p className="text-red-700 font-mono text-2xl mt-4 font-bold">{countdown}</p>
            )}
          </div>
          <a
            href="/contact"
            className="inline-block text-[#0033a0] font-bold text-sm hover:underline"
          >
            Contact RouteWorks Support →
          </a>
        </div>
      ) : (
        /* Password Entry State */
        <>
          <p className="text-gray-500 text-sm mb-6">
            Enter your tracking password to continue.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tracking Password"
                autoFocus
                className="w-full px-5 py-4 rounded-xl bg-gray-50 border-2 border-transparent focus:border-[#0033a0] focus:bg-white focus:outline-none transition-all text-center text-lg font-mono tracking-widest"
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {remainingAttempts < 3 && remainingAttempts > 0 && (
              <p className="text-amber-600 text-xs font-medium">
                {remainingAttempts} attempt{remainingAttempts !== 1 ? 's' : ''} remaining
              </p>
            )}

            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="w-full bg-[#0033a0] text-white font-bold py-4 rounded-xl hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Unlock Shipment
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-gray-400 text-xs mb-2">
              Lost your tracking password?
            </p>
            <a
              href="/contact"
              className="text-[#0033a0] font-bold text-sm hover:underline"
            >
              Contact RouteWorks Support →
            </a>
          </div>
        </>
      )}

      {onCancel && (
        <button
          onClick={onCancel}
          className="mt-4 text-gray-400 text-sm hover:text-gray-600 transition-colors"
        >
          ← Search a different tracking number
        </button>
      )}
    </div>
  );
}
