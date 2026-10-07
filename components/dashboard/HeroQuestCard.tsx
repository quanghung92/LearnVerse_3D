"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { 
  Sparkles, 
  ArrowRight, 
  Flame, 
  Target, 
  Clock, 
  CheckCircle2, 
  Lock, 
  Play, 
  Compass, 
  Layers 
} from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";

// Vercel Best Practice: bundle-dynamic-imports for heavy Three.js canvas
const Interactive3DWorldPreview = dynamic(
  () => import("./Interactive3DWorldPreview"),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[260px] rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse flex items-center justify-center text-slate-500 text-xs">
        Đang khởi tạo không gian 3D...
      </div>
    )
  }
);

export default function HeroQuestCard() {
  const activeGoal = useLearningStore((state) => state.activeGoal);
  const courses = useLearningStore((state) => state.courses);
  const userProfile = useLearningStore((state) => state.userProfile);

  const activeCourse = courses.find((c) => c.status === "learning") || courses[0];
  const isStarted = activeCourse ? activeCourse.progress > 0 : false;

  return (
    <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-[#0e1424] to-[#12192e] border border-indigo-500/30 p-6 lg:p-8 shadow-2xl overflow-hidden text-white">
      {/* Ambient background glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 left-10 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column (7 cols): Quest Information & Milestone Stepper */}
        <div className="lg:col-span-7 space-y-6">
          {/* Header Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Hành trình học tập trọng tâm</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80 text-slate-300 text-xs font-medium">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{activeGoal.commitment}</span>
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
              <span>+{isStarted ? "25" : "50"} XP khi hoàn thành bài đầu</span>
            </span>
          </div>

          {/* Goal Title */}
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              {activeGoal.title}
            </h2>
            <p className="text-sm text-slate-300 font-medium mt-1.5 max-w-xl">
              Định hướng mục tiêu: <span className="text-indigo-300 font-semibold">{activeGoal.targetRole}</span>. Lộ trình tự động điều chỉnh theo năng lực thực chiến của bạn.
            </p>
          </div>

          {/* Milestone Stepper Path */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                <span>Tiến trình cột mốc: {activeGoal.currentMilestone}/{activeGoal.totalMilestones} mốc</span>
              </span>
              <span className="text-emerald-400 font-bold">{activeGoal.progressPercent}%</span>
            </div>

            {/* Stepper Dots */}
            <div 
              className="grid gap-2 pt-1"
              style={{ gridTemplateColumns: `repeat(${Math.max(1, activeGoal.milestones?.length || 6)}, minmax(0, 1fr))` }}
            >
              {(activeGoal.milestones || []).map((m, idx) => {
                const isCompleted = m.status === "completed";
                const isCurrent = m.status === "in_progress";

                return (
                  <div key={m.id} className="space-y-1.5 group/step relative">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-emerald-500 shadow-xs shadow-emerald-500/50"
                          : isCurrent
                          ? "bg-gradient-to-r from-indigo-500 to-purple-500 animate-pulse ring-2 ring-indigo-400/40"
                          : "bg-slate-800"
                      }`}
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 truncate">
                      <span className={isCurrent ? "text-indigo-300 font-bold" : isCompleted ? "text-emerald-400 font-semibold" : ""}>
                        Mốc {idx + 1}
                      </span>
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/step:block z-30 w-44 p-2 bg-slate-950/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-xl text-[11px] pointer-events-none">
                      <div className="font-bold text-white">{m.title}</div>
                      <div className="text-slate-400 text-[10px] mt-0.5">{m.weeks} • {m.lessonsCount} bài học</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sleek Integrated Quest Action Bar */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80">
            {activeCourse ? (
              <div className="flex items-center gap-2 text-xs text-slate-300 min-w-0">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-slate-400 shrink-0">Chặng 01:</span>
                <span className="font-semibold text-white truncate">{activeCourse.title}</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400">Sẵn sàng chinh phục mục tiêu</div>
            )}

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Link
                href="/roadmap"
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
              >
                Chi tiết lộ trình
              </Link>

              <Link
                href="/create-goal"
                className="px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                title="Thay đổi mục tiêu học tập"
              >
                + Đổi mục tiêu
              </Link>

              {activeCourse && (
                <Link
                  href={`/lesson?course=${activeCourse.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all hover:scale-102"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>{isStarted ? "Học tiếp" : "Bắt đầu học 🚀"}</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Interactive 3D World Island Preview */}
        <div className="lg:col-span-5">
          <Interactive3DWorldPreview />
        </div>
      </div>
    </div>
  );
}
