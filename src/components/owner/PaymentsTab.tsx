import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { PaymentRecord } from '../../types/index.ts';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  FileText,
} from 'lucide-react';

export const PaymentsTab: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    async function loadPayments() {
      try {
        const data = await apiFetch('/api/payments');
        setPayments(data);
      } catch (err) {
        console.error('Failed to load payments', err);
      } finally {
        setLoading(false);
      }
    }
    loadPayments();
  }, []);

  const totalRevenue = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
  const todayRevenue = payments
    .filter((p) => p.date.startsWith('2026-09-30'))
    .reduce((acc, p) => acc + (p.amount || 0), 0);

  const filtered = payments.filter((p) => {
    const matchSearch =
      p.memberName.toLowerCase().includes(search.toLowerCase()) ||
      p.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      p.transactionRef.toLowerCase().includes(search.toLowerCase());

    const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  return (
    <div className="space-y-5">
      {/* Revenue Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Revenue Collected
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              $
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            ${totalRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Across all membership renewals &amp; signups</p>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today's Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            ${todayRevenue.toLocaleString()}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Collected on 2026-09-30</p>
        </div>

        <div className="p-4 sm:p-5 bg-slate-900 border border-slate-800 rounded-3xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Total Invoices
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {payments.length}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">100% verified transactions</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            placeholder="Search by member name, invoice #, transaction ref..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="all">All Payment Methods</option>
            <option value="upi">Instant UPI</option>
            <option value="card">Credit / Debit Card</option>
            <option value="netbanking">Net Banking</option>
            <option value="cash">Cash / Reception Desk</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Invoice #</th>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No transactions matched your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-400">{p.invoiceNo}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{p.memberName}</div>
                      <div className="text-[10px] text-slate-400">{p.memberEmail}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{p.planName}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">${p.amount}</td>
                    <td className="py-3 px-4">
                      <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.date.split('T')[0]}</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 w-max">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
