"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Code2, 
  Languages, 
  Database, 
  ChevronRight, 
  BookOpen,
  BrainCircuit,
  Palette,
  Briefcase,
  TrendingUp,
  Play,
  Layers,
  ListOrdered,
  LayoutGrid,
  Target,
  Lock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Compass
} from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";
import { Course } from "@/types/learning";
import DocumentScannerModal from "@/components/lesson/DocumentScannerModal";
import { FileUp } from "lucide-react";

type ViewMode = "focus" | "timeline" | "grid";
type FilterTab = "all" | "learning" | "not_started" | "completed";

export default function MyCoursesSection() {
  const [viewMode, setViewMode] = useState<ViewMode>("focus");
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);

  const courses = useLearningStore((state) => state.courses);
  const activeGoal = useLearningStore((state) => state.activeGoal);

  // Khóa học trọng tâm hiện tại
  const currentActiveCourse = courses.find((c) => c.status === "learning") || courses[0];
  const upcomingCourses = courses.filter((c) => c.id !== currentActiveCourse?.id);

  // Lọc theo tab
  const filteredCourses = courses.filter((c) => {
    if (activeTab === "all") return true;
    if (activeTab === "learning") return c.status === "learning";
    if (activeTab === "not_started") return c.status === "not_started";
    if (activeTab === "completed") return c.status === "completed";
    return true;
  });

  // Giới hạn hiển thị ở chế độ Grid (tối đa 3 thẻ, trừ khi bấm mở rộng)
  const displayedCourses = isExpanded ? filteredCourses : filteredCourses.slice(0, 3);
  const hasMoreThanThree = filteredCourses.length > 3;

  const renderIcon = (type: Course["iconType"]) => {
    switch (type) {
      case "react":
        return (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 text-sm shrink-0">
            <svg viewBox="0 0 115.3 100" className="w-5 h-5 fill-cyan-400">
              <ellipse cx="57.65" cy="50" rx="16.5" ry="49.5" transform="rotate(30 57.65 50)" fill="none" stroke="currentColor" strokeWidth="4.5"/>
              <ellipse cx="57.65" cy="50" rx="16.5" ry="49.5" transform="rotate(90 57.65 50)" fill="none" stroke="currentColor" strokeWidth="4.5"/>
              <ellipse cx="57.65" cy="50" rx="16.5" ry="49.5" transform="rotate(150 57.65 50)" fill="none" stroke="currentColor" strokeWidth="4.5"/>
              <circle cx="57.65" cy="50" r="7.5" fill="currentColor"/>
            </svg>
          </div>
        );
      case "typescript":
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-black text-blue-400 text-sm shrink-0">
            TS
          </div>
        );
      case "english":
        return (
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center font-bold text-pink-400 shrink-0">
            <Languages className="w-4 h-4" />
          </div>
        );
      case "database":
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 shrink-0">
            <Database className="w-4 h-4" />
          </div>
        );
      case "ai":
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center font-bold text-indigo-400 shrink-0">
            <BrainCircuit className="w-4 h-4" />
          </div>
        );
      case "design":
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center font-bold text-rose-400 shrink-0">
            <Palette className="w-4 h-4" />
          </div>
        );
      case "marketing":
        return (
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center font-bold text-orange-400 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        );
      case "management":
        return (
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center font-bold text-teal-400 shrink-0">
            <Briefcase className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 shrink-0">
            <Code2 className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <section className="rounded-3xl bg-[#0b101c] border border-slate-800/90 p-5 sm:p-6 shadow-xl space-y-5">
      {/* 1. Header Row: Title & Smart View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Lộ trình & Khóa học
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
              {courses.length} chặng
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
            Mục tiêu: <span className="text-indigo-300 font-medium">{activeGoal.title}</span>
          </p>
        </div>

        {/* Quét tài liệu NotebookLM Button & View Mode Toggle */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/25 to-indigo-600/25 hover:from-purple-600/40 hover:to-indigo-600/40 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            title="Tải lên tài liệu PDF/Text để AI quét tạo khóa học (NotebookLM Mode)"
          >
            <FileUp className="w-3.5 h-3.5 text-purple-300" />
            <span>Quét tài liệu (NotebookLM)</span>
          </button>

          {/* View Mode Toggle: Gọn gàng, tránh tràn lan */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode("focus")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "focus"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            title="Chỉ hiển thị bài học hiện tại để tránh rối mắt"
          >
            <Target className="w-3.5 h-3.5" />
            <span>Đang học</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "timeline"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Xem theo chuỗi lộ trình tuần tự"
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Lộ trình</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("grid")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              viewMode === "grid"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Xem dạng thẻ"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Dạng thẻ</span>
          </button>
        </div>
      </div>
    </div>

      {/* ================= VIEW 1: FOCUS MODE (SIÊU GỌN - CHỈ TẬP TRUNG KHÓA ĐANG HỌC) ================= */}
      {viewMode === "focus" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {currentActiveCourse ? (
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-[#0e1424] border border-indigo-500/30 p-5 shadow-lg">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  {renderIcon(currentActiveCourse.iconType)}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                        Chặng trọng tâm 01
                      </span>
                      <span className="text-xs text-slate-400">
                        {currentActiveCourse.lessonCount} • {currentActiveCourse.timeRemaining}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {currentActiveCourse.title}
                    </h3>

                    <p className="text-xs text-slate-300">
                      Bài tiếp theo: <span className="text-indigo-300 font-semibold">{currentActiveCourse.currentLesson}</span>
                    </p>
                  </div>
                </div>

                {/* Primary CTA */}
                <Link
                  href={`/lesson?course=${currentActiveCourse.id}`}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 hover:scale-102 active:scale-98 transition-all shrink-0 cursor-pointer text-center"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Vào học bài này ngay</span>
                </Link>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${currentActiveCourse.progress}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-300 shrink-0">
                  {currentActiveCourse.progress}% hoàn thành
                </span>
              </div>
            </div>
          ) : null}

          {/* Upcoming Milestones Compact Preview */}
          {upcomingCourses.length > 0 && (
            <div className="pt-2 space-y-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                Các chặng tiếp theo (sẽ mở khóa tuần tự):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {upcomingCourses.slice(0, 3).map((uc, uIdx) => (
                  <div
                    key={uc.id}
                    className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-bold shrink-0">
                        0{uIdx + 2}
                      </div>
                      <span className="font-semibold text-slate-300 truncate">
                        {uc.title}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0">
                      <Lock className="w-3 h-3 text-slate-400" />
                      <span>{uc.totalLessons} bài</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= VIEW 2: TIMELINE MODE (LỘ TRÌNH TUẦN TỰ THU GỌN) ================= */}
      {viewMode === "timeline" && (
        <div className="space-y-3 animate-in fade-in duration-200">
          <div className="space-y-2">
            {courses.map((course, idx) => {
              const isCurrent = course.status === "learning" || idx === 0;
              const isDone = course.status === "completed";

              return (
                <div
                  key={course.id}
                  className={`p-3.5 sm:p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    isCurrent
                      ? "bg-indigo-950/40 border-indigo-500/40 shadow-md"
                      : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isDone
                          ? "bg-emerald-500 text-white"
                          : isCurrent
                          ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/40"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-4 h-4" /> : `0${idx + 1}`}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          {course.title}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold">
                            Đang học
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {course.lessonCount} • {course.timeRemaining}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold text-slate-300">
                      {course.progress}%
                    </span>
                    <Link
                      href={`/lesson?course=${course.id}`}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isCurrent
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isCurrent ? "Tiếp tục" : "Xem bài học"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= VIEW 3: GRID MODE (THẺ THU GỌN TỐI ĐA 3 THẺ) ================= */}
      {viewMode === "grid" && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            {[
              { id: "all", label: `Tất cả (${courses.length})` },
              { id: "learning", label: "Đang học" },
              { id: "not_started", label: "Chưa học" },
              { id: "completed", label: "Đã xong" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as FilterTab)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Compact 3-Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {displayedCourses.map((course) => (
              <Link
                key={course.id}
                href={`/lesson?course=${course.id}`}
                className="group bg-[#0e1424] hover:bg-[#12192e] border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-4 shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    {renderIcon(course.iconType)}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      course.status === "learning"
                        ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                        : "bg-slate-800 border-slate-700 text-slate-400"
                    }`}>
                      {course.status === "learning" ? "Đang học" : "Chưa học"}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm mt-3 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1">
                    <span>{course.lessonCount}</span>
                    <span>•</span>
                    <span>{course.timeRemaining}</span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">Tiến độ: {course.progress}%</span>
                  <span className="text-indigo-400 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Học ngay <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Expand / Collapse Button if > 3 courses */}
          {hasMoreThanThree && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
              >
                <span>{isExpanded ? "Thu gọn danh sách" : `Xem thêm ${filteredCourses.length - 3} chặng còn lại`}</span>
                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      )}

      {/* NotebookLM Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </section>
  );
}
