"use client";

import { Clock, Flame, Award, CheckCircle2, TrendingUp, Zap, Trophy } from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";

export default function DailyProgressStats() {
  const userProfile = useLearningStore((state) => state.userProfile);
  const activeGoal = useLearningStore((state) => state.activeGoal);

  // Tính XP cần cho cấp kế tiếp (mỗi cấp 250 XP)
  const currentLevelBaseXP = (userProfile.level - 1) * 250;
  const currentXPInLevel = Math.max(0, userProfile.xp - currentLevelBaseXP);
  const xpNeededForNext = 250;
  const levelProgress = Math.min(100, Math.round((currentXPInLevel / xpNeededForNext) * 100));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Thời gian học tập hôm nay */}
      <div className="rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 transition-all duration-300 backdrop-blur-sm group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Thời gian hôm nay</span>
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">0</span>
          <span className="text-xs text-slate-400 font-medium">/ 45 phút</span>
        </div>

        {/* Mini progress bar */}
        <div className="mt-3">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full" style={{ width: "0%" }} />
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">Học bài đầu để bắt đầu đếm giờ</p>
        </div>
      </div>

      {/* 2. Chuỗi ngày Streak */}
      <div className="rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 transition-all duration-300 backdrop-blur-sm group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Chuỗi học tập</span>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
            <Flame className="w-4 h-4 fill-amber-400/40 text-amber-400 animate-pulse" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">{userProfile.currentStreak}</span>
          <span className="text-xs text-slate-400 font-medium">ngày liên tiếp</span>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Kỷ lục cao nhất</span>
            <span className="font-bold text-amber-400">{userProfile.longestStreak} ngày</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Học hôm nay để duy trì ngọn lửa 🔥</p>
        </div>
      </div>

      {/* 3. Điểm kinh nghiệm XP & Cấp độ */}
      <div className="rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 transition-all duration-300 backdrop-blur-sm group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Cấp độ & Kinh nghiệm</span>
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Award className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-2xl font-black text-white">{userProfile.xp.toLocaleString()}</span>
          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            Cấp {userProfile.level}
          </span>
        </div>

        <div className="mt-3">
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" 
              style={{ width: `${levelProgress}%` }} 
            />
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5">
            <span>Còn {xpNeededForNext - currentXPInLevel} XP để lên Cấp {userProfile.level + 1}</span>
            <span>{levelProgress}%</span>
          </div>
        </div>
      </div>

      {/* 4. Nhiệm vụ tân thủ / Nhiệm vụ ngày */}
      <div className="rounded-2xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 p-4 transition-all duration-300 backdrop-blur-sm group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400">Nhiệm vụ hôm nay</span>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="mt-2.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-black text-white">0</span>
          <span className="text-xs text-slate-400 font-medium">/ 3 hoàn thành</span>
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="truncate">Hoàn thành 1 bài học (+25 XP)</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
            <span className="truncate">Vào khám phá Thế giới 3D (+15 XP)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
