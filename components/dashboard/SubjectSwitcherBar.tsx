"use client";

import Link from "next/link";
import { Plus, Check, Compass, BookOpen, Sparkles, GraduationCap } from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";

export default function SubjectSwitcherBar() {
  const goals = useLearningStore((state) => state.goals) || [];
  const activeGoalId = useLearningStore((state) => state.activeGoalId);
  const switchGoal = useLearningStore((state) => state.switchGoal);

  if (goals.length === 0) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-2 sm:p-2.5 rounded-2xl bg-[#0b101c]/90 border border-slate-800/80 backdrop-blur-md">
      {/* Left: Label & Subject Pills */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold shrink-0">
          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">Môn học:</span>
        </div>

        {goals.map((g) => {
          const isActive = g.id === activeGoalId;

          return (
            <button
              key={g.id}
              type="button"
              onClick={() => switchGoal(g.id)}
              className={`group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-400 shadow-md shadow-indigo-600/30"
                  : "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700"
              }`}
            >
              <span className="text-sm shrink-0">{g.iconEmoji || "🎯"}</span>
              <span className="truncate max-w-[140px] sm:max-w-[200px]">{g.title}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-800 text-slate-400 group-hover:text-slate-200"
                }`}
              >
                {g.progressPercent || 0}%
              </span>
            </button>
          );
        })}
      </div>

      {/* Right: + Thêm môn học mới button */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
        <Link
          href="/create-goal"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm môn học</span>
        </Link>
      </div>
    </div>
  );
}
