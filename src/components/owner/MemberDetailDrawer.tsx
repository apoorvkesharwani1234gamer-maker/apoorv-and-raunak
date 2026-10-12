import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { Member, PaymentRecord, AttendanceRecord } from '../../types/index.ts';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Flame,
  Pause,
  Play,
  Clock,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  PlusCircle,
  FileText,
} from 'lucide-react';

interface MemberDetailDrawerProps {
  memberId: string;
  onClose: () => void;
  onUpdated: () => void;
}

export const MemberDetailDrawer: React.FC<MemberDetailDrawerProps> = ({
  memberId,
  onClose,
  onUpdated,
}) => {
  const [member, setMember] = useState<Member | null>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'info' | 'payments' | 'attendance'>('info');

  // Freeze modal state
  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeReason, setFreezeReason] = useState('Medical leave / Injury');

  // Extend modal state
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [extendDays, setExtendDays] = useState('7');
  const [extendReason, setExtendReason] = useState('Owner courtesy extension');

  const [actionMsg, setActionMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const mem = await apiFetch(`/api/members/${memberId}`);
      setMember(mem);

      const allPays = await apiFetch('/api/payments');
      setPayments(allPays.filter((p: PaymentRecord) => p.memberId === memberId));

      const allAtt = await apiFetch('/api/attendance/all');
      setAttendance(allAtt.filter((a: AttendanceRecord) => a.memberId === memberId));
    } catch (err) {
      console.error('Failed to load member detail', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [memberId]);

  const handleManualCheckIn = async () => {
    try {
      const res = await apiFetch('/api/attendance/manual-checkin', {
        method: 'POST',
        body: JSON.stringify({ memberId }),
      });
      setActionMsg(res.message || 'Check-in recorded!');
      await loadData();
      onUpdated();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Check-in failed');
    }
  };

  const handleFreeze = async () => {
    try {
      await apiFetch(`/api/members/${memberId}/freeze`, {
        method: 'POST',
        body: JSON.stringify({ reason: freezeReason }),
      });
      setShowFreezeModal(false);
      setActionMsg('Membership paused/frozen successfully.');
      await loadData();
      onUpdated();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to pause membership');
    }
  };

  const handleUnfreeze = async () => {
    try {
      const res = await apiFetch(`/api/members/${memberId}/unfreeze`, {
        method: 'POST',
      });
      setActionMsg(`Membership unpaused! ${res.extraDaysAdded || 0} frozen days restored.`);
      await loadData();
      onUpdated();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to unpause membership');
    }
  };

  const handleExtend = async () => {
    try {
      const res = await apiFetch(`/api/members/${memberId}/extend`, {
        method: 'POST',
        body: JSON.stringify({ days: extendDays, reason: extendReason }),
      });
      setShowExtendModal(false);
      setActionMsg(`Membership extended by ${extendDays} days! New expiry: ${res.newExpiry}`);
      await loadData();
      onUpdated();
      setTimeout(() => setActionMsg(null), 3000);
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to extend membership');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to deactivate and remove ${member?.fullName}?`)) {
      return;
    }
    try {
      await apiFetch(`/api/members/${memberId}`, { method: 'DELETE' });
      onUpdated();
      onClose();
    } catch (err: any) {
      setActionMsg(err.message || 'Failed to deactivate member');
    }
  };

  if (loading || !member) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl text-xs text-slate-400">
          Loading customer profile...
        </div>
      </div>
    );
  }

  // Remaining days calculation
  const todayTime = new Date('2026-09-30T08:55:00Z').getTime();
  const expTime = new Date(member.expiryDate).getTime();
  const remainingDays = Math.ceil((expTime - todayTime) / (1000 * 60 * 60 * 24));

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900/95 backdrop-blur z-20">
          <div className="flex items-center gap-3">
            <img
              src={member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={member.fullName}
              className="w-12 h-12 rounded-2xl object-cover border border-amber-500/30"
            />
            <div>
              <h3 className="text-lg font-bold text-white">{member.fullName}</h3>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{member.planName}</span>
                <span>&bull;</span>
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    member.status === 'active'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : member.status === 'expiring'
                      ? 'bg-amber-500/20 text-amber-300'
                      : member.status === 'frozen'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {member.status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action feedback message */}
        {actionMsg && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{actionMsg}</span>
          </div>
        )}

        {/* Action Buttons Toolbar */}
        <div className="p-4 mx-6 my-4 bg-slate-950 border border-slate-800 rounded-2xl flex flex-wrap gap-2 items-center">
          <button
            onClick={handleManualCheckIn}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Manual Check-in</span>
          </button>

          <button
            onClick={() => setShowExtendModal(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 hover:text-amber-400 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Extend Plan</span>
          </button>

          {member.status === 'frozen' ? (
            <button
              onClick={handleUnfreeze}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Unpause Membership</span>
            </button>
          ) : (
            <button
              onClick={() => setShowFreezeModal(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-blue-400 hover:bg-blue-500/10 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Freeze / Pause</span>
            </button>
          )}

          <button
            onClick={handleDelete}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-red-400 hover:bg-red-500/10 font-semibold text-xs ml-auto flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Deactivate</span>
          </button>
        </div>

        {/* Sub-tabs switcher */}
        <div className="flex border-b border-slate-800 px-6 gap-6 text-xs font-bold uppercase tracking-wider">
          <button
            onClick={() => setActiveSubTab('info')}
            className={`pb-3 transition-colors ${
              activeSubTab === 'info'
                ? 'border-b-2 border-amber-500 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Profile Info
          </button>
          <button
            onClick={() => setActiveSubTab('payments')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'payments'
                ? 'border-b-2 border-amber-500 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Invoices</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {payments.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('attendance')}
            className={`pb-3 transition-colors flex items-center gap-1.5 ${
              activeSubTab === 'attendance'
                ? 'border-b-2 border-amber-500 text-amber-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Attendance</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
              {attendance.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Profile Info */}
        {activeSubTab === 'info' && (
          <div className="p-6 space-y-5">
            {/* Membership status card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Current Plan:</span>
                <span className="font-bold text-white">{member.planName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Validity:</span>
                <span className="text-slate-200">
                  {member.startDate} &rarr;{' '}
                  <strong className="text-amber-400">{member.expiryDate}</strong>
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Remaining Period:</span>
                <span className="font-mono font-bold text-emerald-400">
                  {remainingDays > 0 ? `${remainingDays} Days` : `Expired ${Math.abs(remainingDays)}d ago`}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Paid:</span>
                <span className="font-mono font-bold text-white">${member.amountPaid}</span>
              </div>
              {member.frozenAt && (
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                  Paused on {member.frozenAt}: "{member.freezeReason}"
                </div>
              )}
            </div>

            {/* Attendance & Streak metrics */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Streak</div>
                <div className="text-base font-black text-amber-400 mt-0.5">🔥 {member.streak}d</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Longest</div>
                <div className="text-base font-black text-white mt-0.5">🏆 {member.longestStreak}d</div>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
                <div className="text-[10px] uppercase font-bold text-slate-400">Total Visits</div>
                <div className="text-base font-black text-emerald-400 mt-0.5">{member.totalVisits}</div>
              </div>
            </div>

            {/* Contact details */}
            <div className="space-y-3 pt-2 text-xs">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contact &amp; Identification
              </h4>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-200">{member.phone}</span>
                </div>
                <a
                  href={`tel:${member.phone}`}
                  className="px-2.5 py-1 bg-slate-900 text-amber-400 text-[10px] font-bold rounded-lg border border-slate-800"
                >
                  Call
                </a>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Mail className="w-4 h-4 text-slate-500" />
                  <span className="text-slate-200">{member.email}</span>
                </div>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{member.googleLinked ? 'Google Linked' : 'Pending Link'}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="text-slate-200">{member.address}</span>
              </div>

              {member.emergencyContact && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Emergency Contact:</span>
                  <span className="text-slate-200 font-medium">{member.emergencyContact}</span>
                </div>
              )}

              {member.notes && (
                <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] text-slate-400 block mb-0.5">Internal Notes:</span>
                  <span className="text-slate-300 italic whitespace-pre-line">{member.notes}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Payments / Invoices */}
        {activeSubTab === 'payments' && (
          <div className="p-6 space-y-3">
            {payments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No payment records found.</div>
            ) : (
              payments.map((p) => (
                <div
                  key={p.id}
                  className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono font-bold text-amber-400">{p.invoiceNo}</span>
                    <span className="text-xs font-mono font-bold text-white">${p.amount}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>{p.planName}</span>
                    <span className="uppercase text-[10px] text-emerald-400 font-bold">{p.status}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex justify-between pt-1 border-t border-slate-900">
                    <span>Ref: {p.transactionRef}</span>
                    <span>Extended to: {p.expiryExtendedTo}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 3: Attendance History */}
        {activeSubTab === 'attendance' && (
          <div className="p-6 space-y-2.5">
            {attendance.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">No attendance check-ins yet.</div>
            ) : (
              attendance.map((att) => (
                <div
                  key={att.id}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-bold text-white">{att.date}</div>
                      <div className="text-[11px] text-slate-400">{att.time}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-slate-900 px-2 py-0.5 rounded text-slate-400 border border-slate-800">
                    {att.method === 'qr_scan' ? 'QR Scan' : 'Manual'}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* Extend Modal */}
        {showExtendModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
              <h4 className="text-sm font-bold text-white mb-2">Extend Membership</h4>
              <p className="text-xs text-slate-400 mb-4">
                Add bonus days to {member.fullName}'s active validity.
              </p>

              <div className="space-y-3 mb-4">
                <div className="flex gap-2">
                  {['7', '15', '30', '60'].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setExtendDays(d)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors ${
                        extendDays === d
                          ? 'bg-amber-500 text-slate-950 border-amber-500'
                          : 'bg-slate-950 text-slate-300 border-slate-800'
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Reason for Extension</label>
                  <input
                    type="text"
                    value={extendReason}
                    onChange={(e) => setExtendReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleExtend}
                  className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 rounded-xl text-xs"
                >
                  Confirm Extension
                </button>
                <button
                  onClick={() => setShowExtendModal(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Freeze Modal */}
        {showFreezeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80">
            <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl">
              <h4 className="text-sm font-bold text-white mb-2">Pause / Freeze Membership</h4>
              <p className="text-xs text-slate-400 mb-4">
                Temporarily pause membership countdown for {member.fullName}.
              </p>

              <div className="mb-4">
                <label className="block text-[10px] text-slate-400 mb-1">Reason for Hold</label>
                <input
                  type="text"
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  placeholder="e.g. Vacation, Doctor advice..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleFreeze}
                  className="flex-1 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold py-2 rounded-xl text-xs"
                >
                  Pause Now
                </button>
                <button
                  onClick={() => setShowFreezeModal(false)}
                  className="px-3 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
