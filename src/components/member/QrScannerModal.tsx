import React, { useState } from 'react';
import { apiFetch } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import confetti from 'canvas-confetti';
import {
  QrCode,
  X,
  Camera,
  CheckCircle2,
  AlertCircle,
  Flame,
  Sparkles,
  Zap,
} from 'lucide-react';

interface QrScannerModalProps {
  onClose: () => void;
  onSuccess: (streak: number) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({ onClose, onSuccess }) => {
  const { member, refreshMember } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; streak?: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateScan = async (secretOverride?: string) => {
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      // Fetch gym's official attendance secret or use default
      let secret = secretOverride || 'FP-ATTEND-KEY-2026';
      try {
        const settings = await apiFetch('/api/settings');
        if (settings?.attendanceQrSecret) {
          secret = settings.attendanceQrSecret;
        }
      } catch {
        // fallback to default key
      }

      // Submit check-in payload to backend
      const res = await apiFetch('/api/attendance/check-in-qr', {
        method: 'POST',
        body: JSON.stringify({
          qrPayload: secret,
        }),
      });

      setResult({
        success: true,
        message: res.message || 'Check-in recorded successfully!',
        streak: res.streak,
      });

      // Confetti burst for streak celebration!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#f97316', '#10b981'],
      });

      await refreshMember();
      onSuccess(res.streak || 1);
    } catch (err: any) {
      setError(err.message || 'Attendance check-in failed.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Scan Gym Attendance QR</h3>
            <p className="text-xs text-slate-400">Point your camera at the gym reception desk QR</p>
          </div>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative aspect-square max-h-64 mx-auto w-full bg-slate-950 rounded-2xl border-2 border-slate-800 overflow-hidden flex flex-col items-center justify-center p-6 mb-5">
          {/* Scanning frame corner borders */}
          <div className="absolute top-3 left-3 w-7 h-7 border-t-2 border-l-2 border-amber-500 rounded-tl-lg" />
          <div className="absolute top-3 right-3 w-7 h-7 border-t-2 border-r-2 border-amber-500 rounded-tr-lg" />
          <div className="absolute bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 border-amber-500 rounded-bl-lg" />
          <div className="absolute bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 border-amber-500 rounded-br-lg" />

          {/* Animated laser line */}
          <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse shadow-sm shadow-amber-400" />

          {result?.success ? (
            <div className="text-center p-4 z-10 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h4 className="text-base font-extrabold text-white">Attendance Verified!</h4>
              <p className="text-xs text-emerald-400 mt-1 font-medium">{result.message}</p>
              {result.streak !== undefined && (
                <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-xs font-bold text-amber-300">
                  <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{result.streak} Day Streak Unlocked!</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center z-10 space-y-2">
              <Camera className="w-10 h-10 text-slate-600 mx-auto animate-bounce" />
              <p className="text-xs font-semibold text-slate-400">Position the QR code within this frame</p>
              <p className="text-[11px] text-slate-500">Reception Check-in Desk &bull; Turnstile #1</p>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Action button */}
        {!result?.success ? (
          <button
            onClick={() => handleSimulateScan()}
            disabled={scanning}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {scanning ? (
              <span>Verifying QR Signature...</span>
            ) : (
              <>
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>Tap to Scan Reception QR Code</span>
              </>
            )}
          </button>
        ) : (
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors"
          >
            Done &bull; Return to Home
          </button>
        )}
      </div>
    </div>
  );
};
