import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../api/client.ts';
import { DietPlan } from '../../types/index.ts';
import { Apple, X, Flame, Droplets, CheckCircle2, Clock } from 'lucide-react';

interface DietViewModalProps {
  onClose: () => void;
}

export const DietViewModal: React.FC<DietViewModalProps> = ({ onClose }) => {
  const [diets, setDiets] = useState<DietPlan[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDiets() {
      try {
        const data = await apiFetch('/api/diets');
        setDiets(data);
      } catch (err) {
        console.error('Failed to load diets', err);
      } finally {
        setLoading(false);
      }
    }
    loadDiets();
  }, []);

  const plan = diets[selectedIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Nutrition &amp; Diet Guidance</h3>
              <p className="text-xs text-slate-400">{plan?.title || 'Daily Meal Protocol'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/80 hover:bg-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Plan Selector if multiple */}
        {diets.length > 1 && (
          <div className="flex gap-2 my-3">
            {diets.map((d, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedIndex === idx
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400'
                }`}
              >
                {d.title.split('(')[0]}
              </button>
            ))}
          </div>
        )}

        {/* Macro Targets Banner */}
        {plan && (
          <div className="grid grid-cols-4 gap-2 my-3">
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Calories</div>
              <div className="text-base font-black text-amber-400">{plan.targetCalories}</div>
              <div className="text-[9px] text-slate-500">kcal / day</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Protein</div>
              <div className="text-base font-black text-emerald-400">{plan.proteinGrams}g</div>
              <div className="text-[9px] text-slate-500">Essential</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Carbs</div>
              <div className="text-base font-black text-blue-400">{plan.carbsGrams}g</div>
              <div className="text-[9px] text-slate-500">Energy</div>
            </div>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Fats</div>
              <div className="text-base font-black text-orange-400">{plan.fatsGrams}g</div>
              <div className="text-[9px] text-slate-500">Hormonal</div>
            </div>
          </div>
        )}

        {/* Meal Schedule & Guidelines */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading diet plan...</div>
          ) : !plan ? (
            <div className="py-12 text-center text-xs text-slate-500">No diet plan assigned.</div>
          ) : (
            <>
              {/* Guidelines */}
              <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <Droplets className="w-4 h-4" />
                  <span>Key Hydration &amp; Nutrition Rules</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc marker:text-emerald-500">
                  {plan.guidelines.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>

              {/* Meals */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                  Daily Meal Timing Schedule
                </h4>
                <div className="space-y-2.5">
                  {plan.meals.map((meal, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{meal.meal}</span>
                        <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                          <Clock className="w-3 h-3" />
                          <span>{meal.time}</span>
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.foods.map((food, fi) => (
                          <span
                            key={fi}
                            className="text-[11px] bg-slate-900 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg"
                          >
                            {food}
                          </span>
                        ))}
                      </div>
                      {meal.notes && (
                        <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-900">
                          {meal.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
