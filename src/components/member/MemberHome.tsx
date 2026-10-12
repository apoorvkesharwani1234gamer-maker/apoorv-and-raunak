import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { apiFetch } from '../../api/client.ts';
import { Announcement } from '../../types/index.ts';
import { QrScannerModal } from './QrScannerModal.tsx';
import { RenewModal } from './RenewModal.tsx';
import { AttendanceHistoryModal } from './AttendanceHistoryModal.tsx';
import { WorkoutViewModal } from './WorkoutViewModal.tsx';
import { DietViewModal } from './DietViewModal.tsx';
import { ProgressModal } from './ProgressModal.tsx';
import { ProfileModal } from './ProfileModal.tsx';
import {
  QrCode,
  Flame,
  Calendar,
  Sparkles,
  CreditCard,
  Dumbbell,
  Apple,
  TrendingUp,
  Clock,
  Phone,
  MessageCircle,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  Bell,
  UserCheck,
} from 'lucide-react';

export const MemberHome: React.FC = () => {
  const { member, refreshMember } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modal active states
  const [showQrModal, setShowQrModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showDietModal, setShowDietModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    async function loadAnnouncements() {
      try {
        const data = await apiFetch('/api/announcements');
        setAnnouncements(data);
      } catch (err) {
        console.error('Failed to load announcements', err);
      }
    }
    loadAnnouncements();
  }, []);

  if (!member) {
    return (
      <div className="py-20 text-center text-slate-400 text-sm">
        Loading FitPulse member profile...
      </div>
    );
  }

  // Calculate remaining days
  const todayTime = new Date('2026-09-30T08:55:00Z').getTime();
  const expiryTime = new Date(member.expiryDate).getTime();
  const remainingDays = Math.ceil((expiryTime - todayTime) / (1000 * 60 * 60 * 24));

  const isExpired = remainingDays < 0;
  const isExpiringSoon = remainingDays >= 0 && remainingDays <= 5;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Header greeting */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hello, {member.fullName.split(' ')[0]} 👋
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            FitPulse Fitness Club &bull; Welcome back to your workout session!
          </p>
        </div>

        <button
          onClick={() => setShowProfileModal(true)}
          className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 transition-colors"
          title="Edit Profile & Contact Details"
        >
          <img
            src={member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt={member.fullName}
            className="w-9 h-9 rounded-xl object-cover border border-amber-500/30"
          />
          <div className="text-left hidden sm:block">
            <div className="text-xs font-bold text-white line-clamp-1">{member.fullName}</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3 h-3" />
              <span>Google Linked</span>
            </div>
          </div>
        </button>
      </div>

      {/* Urgent Expiry Banner if applicable */}
      {isExpiringSoon && !isExpired && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/40 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300">
                Membership Expiring in {remainingDays} {remainingDays === 1 ? 'Day' : 'Days'}!
              </div>
              <p className="text-[11px] text-slate-300">
                Renew now to maintain your uninterrupted gym access and attendance streak.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRenewModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 shadow-md shadow-amber-500/20 transition-all active:scale-95"
          >
            Renew Now
          </button>
        </div>
      )}

      {isExpired && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-red-300">Membership Has Expired!</div>
              <p className="text-[11px] text-slate-300">
                Please renew your pass online to unlock turnstile QR check-in.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowRenewModal(true)}
            className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-xs shrink-0 shadow-md shadow-red-500/20 transition-all active:scale-95"
          >
            Renew Pass
          </button>
        </div>
      )}

      {/* 2. Top Cards Grid (Membership Card & Attendance Card) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* MEMBERSHIP CARD */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden group">
          {/* Subtle accent glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Membership Card
              </span>
              <h2 className="text-lg font-black text-white mt-0.5">{member.planName}</h2>
            </div>

            <span
              className={`text-[11px] font-black uppercase px-2.5 py-1 rounded-full border shadow-sm ${
                member.status === 'active'
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : member.status === 'expiring'
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                  : member.status === 'frozen'
                  ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                  : 'bg-red-500/15 text-red-400 border-red-500/30'
              }`}
            >
              {member.status === 'frozen' ? 'PAUSED' : member.status.toUpperCase()}
            </span>
          </div>

          <div className="my-5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Time Remaining</div>
              <div className="text-xl font-black text-amber-400 font-mono tracking-tight mt-0.5">
                {remainingDays > 0
                  ? `${remainingDays} Days Remaining`
                  : remainingDays === 0
                  ? 'Expires Today'
                  : `Expired ${Math.abs(remainingDays)}d ago`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">Expiry Date</div>
              <div className="text-xs font-semibold text-slate-300 mt-0.5">{member.expiryDate}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-1">
            <span>
              Member Since: <strong className="text-slate-200">{member.startDate}</strong>
            </span>
            <span className="font-mono text-[11px] text-slate-500">ID: {member.id}</span>
          </div>

          <button
            onClick={() => setShowRenewModal(true)}
            className="w-full bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-200 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 border border-slate-700/60"
          >
            <CreditCard className="w-4 h-4 text-amber-400" />
            <span>Renew Membership &bull; Instant Pass</span>
          </button>
        </div>

        {/* ATTENDANCE CARD */}
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl overflow-hidden group">
          <div className="absolute top-0 right-0 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all pointer-events-none" />

          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">
                Attendance Consistency
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xl font-black text-white">🔥 {member.streak} Day Streak</span>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5"
            >
              <span>History</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick 4-stat metrics */}
          <div className="grid grid-cols-3 gap-2.5 my-4">
            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Longest</div>
              <div className="text-base font-black text-amber-400 mt-0.5">🏆 {member.longestStreak}</div>
              <div className="text-[9px] text-slate-500">Days</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">This Month</div>
              <div className="text-base font-black text-white mt-0.5">{member.monthlyVisits || 0}</div>
              <div className="text-[9px] text-slate-500">Check-ins</div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Visits</div>
              <div className="text-base font-black text-emerald-400 mt-0.5">{member.totalVisits || 0}</div>
              <div className="text-[9px] text-slate-500">Sessions</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pt-1">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>
                Last Visit: <strong className="text-slate-200">{member.lastVisit || 'No visits recorded yet'}</strong>
              </span>
            </span>
          </div>

          <button
            onClick={() => setShowQrModal(true)}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-2.5 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <QrCode className="w-4 h-4 fill-slate-950" />
            <span>Scan Attendance QR Desk</span>
          </button>
        </div>
      </div>

      {/* 3. Quick Actions Grid */}
      <div>
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 px-1">
          Quick Actions &amp; Gym Services
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Action: Scan Attendance QR */}
          <button
            onClick={() => setShowQrModal(true)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
              Scan Attendance QR
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Self check-in at reception</p>
          </button>

          {/* Action: Renew Membership */}
          <button
            onClick={() => setShowRenewModal(true)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
              Renew Membership
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Extend your pass online</p>
          </button>

          {/* Action: Attendance History */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
              Attendance History
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">View your workout visits</p>
          </button>

          {/* Action: Workout Plan */}
          <button
            onClick={() => setShowWorkoutModal(true)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-blue-300 transition-colors">
              Workout Routine
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Exercises, sets &amp; timer</p>
          </button>

          {/* Action: Diet Guidance */}
          <button
            onClick={() => setShowDietModal(true)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Apple className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
              Diet Guidance
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Calories &amp; meal schedules</p>
          </button>

          {/* Action: Progress Tracking */}
          <button
            onClick={() => setShowProgressModal(true)}
            className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-850 transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
              Body Stats &amp; Progress
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Weight &amp; measurements</p>
          </button>
        </div>
      </div>

      {/* 4. Gym Announcements */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800">
        <div className="flex items-center gap-2 mb-3">
          <Bell className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">
            Gym Announcements &amp; Events
          </h3>
        </div>

        <div className="space-y-3">
          {announcements.slice(0, 2).map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{ann.title}</span>
                <span className="text-[10px] bg-amber-500/15 text-amber-300 px-2 py-0.5 rounded-full font-mono">
                  {ann.tag}
                </span>
              </div>
              <p className="text-xs text-slate-300">{ann.content}</p>
              <div className="text-[10px] text-slate-500 pt-1">Posted by {ann.author} &bull; {ann.date}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Gym Contact & Reception bar */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white">FitPulse Gym Desk</div>
            <div className="text-[11px] text-slate-400">742 Iron Forge Blvd &bull; Open 5:30 AM - 10:30 PM</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="tel:+15559876543"
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-amber-400" />
            <span>Call Reception</span>
          </a>
          <a
            href="https://wa.me/15559876543"
            target="_blank"
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Render Modals */}
      {showQrModal && (
        <QrScannerModal
          onClose={() => setShowQrModal(false)}
          onSuccess={() => {
            refreshMember();
          }}
        />
      )}

      {showRenewModal && (
        <RenewModal
          onClose={() => setShowRenewModal(false)}
          onSuccess={() => {
            refreshMember();
          }}
        />
      )}

      {showHistoryModal && (
        <AttendanceHistoryModal
          onClose={() => setShowHistoryModal(false)}
          streak={member.streak}
          longestStreak={member.longestStreak}
        />
      )}

      {showWorkoutModal && <WorkoutViewModal onClose={() => setShowWorkoutModal(false)} />}

      {showDietModal && <DietViewModal onClose={() => setShowDietModal(false)} />}

      {showProgressModal && <ProgressModal onClose={() => setShowProgressModal(false)} />}

      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};
