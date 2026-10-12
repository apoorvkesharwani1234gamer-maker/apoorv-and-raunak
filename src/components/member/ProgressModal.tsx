import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { ProgressLog } from '../../types/index.ts';
import { TrendingUp, Plus, X, Calendar, Activity, Check } from 'lucide-react';

interface ProgressModalProps {
  onClose: () => void;
}

export const ProgressModal: React.FC<ProgressModalProps> = ({ onClose }) => {
  const [logs, setLogs] = useState<ProgressLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [weightKg, setWeightKg] = useState('');
  const [bodyFatPercent, setBodyFatPercent] = useState('');
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [bicepsCm, setBicepsCm] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadProgress = async () => {
    try {
      const data = await apiFetch('/api/progress/my');
      setLogs(data);
    } catch (err) {
      console.error('Failed to load progress', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weightKg) return;
    setSubmitting(true);
    try {
      await apiFetch('/api/progress/my', {
        method: 'POST',
        body: JSON.stringify({
          weightKg: parseFloat(weightKg),
          bodyFatPercent: bodyFatPercent ? parseFloat(bodyFatPercent) : undefined,
          chestCm: chestCm ? parseFloat(chestCm) : undefined,
          waistCm: waistCm ? parseFloat(waistCm) : undefined,
          bicepsCm: bicepsCm ? parseFloat(bicepsCm) : undefined,
          notes,
        }),
      });

      setWeightKg('');
      setBodyFatPercent('');
      setChestCm('');
      setWaistCm('');
      setBicepsCm('');
      setNotes('');
      setShowAddForm(false);
      await loadProgress();
    } catch (err) {
      console.error('Failed to log progress', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Progress &amp; Body Stats</h3>
              <p className="text-xs text-slate-400">Track weight, body fat %, and circumference changes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Toggle */}
        <div className="flex justify-between items-center my-3">
          <span className="text-xs font-bold uppercase text-slate-400">Past Measurement Logs</span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddForm ? 'Cancel' : 'Log New Stats'}</span>
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form onSubmit={handleAddLog} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl mb-3 space-y-3 animate-in fade-in">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Weight (kg) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  placeholder="e.g. 64.2"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Body Fat (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 19.5"
                  value={bodyFatPercent}
                  onChange={(e) => setBodyFatPercent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Chest (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="92"
                  value={chestCm}
                  onChange={(e) => setChestCm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Waist (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="74"
                  value={waistCm}
                  onChange={(e) => setWaistCm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 mb-1">Biceps (cm)</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="32"
                  value={bicepsCm}
                  onChange={(e) => setBicepsCm(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Feeling energetic, reached 8 reps on bench..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-3 rounded-xl text-xs transition-colors"
            >
              {submitting ? 'Saving...' : 'Save Measurement Log'}
            </button>
          </form>
        )}

        {/* Logs list */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading progress...</div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No measurements logged yet. Click "Log New Stats" to record your starting baseline!
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-xs font-bold text-white">{log.date}</span>
                  </div>
                  <div className="text-xs font-black text-amber-400 font-mono">
                    {log.weightKg} kg
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                  {log.bodyFatPercent && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Fat: <strong className="text-blue-400">{log.bodyFatPercent}%</strong>
                    </span>
                  )}
                  {log.waistCm && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Waist: {log.waistCm}cm
                    </span>
                  )}
                  {log.chestCm && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Chest: {log.chestCm}cm
                    </span>
                  )}
                  {log.bicepsCm && (
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Arms: {log.bicepsCm}cm
                    </span>
                  )}
                </div>

                {log.notes && (
                  <p className="text-[11px] text-slate-400 italic pt-1 border-t border-slate-900">
                    "{log.notes}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
