import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { WorkoutPlan } from '../../types/index.ts';
import { Dumbbell, X, Play, RotateCcw, Timer, Sparkles, Check, ChevronRight } from 'lucide-react';

interface WorkoutViewModalProps {
  onClose: () => void;
}

export const WorkoutViewModal: React.FC<WorkoutViewModalProps> = ({ onClose }) => {
  const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Rest Timer state
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [timerInitial, setTimerInitial] = useState(60);
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    async function loadWorkouts() {
      try {
        const data = await apiFetch('/api/workouts');
        setWorkouts(data);
      } catch (err) {
        console.error('Failed to load workouts', err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkouts();
  }, []);

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (timerActive && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else if (timerSeconds === 0) {
      setTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [timerActive, timerSeconds]);

  const startTimer = (seconds: number) => {
    setTimerInitial(seconds);
    setTimerSeconds(seconds);
    setTimerActive(true);
  };

  const resetTimer = () => {
    setTimerActive(false);
    setTimerSeconds(null);
  };

  const currentPlan = workouts[selectedPlanIndex];
  const currentDay = currentPlan?.days[activeDayIndex] || currentPlan?.days[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Assigned Workout Plan</h3>
              <p className="text-xs text-slate-400">{currentPlan?.title || 'Personalized Routine'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Floating / Embedded Rest Timer Bar */}
        <div className="my-3 p-3 bg-slate-950 border border-amber-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${timerActive ? 'bg-amber-500 text-slate-950 animate-pulse' : 'bg-slate-800 text-amber-400'}`}>
              <Timer className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rest Timer</div>
              <div className="text-sm font-mono font-bold text-white">
                {timerSeconds !== null
                  ? `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`
                  : 'Ready'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => startTimer(60)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-800"
            >
              60s
            </button>
            <button
              onClick={() => startTimer(90)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-800"
            >
              90s
            </button>
            <button
              onClick={() => startTimer(120)}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg text-xs font-mono border border-slate-800"
            >
              120s
            </button>
            {timerActive && (
              <button
                onClick={resetTimer}
                className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Days Tab Switcher */}
        {currentPlan && currentPlan.days.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
            {currentPlan.days.map((day, idx) => (
              <button
                key={idx}
                onClick={() => setActiveDayIndex(idx)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeDayIndex === idx
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {day.dayName.split(':')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Content: Exercises */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading workout plan...</div>
          ) : !currentDay ? (
            <div className="py-12 text-center text-xs text-slate-500">No workout assigned.</div>
          ) : (
            <div>
              <div className="mb-3 px-1">
                <h4 className="text-sm font-extrabold text-white">{currentDay.dayName}</h4>
                <p className="text-xs text-amber-400 font-medium">Focus: {currentDay.focus}</p>
              </div>

              <div className="space-y-2.5">
                {currentDay.exercises.map((ex, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-mono text-xs font-bold shrink-0">
                          {i + 1}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{ex.name}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-3">
                            <span>
                              Sets: <strong className="text-amber-400">{ex.sets}</strong>
                            </span>
                            <span>
                              Reps: <strong className="text-amber-400">{ex.reps}</strong>
                            </span>
                            <span>
                              Rest: <strong className="text-slate-300">{ex.rest}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => startTimer(90)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:text-amber-300 hover:border-amber-500/40 flex items-center gap-1 transition-colors shrink-0"
                      >
                        <Timer className="w-3 h-3 text-amber-400" />
                        <span>Rest</span>
                      </button>
                    </div>

                    {ex.tips && (
                      <div className="mt-2.5 pt-2 border-t border-slate-900 text-[11px] text-slate-400 italic">
                        💡 Form cue: {ex.tips}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
