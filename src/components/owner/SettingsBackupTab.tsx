import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { GymSettings, Announcement } from '../../types/index.ts';
import {
  Settings,
  Download,
  Upload,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  Save,
  Building,
  Phone,
  Clock,
  QrCode,
} from 'lucide-react';

export const SettingsBackupTab: React.FC = () => {
  const [settings, setSettings] = useState<GymSettings | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // New announcement form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annTag, setAnnTag] = useState<'General' | 'Offer' | 'Urgent' | 'Event'>('General');
  const [postingAnn, setPostingAnn] = useState(false);

  // Restore state
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const s = await apiFetch('/api/settings');
      setSettings(s);
      const a = await apiFetch('/api/announcements');
      setAnnouncements(a);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    try {
      const updated = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      });
      setSettings(updated);
      setSaveMsg('Gym configuration saved successfully!');
      setTimeout(() => setSaveMsg(null), 3000);
    } catch (err: any) {
      setSaveMsg(err.message || 'Failed to save settings');
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    setPostingAnn(true);
    try {
      await apiFetch('/api/announcements', {
        method: 'POST',
        body: JSON.stringify({
          title: annTitle,
          content: annContent,
          tag: annTag,
        }),
      });
      setAnnTitle('');
      setAnnContent('');
      await loadData();
    } catch (err) {
      console.error('Failed to post announcement', err);
    } finally {
      setPostingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await apiFetch(`/api/announcements/${id}`, { method: 'DELETE' });
      await loadData();
    } catch (err) {
      console.error('Failed to delete announcement', err);
    }
  };

  // Full backup export
  const handleExportBackup = async () => {
    try {
      const data = await apiFetch('/api/backup/export');
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fitpulse-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export backup failed', err);
    }
  };

  // Restore backup
  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const res = await apiFetch('/api/backup/restore', {
          method: 'POST',
          body: JSON.stringify({ backupData: parsed }),
        });
        setRestoreStatus('Database successfully restored! Reloading...');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err: any) {
        setRestoreStatus(err.message || 'Invalid backup JSON file.');
      }
    };
    reader.readAsText(file);
  };

  if (loading || !settings) {
    return <div className="py-12 text-center text-xs text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {saveMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveMsg}</span>
        </div>
      )}

      {/* Gym Settings Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Gym Profile &amp; General Configuration</h3>
            <p className="text-xs text-slate-400">Manage name, contact, operating hours &amp; QR secret</p>
          </div>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gym Name</label>
              <input
                type="text"
                value={settings.gymName}
                onChange={(e) => setSettings({ ...settings, gymName: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gym Tagline</label>
              <input
                type="text"
                value={settings.tagline}
                onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Owner Email (Admin Access)
              </label>
              <input
                type="email"
                value={settings.ownerEmail}
                onChange={(e) => setSettings({ ...settings, ownerEmail: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Reception Phone</label>
              <input
                type="tel"
                value={settings.ownerPhone}
                onChange={(e) => setSettings({ ...settings, ownerPhone: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Official Gym UPI ID (For Renewals)
              </label>
              <input
                type="text"
                value={settings.upiId}
                onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Gym Address</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Operating Hours</label>
              <input
                type="text"
                value={settings.openingHours}
                onChange={(e) => setSettings({ ...settings, openingHours: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Reception Attendance QR Secret Key
              </label>
              <input
                type="text"
                value={settings.attendanceQrSecret}
                onChange={(e) => setSettings({ ...settings, attendanceQrSecret: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Red List Inactivity Threshold (Days)
              </label>
              <input
                type="number"
                value={settings.redListThresholdDays}
                onChange={(e) =>
                  setSettings({ ...settings, redListThresholdDays: parseInt(e.target.value, 10) || 10 })
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </form>
      </div>

      {/* Announcements Manager */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Broadcast Member Announcements</h3>
            <p className="text-xs text-slate-400">Post updates, challenges, holidays or equipment arrivals</p>
          </div>
        </div>

        {/* Post Form */}
        <form onSubmit={handlePostAnnouncement} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] text-slate-400 mb-1">Announcement Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Free Protein Shaker with Annual Renewals this week!"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-[10px] text-slate-400 mb-1">Tag</label>
              <select
                value={annTag}
                onChange={(e: any) => setAnnTag(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
              >
                <option value="General">General Notice</option>
                <option value="Offer">Special Offer</option>
                <option value="Event">Event / Workshop</option>
                <option value="Urgent">Urgent Alert</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Message Content</label>
            <textarea
              rows={2}
              required
              placeholder="Write message details for members..."
              value={annContent}
              onChange={(e) => setAnnContent(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={postingAnn}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Publish Announcement</span>
          </button>
        </form>

        {/* Existing Announcements */}
        <div className="space-y-2.5 pt-2">
          {announcements.map((ann) => (
            <div
              key={ann.id}
              className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex items-start justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{ann.title}</span>
                  <span className="text-[10px] bg-slate-900 px-2 py-0.5 rounded text-amber-400 border border-slate-800 font-mono">
                    {ann.tag}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">{ann.content}</p>
                <div className="text-[10px] text-slate-500 mt-1">{ann.date} &bull; By {ann.author}</div>
              </div>

              <button
                onClick={() => handleDeleteAnnouncement(ann.id)}
                className="p-2 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                title="Remove announcement"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Backup and Security */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Database Backup &amp; Disaster Recovery</h3>
            <p className="text-xs text-slate-400">Download a full JSON snapshot of all gym data or restore from file</p>
          </div>
        </div>

        {restoreStatus && (
          <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
            {restoreStatus}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Export Full Database Backup</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Exports members, attendance history, invoices, workout plans, and settings as a clean JSON snapshot.
            </p>
            <button
              onClick={handleExportBackup}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Download Backup (.JSON)</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-white">
              <Upload className="w-4 h-4 text-blue-400" />
              <span>Restore Database from Backup</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Restore state from an existing JSON backup. This replaces existing database records safely.
            </p>
            <label className="w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span>Select File to Restore</span>
              <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
