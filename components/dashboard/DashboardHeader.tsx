"use client";

import { Flame, Shield, Award, Bell, Settings, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useLearningStore } from "@/stores/useLearningStore";

interface DashboardHeaderProps {
  userName?: string;
  streakDays?: number;
  level?: number;
  xp?: number;
}

export default function DashboardHeader(props: DashboardHeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const storeProfile = useLearningStore((state) => state.userProfile);

  const userName = props.userName || storeProfile.displayName || "Học viên LearnVerse";
  const streakDays = props.streakDays ?? storeProfile.currentStreak ?? 0;
  const level = props.level ?? storeProfile.level ?? 1;
  const xp = props.xp ?? storeProfile.xp ?? 0;

  return (
    <header className="bg-[#090d16]/80 backdrop-blur-xl border-b border-slate-800/80 sticky top-0 z-30 px-6 lg:px-8 py-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Greeting */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-black text-white tracking-tight">
              Chào mừng trở lại, {userName}! 👋
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Hôm nay là một ngày tuyệt vời để khám phá điều mới trong vũ trụ học tập.
          </p>
        </div>

        {/* Right: Badges & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Streak Badge */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold shadow-xs hover:bg-amber-500/20 transition-colors cursor-pointer"
            title={`Chuỗi ${streakDays} ngày học liên tiếp!`}
          >
            <Flame className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{streakDays} ngày</span>
          </div>

          {/* Level Badge */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold shadow-xs hover:bg-indigo-500/20 transition-colors cursor-pointer"
            title={`Cấp độ người học: Level ${level}`}
          >
            <Shield className="w-4 h-4 text-indigo-400" />
            <span>Cấp {level}</span>
          </div>

          {/* XP Badge */}
          <div 
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold shadow-xs hover:bg-emerald-500/20 transition-colors cursor-pointer"
            title="Tổng điểm kinh nghiệm tích luỹ"
          >
            <Award className="w-4 h-4 text-emerald-400" />
            <span>{xp.toLocaleString()} XP</span>
          </div>


          {/* Notification Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 flex items-center justify-center transition-colors relative cursor-pointer border border-slate-700/60"
              title="Thông báo"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-slate-900" />
            </button>

            {/* Notification Dropdown preview */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-white">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <span className="font-bold text-sm text-slate-200">Thông báo mới</span>
                  <span className="text-[11px] text-indigo-400 font-semibold cursor-pointer hover:underline">Đã đọc tất cả</span>
                </div>
                <div className="py-3 space-y-3">
                  <div className="flex gap-3 text-xs">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-indigo-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">Chào mừng bạn đến với LearnVerse 3D!</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Khám phá lộ trình học tập và thế giới 3D ngay</p>
                    </div>
                  </div>
                  <div className="flex gap-3 text-xs">
                    <span className="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-200">Nhiệm vụ đầu tiên: Bắt đầu bài học 1.1</p>
                      <p className="text-slate-400 text-[11px] mt-0.5">Nhận ngay +25 XP khi hoàn thành</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <Link
            href="/settings"
            className="w-9 h-9 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700/60"
            title="Cài đặt tài khoản"
          >
            <Settings className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
