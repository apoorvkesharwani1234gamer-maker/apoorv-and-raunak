import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { RedListMember } from '../../types/index.ts';
import {
  AlertOctagon,
  Phone,
  MessageCircle,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  UserX,
} from 'lucide-react';

interface RedListTabProps {
  onSelectMember: (memberId: string) => void;
}

export const RedListTab: React.FC<RedListTabProps> = ({ onSelectMember }) => {
  const [redList, setRedList] = useState<RedListMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadRedList = async () => {
    try {
      const data = await apiFetch('/api/attendance/red-list');
      setRedList(data);
    } catch (err) {
      console.error('Failed to load red list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRedList();
  }, []);

  const getWhatsAppLink = (item: RedListMember) => {
    const rawPhone = item.member.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hi ${item.member.fullName.split(' ')[0]}, we noticed you haven't visited FitPulse Gym for ${item.daysAbsent} days! We missed having you here. Everything okay with your workout routine? Let us know if you'd like a free refresher session with our trainer!`
    );
    return `https://wa.me/${rawPhone}?text=${text}`;
  };

  return (
    <div className="space-y-4">
      {/* Alert Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-red-500/20 via-orange-500/10 to-transparent border border-red-500/30 flex items-start gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 border border-red-500/30">
          <AlertOctagon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Automated 10-Day Retention Red List</span>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-red-500 text-white font-black">
              {redList.length} At-Risk
            </span>
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            FitPulse automatically flags active members who have not checked in for 10 or more days. Reaching out early significantly increases member retention and renewal rates.
          </p>
        </div>
      </div>

      {/* Red List Table / Cards */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Analyzing attendance logs...</div>
      ) : redList.length === 0 ? (
        <div className="py-16 text-center bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h4 className="text-base font-bold text-white">Awesome Consistency!</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Zero members are currently on the 10-day Red List. All active members are training regularly!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {redList.map((item) => {
            const isCritical = item.daysAbsent >= 20;
            return (
              <div
                key={item.member.id}
                className="p-4 bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div
                  className="flex items-center gap-3.5 cursor-pointer"
                  onClick={() => onSelectMember(item.member.id)}
                >
                  <img
                    src={item.member.photo || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
                    alt={item.member.fullName}
                    className="w-12 h-12 rounded-xl object-cover border border-red-500/30"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white hover:text-amber-400 transition-colors">
                        {item.member.fullName}
                      </span>
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isCritical
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {isCritical ? 'Critical 20d+' : 'High Risk'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                      <span>{item.member.planName}</span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Last seen: {item.lastSeenDate || 'Never checked in'}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Days Absent Badge & Action Buttons */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Inactivity</div>
                    <div className="text-base font-black font-mono text-red-400">
                      {item.daysAbsent} Days
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${item.member.phone}`}
                      className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
                      title={`Call ${item.member.fullName}`}
                    >
                      <Phone className="w-4 h-4 text-amber-400" />
                    </a>

                    <a
                      href={getWhatsAppLink(item)}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      title="Send pre-filled WhatsApp retention message"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp Follow-up</span>
                    </a>

                    <button
                      onClick={() => onSelectMember(item.member.id)}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
