"use client";

import { useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import SubjectSwitcherBar from "@/components/dashboard/SubjectSwitcherBar";
import HeroQuestCard from "@/components/dashboard/HeroQuestCard";
import DailyProgressStats from "@/components/dashboard/DailyProgressStats";
import MyCoursesSection from "@/components/dashboard/MyCoursesSection";
import Link from "next/link";
import { 
  Bot, 
  Sparkles, 
  ArrowRight, 
  Compass, 
  Layers, 
  Zap,
  MessageSquare
} from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";

export default function DashboardPage() {
  const initFromSupabase = useLearningStore((state) => state.initFromSupabase);
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const userProfile = useLearningStore((state) => state.userProfile);

  useEffect(() => {
    initFromSupabase();
  }, [initFromSupabase]);

  return (
    <div className="flex-1 flex flex-col bg-[#090d16] text-slate-100 min-h-screen">
      {/* Top Header */}
      <DashboardHeader />

      {/* Guest Mode Cloud Sync Notice */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-amber-500/15 via-indigo-500/10 to-transparent border-b border-amber-500/20 px-6 py-2.5 flex items-center justify-between text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>
              Chế độ trải nghiệm • Tiến trình đang lưu trên trình duyệt ({userProfile.displayName}).
            </span>
          </div>
          <Link
            href="/login"
            className="font-bold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1 cursor-pointer"
          >
            Đăng nhập để đồng bộ đám mây Supabase →
          </Link>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* 0. Multi-Subject Learning Switcher Tabs */}
        <SubjectSwitcherBar />

        {/* 1. Centerpiece: Hero Learning Quest & 3D Interactive World Portal */}
        <HeroQuestCard />

        {/* 2. Gamified Daily Progress & Motivation Metrics */}
        <DailyProgressStats />

        {/* 3. Personalized Curriculum Courses Grid */}
        <MyCoursesSection />

        {/* 4. AI Companion & Quick Studio Shortcut */}
        <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-slate-900/80 border border-indigo-500/30 p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Trợ lý Gia sư AI LearnVerse</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cần giải thích khái niệm, sửa lỗi code hay gợi ý lộ trình chuyên sâu? Trợ lý AI luôn sẵn sàng 24/7.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
            <Link
              href="/dashboard/ai-studio"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-bold transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-indigo-300" />
              <span>Hỏi AI ngay</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
