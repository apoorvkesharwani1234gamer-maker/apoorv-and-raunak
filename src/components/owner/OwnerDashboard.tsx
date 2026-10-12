import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { Member, MembershipPlan } from '../../types/index.ts';
import { AddMemberModal } from './AddMemberModal.tsx';
import { MemberDetailDrawer } from './MemberDetailDrawer.tsx';
import { RedListTab } from './RedListTab.tsx';
import { AttendanceQrTab } from './AttendanceQrTab.tsx';
import { PaymentsTab } from './PaymentsTab.tsx';
import { SettingsBackupTab } from './SettingsBackupTab.tsx';
import {
  Users,
  UserCheck,
  AlertTriangle,
  UserX,
  AlertOctagon,
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter,
  QrCode,
  CreditCard,
  Settings,
  ChevronRight,
  ShieldCheck,
  Flame,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';

export const OwnerDashboard: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'members' | 'redlist' | 'qr' | 'payments' | 'settings'>('members');

  // Modals & Drawer state
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Search & Filters for members
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadData = async () => {
    try {
      const [membersData, plansData] = await Promise.all([
        apiFetch('/api/members'),
        apiFetch('/api/plans'),
      ]);
      setMembers(membersData);
      setPlans(plansData);
    } catch (err) {
      console.error('Failed to load owner dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute key analytics
  const totalMembers = members.length;
  const activeMembers = members.filter((m) => m.status === 'active').length;
  const expiringMembers = members.filter((m) => m.status === 'expiring').length;
  const expiredMembers = members.filter((m) => m.status === 'expired').length;

  // Red List count: members absent >= 10 days
  const todayTime = new Date('2026-09-30T08:55:00Z').getTime();
  const redListCount = members.filter((m) => {
    if (m.status === 'inactive' || m.status === 'frozen') return false;
    let daysAbsent = 0;
    if (m.lastVisit) {
      daysAbsent = Math.floor((todayTime - new Date(m.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
    } else {
      daysAbsent = Math.floor((todayTime - new Date(m.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    }
    return daysAbsent >= 10;
  }).length;

  // Today's attendance: count of members with lastVisit === today
  const todayAttendance = members.filter((m) => m.lastVisit === '2026-09-30').length;

  // Filter members list
  const filteredMembers = members.filter((m) => {
    const matchSearch =
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery);

    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* 1. Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Owner Management Center
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono text-[10px] font-bold border border-amber-500/30">
              Admin
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            FitPulse Fitness Club &bull; Real-time operations, memberships, turnstile QR &amp; retention
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadData}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
            title="Reload data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      {/* 2. Top Analytics KPI Cards Grid (The 7 essential metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Members */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Total Members</div>
          <div className="text-xl font-black text-white font-mono mt-1">{totalMembers}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Enrolled</div>
        </div>

        {/* Active Members */}
        <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-slate-400">Active Pass</div>
          <div className="text-xl font-black text-emerald-400 font-mono mt-1">{activeMembers}</div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Valid passes</div>
        </div>

        {/* Expiring Soon */}
        <div
          onClick={() => {
            setActiveTab('members');
            setStatusFilter('expiring');
          }}
          className="p-3.5 bg-slate-900 border border-amber-500/30 rounded-2xl cursor-pointer hover:bg-amber-500/10 transition-colors"
        >
          <div className="text-[10px] uppercase font-bold text-amber-400">Expiring Soon</div>
          <div className="text-xl font-black text-amber-300 font-mono mt-1">{expiringMembers}</div>
          <div className="text-[10px] text-amber-400/80 mt-0.5">≤ 5 days left</div>
        </div>

        {/* Expired Members */}
        <div
          onClick={() => {
            setActiveTab('members');
            setStatusFilter('expired');
          }}
          className="p-3.5 bg-slate-900 border border-red-500/30 rounded-2xl cursor-pointer hover:bg-red-500/10 transition-colors"
        >
          <div className="text-[10px] uppercase font-bold text-red-400">Expired</div>
          <div className="text-xl font-black text-red-400 font-mono mt-1">{expiredMembers}</div>
          <div className="text-[10px] text-red-400/80 mt-0.5">Needs renewal</div>
        </div>

        {/* 10-Day Red List Members */}
        <div
          onClick={() => setActiveTab('redlist')}
          className="p-3.5 bg-slate-900 border border-red-500/40 rounded-2xl cursor-pointer hover:bg-red-500/15 transition-all group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-black text-red-400 tracking-wider">
              Red List (10d)
            </span>
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          </div>
          <div className="text-xl font-black text-red-400 font-mono mt-1">{redListCount}</div>
          <div className="text-[10px] text-red-300 font-semibold mt-0.5 group-hover:underline">
            Take Action &rarr;
          </div>
        </div>

        {/* Today's Attendance */}
        <div
          onClick={() => setActiveTab('qr')}
          className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-850 transition-colors"
        >
          <div className="text-[10px] uppercase font-bold text-slate-400">Today Check-ins</div>
          <div className="text-xl font-black text-white font-mono mt-1">{todayAttendance}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Visits today</div>
        </div>

        {/* Today's Revenue */}
        <div
          onClick={() => setActiveTab('payments')}
          className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-850 transition-colors col-span-2 sm:col-span-1"
        >
          <div className="text-[10px] uppercase font-bold text-slate-400">Today Revenue</div>
          <div className="text-xl font-black text-amber-400 font-mono mt-1">$49</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total: $806</div>
        </div>
      </div>

      {/* 3. Main Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'members'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members Directory ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('redlist')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'redlist'
              ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>10-Day Red List</span>
          {redListCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 text-[10px] border border-red-800 font-mono">
              {redListCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('qr')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'qr'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Live Reception QR &amp; Check-ins</span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Payments &amp; Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'settings'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Gym Settings &amp; Backup</span>
        </button>
      </div>

      {/* 4. Tab Contents */}

      {/* TAB 1: MEMBERS DIRECTORY */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                placeholder="Search member by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="all">All Statuses ({members.length})</option>
                <option value="active">Active ({activeMembers})</option>
                <option value="expiring">Expiring Soon ({expiringMembers})</option>
                <option value="expired">Expired ({expiredMembers})</option>
                <option value="frozen">Frozen / Paused</option>
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Member</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Expiry Date</th>
                    <th className="py-3 px-4">Streak</th>
                    <th className="py-3 px-4">Last Check-in</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        Loading member database...
                      </td>
                    </tr>
                  ) : filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        No members found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => (
                      <tr
                        key={m.id}
                        onClick={() => setSelectedMemberId(m.id)}
                        className="hover:bg-slate-850/60 transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={m.fullName}
                              className="w-9 h-9 rounded-xl object-cover border border-amber-500/20 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white group-hover:text-amber-300 transition-colors">
                                {m.fullName}
                              </div>
                              <div className="text-[10px] text-slate-400">{m.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-300">{m.planName}</td>

                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              m.status === 'active'
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                : m.status === 'expiring'
                                ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                                : m.status === 'frozen'
                                ? 'bg-blue-500/15 text-blue-300 border border-blue-500/30'
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-300">{m.expiryDate}</td>

                        <td className="py-3 px-4">
                          <span className="flex items-center gap-1 text-amber-400 font-mono font-bold">
                            <Flame className="w-3.5 h-3.5 fill-amber-400" />
                            <span>{m.streak}d</span>
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-400">
                          {m.lastVisit || <span className="text-slate-600 italic">Never</span>}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMemberId(m.id);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-slate-300 transition-colors"
                            title="Manage Member Profile"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 10-DAY RED LIST */}
      {activeTab === 'redlist' && (
        <RedListTab onSelectMember={(id) => setSelectedMemberId(id)} />
      )}

      {/* TAB 3: ATTENDANCE & RECEPTION QR */}
      {activeTab === 'qr' && (
        <AttendanceQrTab members={members} onManualCheckInClick={() => setShowAddModal(true)} />
      )}

      {/* TAB 4: PAYMENTS & REVENUE */}
      {activeTab === 'payments' && <PaymentsTab />}

      {/* TAB 5: GYM SETTINGS & BACKUP */}
      {activeTab === 'settings' && <SettingsBackupTab />}

      {/* Modals & Drawers */}
      {showAddModal && (
        <AddMemberModal
          plans={plans}
          onClose={() => setShowAddModal(false)}
          onAdded={() => {
            loadData();
          }}
        />
      )}

      {selectedMemberId && (
        <MemberDetailDrawer
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
          onUpdated={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
};
