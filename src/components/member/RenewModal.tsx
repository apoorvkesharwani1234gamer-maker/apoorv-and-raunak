import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { MembershipPlan, PaymentRecord } from '../../types/index.ts';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  X,
  FileText,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface RenewModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const RenewModal: React.FC<RenewModalProps> = ({ onClose, onSuccess }) => {
  const { member, refreshMember } = useAuth();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [loading, setLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [confirmedReceipt, setConfirmedReceipt] = useState<PaymentRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPlans() {
      try {
        const data = await apiFetch('/api/plans');
        setPlans(data);
        if (data.length > 0) {
          // Preselect current plan or the popular quarterly plan
          const match = data.find((p: MembershipPlan) => p.id === member?.planId) || data[1] || data[0];
          setSelectedPlanId(match.id);
        }
      } catch (err) {
        console.error('Failed to load membership plans', err);
      }
    }
    fetchPlans();
  }, [member]);

  const selectedPlan = plans.find((p) => p.id === selectedPlanId);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('fitpulse.gym@okaxis');
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleRenewPayment = async () => {
    if (!selectedPlanId) return;
    setLoading(true);
    setError(null);

    try {
      const res = await apiFetch('/api/payments/renew', {
        method: 'POST',
        body: JSON.stringify({
          planId: selectedPlanId,
          paymentMethod,
          transactionRef: `${paymentMethod.toUpperCase()}-${Date.now().toString().slice(-6)}`,
        }),
      });

      setConfirmedReceipt(res.payment);

      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#f59e0b', '#10b981', '#3b82f6'],
      });

      await refreshMember();
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment processing failed. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmedReceipt ? (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Renew Membership</h3>
                <p className="text-xs text-slate-400">
                  Current plan expires: <strong className="text-amber-400">{member?.expiryDate}</strong>
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            {/* Step 1: Select Plan */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                1. Select Membership Duration
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((plan) => {
                  const isSelected = plan.id === selectedPlanId;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all relative ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/20'
                          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {plan.popular && (
                        <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-2 py-0.5 rounded-full shadow-sm">
                          Best Value
                        </span>
                      )}
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-bold text-white">{plan.name}</div>
                          <div className="text-[11px] text-slate-400">{plan.durationDays} Days Access</div>
                        </div>
                        <div className="text-sm font-black text-amber-400">${plan.price}</div>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">{plan.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Select Payment Method */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                2. Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'upi'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-5 h-5" />
                  <span className="text-[11px]">Instant UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'card'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-[11px]">Card / Debit</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('netbanking')}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${
                    paymentMethod === 'netbanking'
                      ? 'bg-amber-500/15 border-amber-500 text-amber-300 font-semibold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[11px]">Net Banking</span>
                </button>
              </div>

              {/* Payment preview details */}
              {paymentMethod === 'upi' && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 font-mono font-bold text-xs">
                      UPI
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">fitpulse.gym@okaxis</div>
                      <div className="text-[10px] text-slate-500">Official FitPulse Gym Merchant VPA</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyUpi}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                  >
                    {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
                  <span>Secured with 256-bit AES end-to-end payment gateway</span>
                  <span className="text-emerald-400 font-semibold">Ready</span>
                </div>
              )}
            </div>

            {/* Total & Action */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div>
                <span className="text-[11px] text-slate-400">Total Due:</span>
                <div className="text-2xl font-black text-amber-400">
                  ${selectedPlan?.price || 0}
                </div>
              </div>
              <button
                onClick={handleRenewPayment}
                disabled={loading || !selectedPlan}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-3.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? 'Processing Payment...' : 'Pay & Renew Pass Now'}
              </button>
            </div>
          </div>
        ) : (
          /* Receipt View */
          <div className="text-center py-2 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-500/30">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-white">Membership Renewed!</h3>
            <p className="text-xs text-slate-400 mt-1">
              Payment verified and invoice generated automatically.
            </p>

            <div className="mt-5 p-4 bg-slate-950 border border-slate-800 rounded-2xl text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-850 pb-2 text-slate-400">
                <span>Invoice:</span>
                <span className="text-white font-bold">{confirmedReceipt.invoiceNo}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Plan:</span>
                <span className="text-amber-400">{confirmedReceipt.planName}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Amount Paid:</span>
                <span className="text-white font-bold">${confirmedReceipt.amount}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Transaction Ref:</span>
                <span className="text-slate-300">{confirmedReceipt.transactionRef}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-850">
                <span className="text-emerald-400 font-sans font-bold">New Expiry Date:</span>
                <span className="text-emerald-400 font-bold">{confirmedReceipt.expiryExtendedTo}</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
