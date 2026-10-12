import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { AttendanceRecord } from '../../types/index.ts';
import { Calendar, Clock, X, Flame, QrCode, CheckCircle2 } from 'lucide-react';

interface AttendanceHistoryModalProps {
  onClose: () => void;
  streak: number;
  longestStreak: number;
}

export const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({
  onClose,
  streak,
  longestStreak,
}) => {
  const [logs, setLogs] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAttendance() {
      try {
        const data = await apiFetch('/api/attendance/my');
        setLogs(data);
      } catch (err) {
        console.error('Failed to load attendance logs', err);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Attendance History</h3>
              <p className="text-xs text-slate-400">Your complete gym check-in record</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats highlight banner */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Current Streak</div>
              <div className="text-base font-black text-amber-400">{streak} Days</div>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
              🏆
            </div>
            <div>
              <div className="text-xs text-slate-400">Longest Streak</div>
              <div className="text-base font-black text-white">{longestStreak} Days</div>
            </div>
          </div>
        </div>

        {/* List of check-ins */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading check-in history...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No check-in records found. Scan the gym QR code upon your next visit!
            </div>
          ) : (
            logs.map((record) => (
              <div
                key={record.id}
                className="p-3.5 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{record.date}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{record.time}</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 flex items-center gap-1">
                  <QrCode className="w-3 h-3 text-amber-400" />
                  <span>{record.method === 'qr_scan' ? 'QR Scan' : 'Desk Verified'}</span>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
