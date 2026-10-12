import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { apiFetch } from '../../api/client.ts';
import { AttendanceRecord, Member } from '../../types/index.ts';
import {
  QrCode,
  RefreshCw,
  Clock,
  CheckCircle2,
  Users,
  ShieldCheck,
  Maximize2,
  Minimize2,
  Copy,
  Check,
} from 'lucide-react';

interface AttendanceQrTabProps {
  members: Member[];
  onManualCheckInClick: () => void;
}

export const AttendanceQrTab: React.FC<AttendanceQrTabProps> = ({
  members,
  onManualCheckInClick,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secret, setSecret] = useState<string>('FP-ATTEND-KEY-2026');
  const [todayDate, setTodayDate] = useState<string>('2026-09-30');
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isKioskMode, setIsKioskMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const loadQrAndLogs = async () => {
    try {
      const qrRes = await apiFetch('/api/attendance/qr-code');
      setSecret(qrRes.secret);
      setTodayDate(qrRes.today);

      // Generate visual QR image
      const url = await QRCode.toDataURL(qrRes.qrPayload, {
        width: 320,
        margin: 2,
        color: {
          dark: '#030712',
          light: '#f8fafc',
        },
      });
      setQrDataUrl(url);

      const allLogs = await apiFetch('/api/attendance/all');
      setLogs(allLogs);
    } catch (err) {
      console.error('Failed to generate attendance QR', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQrAndLogs();
  }, []);

  const handleCopySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const todayLogs = logs.filter((l) => l.date === todayDate);

  return (
    <div className="space-y-6">
      {/* Top Banner & Kiosk Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>FitPulse Reception Check-in Station</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Display this QR code at your front desk entrance turnstile. Members scan from their FitPulse app.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsKioskMode(!isKioskMode)}
            className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center gap-1.5 hover:bg-amber-500/25 transition-colors"
          >
            {isKioskMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isKioskMode ? 'Exit Kiosk View' : 'Reception Kiosk Mode'}</span>
          </button>

          <button
            onClick={loadQrAndLogs}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh attendance stream"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Grid: QR Display on Left, Real-time Check-ins on Right */}
      <div className={`grid gap-6 ${isKioskMode ? 'grid-cols-1 max-w-xl mx-auto' : 'grid-cols-1 lg:grid-cols-12'}`}>
        {/* QR Code Presentation Box */}
        <div className={`${isKioskMode ? 'col-span-1' : 'lg:col-span-5'} bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center shadow-xl flex flex-col items-center justify-center relative overflow-hidden`}>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Turnstile #1 &bull; Active &amp; Live</span>
          </div>

          <div className="p-4 bg-white rounded-3xl shadow-2xl inline-block border-4 border-amber-500/30 my-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Attendance QR Code" className="w-64 h-64 object-contain" />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-xs text-slate-500">
                Generating QR Token...
              </div>
            )}
          </div>

          <h4 className="text-base font-black text-white mt-4 tracking-tight">SCAN TO CHECK IN</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Open the FitPulse member app, tap "Scan Attendance QR", and point your phone.
          </p>

          <div className="mt-4 pt-4 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400">
            <span>Date: <strong className="text-white">{todayDate}</strong></span>
            <button
              onClick={handleCopySecret}
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied Token' : 'Copy Secret'}</span>
            </button>
          </div>
        </div>

        {/* Real-time check-in stream (unless in kiosk mode) */}
        {!isKioskMode && (
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Today's Check-ins ({todayLogs.length})</span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Real-time attendance verification stream</p>
              </div>

              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                {todayLogs.length} Checked In
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto max-h-[460px] pr-1">
              {todayLogs.length === 0 ? (
                <div className="py-16 text-center text-xs text-slate-500">
                  No attendance logs recorded for today yet.
                </div>
              ) : (
                todayLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={log.memberPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={log.memberName}
                        className="w-10 h-10 rounded-xl object-cover border border-amber-500/30"
                      />
                      <div>
                        <div className="text-xs font-bold text-white">{log.memberName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{log.time}</span>
                          </span>
                          <span>&bull;</span>
                          <span>{log.memberEmail}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-amber-400">
                      {log.method === 'qr_scan' ? 'QR Scanned' : 'Manual Desk'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
