"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Target, ArrowRight, Sparkles, BookOpen } from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";

export default function ContinueLearningSection() {
  const courses = useLearningStore((state) => state.courses);
  const activeGoal = useLearningStore((state) => state.activeGoal);

  // Khóa học đang học hoặc khóa đầu tiên trong lộ trình
  const activeCourse = courses.find((c) => c.status === "learning") || courses[0];

  if (!activeCourse) return null;

  const isStarted = activeCourse.progress > 0;

  return (
    <section className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center gap-2 text-slate-800 font-bold text-base">
        <div className="w-5 h-5 rounded-full bg-indigo-50 border border-indigo-200/80 flex items-center justify-center text-indigo-600">
          <PlayCircle className="w-3.5 h-3.5 fill-indigo-100" />
        </div>
        <h2>{isStarted ? "Tiếp tục học" : "Bắt đầu học"}</h2>
      </div>

      {/* 2-Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Active Course */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-center">
          {/* Course Thumbnail */}
          <div className="relative w-full sm:w-28 h-24 rounded-xl overflow-hidden shrink-0 border border-slate-100 group">
            <Image
              src="/images/auth-hero.jpg"
              alt={activeCourse.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent flex items-end p-2">
              <span className="text-[10px] font-bold text-white bg-indigo-600/90 backdrop-blur-xs px-1.5 py-0.5 rounded">
                {isStarted ? activeCourse.lessonCount : "Bài 1"}
              </span>
            </div>
          </div>

          {/* Course Info */}
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">
                {activeCourse.title}
              </h3>
            </div>
            
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeCourse.lessonCount} • {activeCourse.timeRemaining}
            </p>

            {/* Progress Bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500" 
                  style={{ width: `${activeCourse.progress}%` }} 
                />
              </div>
              <span className="text-xs font-black text-indigo-600 shrink-0">{activeCourse.progress}%</span>
            </div>

            {/* Action Button */}
            <div className="mt-3.5 flex items-center justify-between">
              <Link
                href={`/lesson?course=${activeCourse.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>{isStarted ? "Tiếp tục học" : "Bắt đầu học ngay 🚀"}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <span className="text-[11px] text-slate-400 font-medium truncate max-w-[170px]" title={activeCourse.currentLesson}>
                {isStarted ? "Tiếp: " : "Bài đầu: "} {activeCourse.currentLesson}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Goal */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex-1 w-full min-w-0">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Mục tiêu hiện tại
            </span>

            <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5 truncate" title={activeGoal.title}>
              {activeGoal.title}
            </h3>

            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {activeGoal.currentMilestone}/{activeGoal.totalMilestones} milestone hoàn thành
            </p>

            {/* Goal Progress Bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${activeGoal.progressPercent}%` }} 
                />
              </div>
              <span className="text-xs font-black text-emerald-600 shrink-0">{activeGoal.progressPercent}%</span>
            </div>

            {/* Action Link */}
            <div className="mt-3.5 flex items-center justify-between">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <span>Xem lộ trình chi tiết</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/create-goal"
                className="text-[11px] text-slate-400 hover:text-slate-600 font-medium transition-colors"
              >
                Đổi mục tiêu
              </Link>
            </div>
          </div>

          {/* Right Dartboard / 3D Target Graphic */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-teal-50 to-indigo-50 border border-teal-100 flex items-center justify-center shrink-0 shadow-inner">
            <div className="relative flex items-center justify-center">
              <div className="w-14 h-14 rounded-full border-4 border-dashed border-teal-400/40 animate-spin [animation-duration:12s]" />
              <div className="absolute w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center shadow-md shadow-teal-500/30 text-white">
                <Target className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
