"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Sparkles, 
  Bot, 
  Clock, 
  Target, 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  ChevronDown, 
  ChevronUp, 
  RotateCcw, 
  Rocket, 
  Check, 
  Zap, 
  Code2, 
  HelpCircle,
  FileCheck,
  ShieldAlert,
  Loader2,
  BookmarkCheck
} from "lucide-react";
import { toast } from "sonner";
import { useLearningStore } from "@/stores/useLearningStore";
import { DomainId } from "@/types/learning";

interface LessonItem {
  id: string;
  title: string;
  durationMinutes: number;
  type: "theory" | "practice" | "project" | string;
}

interface QuizItem {
  id: string;
  title: string;
  questionCount: number;
}

interface MilestoneItem {
  id: string;
  title: string;
  weeks: string;
  description: string;
  lessons: LessonItem[];
  quizzes: QuizItem[];
}

interface RoadmapData {
  title: string;
  targetRole: string;
  totalWeeks: number;
  totalLessons: number;
  totalQuizzes: number;
  skills: string[];
  summary: string;
  milestones: MilestoneItem[];
}

function RoadmapContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const applyAiRoadmap = useLearningStore((state) => state.applyAiRoadmap);
  const userProfile = useLearningStore((state) => state.userProfile);

  // Lấy params từ URL do Screen 5 truyền sang
  const topicParam = searchParams.get("topic") || "Lập trình Web Fullstack với React & Next.js";
  const domainParam = (searchParams.get("domain") as DomainId) || "it_dev";
  const outcomeParam = searchParams.get("outcome") || "job";
  const levelParam = searchParams.get("level") || "intermediate";
  const durationParam = searchParams.get("duration") || "3 tháng";
  const commitParam = searchParams.get("commit") || "45m";

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStep, setLoadingStep] = useState(0);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [source, setSource] = useState<string>("gemini_ai");
  const [expandedMilestones, setExpandedMilestones] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Các bước mô phỏng loading sinh động của AI Engine
  const loadingSteps = [
    "Đang phân tích hồ sơ năng lực và chủ đề mục tiêu...",
    "Tuyển chọn các chặng học trọng tâm từ chuyên gia AI...",
    "Thiết kế bài học thực hành tương tác & dự án thực chiến...",
    "Cấu trúc quiz kiểm tra và tối ưu hóa thời gian học...",
  ];

  // Gọi API sinh lộ trình
  const fetchRoadmap = async () => {
    setIsLoading(true);
    setLoadingStep(0);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
    }, 1200);

    try {
      const res = await fetch("/api/ai/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: topicParam,
          domain: domainParam,
          outcome: outcomeParam,
          level: levelParam,
          commitment: commitParam === "30m" ? "15 - 30 phút/ngày" : commitParam === "90m" ? "1 - 2 giờ/ngày" : "45 - 60 phút/ngày",
          duration: durationParam,
        }),
      });

      const data = await res.json();
      if (data.roadmap) {
        setRoadmap(data.roadmap);
        setSource(data.source || "gemini_ai");

        // Mở sẵn chặng đầu tiên
        if (data.roadmap.milestones && data.roadmap.milestones.length > 0) {
          const initialExpanded: Record<string, boolean> = {};
          initialExpanded[data.roadmap.milestones[0].id] = true;
          if (data.roadmap.milestones[1]) initialExpanded[data.roadmap.milestones[1].id] = true;
          setExpandedMilestones(initialExpanded);
        }
      }
    } catch (err) {
      console.error("Lỗi khi tải lộ trình AI:", err);
      toast.error("Không thể khởi tạo lộ trình, vui lòng thử lại!");
    } finally {
      clearInterval(stepInterval);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, [topicParam, domainParam, outcomeParam, levelParam, durationParam, commitParam]);

  // Đóng mở milestone accordion
  const toggleMilestone = (id: string) => {
    setExpandedMilestones((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Lưu lộ trình và áp dụng vào tài khoản
  const handleSaveRoadmap = async () => {
    if (!roadmap) return;
    setIsSaving(true);
    toast.loading("Đang lưu lộ trình và khởi tạo khóa học cho bạn...");

    try {
      const commitmentText = 
        commitParam === "30m" ? "15 - 30 phút / ngày" :
        commitParam === "90m" ? "1 - 2 giờ / ngày" :
        commitParam === "120m" ? "Trên 2 giờ / ngày" : "45 - 60 phút / ngày";

      await applyAiRoadmap(roadmap, domainParam, commitmentText);

      setTimeout(() => {
        setIsSaving(false);
        toast.dismiss();
        toast.success("Đã kích hoạt lộ trình học tập mới thành công! Bắt đầu ngay 🚀");
        router.push("/dashboard");
      }, 900);
    } catch (err) {
      setIsSaving(false);
      toast.dismiss();
      toast.error("Có lỗi khi lưu lộ trình, vui lòng thử lại!");
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[85vh] bg-[#090d16] text-slate-100 px-4">
        <div className="relative flex flex-col items-center max-w-md w-full text-center space-y-6">
          {/* Glowing Animated Ring */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 animate-spin">
              <div className="w-full h-full rounded-full bg-[#090d16] flex items-center justify-center">
                <Bot className="w-10 h-10 text-indigo-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -inset-2 rounded-full bg-indigo-500/20 blur-xl animate-pulse pointer-events-none" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>LearnVerse AI Engine v2</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Đang kiến tạo lộ trình cá nhân hóa
            </h2>
            <p className="text-xs sm:text-sm text-indigo-300 font-medium h-6 transition-all duration-300">
              {loadingSteps[loadingStep]}
            </p>
          </div>

          {/* Stepper progress indicator */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-700 ease-out"
              style={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] bg-[#090d16] text-slate-100 px-4 space-y-4">
        <ShieldAlert className="w-12 h-12 text-rose-400" />
        <h2 className="text-xl font-bold text-white">Không thể tải thông tin lộ trình</h2>
        <p className="text-xs text-slate-400 text-center max-w-sm">
          Đã xảy ra lỗi trong quá trình kết nối với AI Engine. Vui lòng thử lại.
        </p>
        <button
          type="button"
          onClick={fetchRoadmap}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#090d16] text-slate-100 min-h-screen">
      {/* 1. Sticky Header Bar */}
      <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-[#090d16]/85 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <Link
          href="/create-goal"
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Điều chỉnh mục tiêu</span>
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRoadmap}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Tạo lại biến thể khác</span>
          </button>

          <button
            type="button"
            onClick={handleSaveRoadmap}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-300" />
            )}
            <span>Lưu & Bắt đầu học 🚀</span>
          </button>
        </div>
      </header>

      {/* 2. Main Container */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl w-full mx-auto space-y-8">
        {/* ================= HERO OVERVIEW CARD ================= */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#111728] via-[#0d1322] to-[#090d16] border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Lộ trình AI cá nhân hóa</span>
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                Chuẩn đầu ra tuyển dụng
              </span>
              {source === "gemini_ai" && (
                <span className="px-2.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center gap-1">
                  <Bot className="w-3 h-3 text-purple-400" />
                  Sinh bởi Google Gemini
                </span>
              )}
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                {roadmap.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {roadmap.summary}
              </p>
            </div>

            {/* 4 Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Tổng thời gian</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {roadmap.totalWeeks} tuần ({durationParam})
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <Target className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Vị trí đạt được</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white line-clamp-1" title={roadmap.targetRole}>
                  {roadmap.targetRole}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                  <span>Bài học cốt lõi</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {roadmap.totalLessons} bài học
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Đánh giá năng lực</span>
                </div>
                <div className="text-base sm:text-lg font-black text-white">
                  {roadmap.totalQuizzes} bài kiểm tra
                </div>
              </div>
            </div>

            {/* Target Skills Pill Bar */}
            <div className="pt-2 border-t border-slate-800/80 space-y-2">
              <span className="text-xs font-bold text-slate-400 block">
                Kỹ năng đạt được sau lộ trình:
              </span>
              <div className="flex flex-wrap gap-2">
                {roadmap.skills.map((skill, sIdx) => (
                  <span
                    key={sIdx}
                    className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-semibold text-xs"
                  >
                    #{skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ================= 2-COLUMN MAIN BODY ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT 2 COLS: WEEK-BY-WEEK MILESTONE ACCORDIONS */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <span>Chi tiết các chặng học ({roadmap.milestones.length} Chặng)</span>
              </h2>
              <span className="text-xs text-slate-400">
                Bấm vào chặng để xem bài học
              </span>
            </div>

            {roadmap.milestones.map((m, idx) => {
              const isExpanded = !!expandedMilestones[m.id];
              const isFirst = idx === 0;

              return (
                <div
                  key={m.id || idx}
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    isExpanded
                      ? "bg-[#0e1424] border-indigo-500/40 shadow-xl"
                      : "bg-[#0a0f1d] border-slate-800/90 hover:border-slate-700"
                  }`}
                >
                  {/* Milestone Header Banner */}
                  <div
                    onClick={() => toggleMilestone(m.id)}
                    className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          isFirst
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {isFirst ? <Rocket className="w-4 h-4 text-white" /> : `0${idx + 1}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                            {m.weeks}
                          </span>
                          {isFirst && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                              Bắt đầu ngay
                            </span>
                          )}
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white mt-0.5">
                          {m.title}
                        </h3>
                        {m.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                            {m.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs text-slate-400 hidden sm:inline">
                        {m.lessons.length} bài • {m.quizzes.length} quiz
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Lessons & Quizzes List */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 space-y-4 border-t border-slate-800/70 animate-in fade-in duration-200">
                      {/* Lessons Sublist */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                          Danh sách bài học
                        </span>

                        <div className="space-y-1.5">
                          {m.lessons.map((lesson, lIdx) => (
                            <div
                              key={lesson.id || lIdx}
                              className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-5 h-5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {idx + 1}.{lIdx + 1}
                                </span>
                                <span className="font-semibold text-slate-200 line-clamp-1">
                                  {lesson.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-slate-400 text-[11px]">
                                  {lesson.durationMinutes || 30} phút
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  lesson.type === "project"
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : lesson.type === "practice"
                                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                    : "bg-slate-800 text-slate-400"
                                }`}>
                                  {lesson.type === "project" ? "Đồ án" : lesson.type === "practice" ? "Thực hành" : "Lý thuyết"}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quizzes Sublist */}
                      {m.quizzes.length > 0 && (
                        <div className="space-y-2 pt-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                            Bài kiểm tra đánh giá năng lực
                          </span>
                          {m.quizzes.map((q, qIdx) => (
                            <div
                              key={q.id || qIdx}
                              className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between gap-3 text-xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <FileCheck className="w-4 h-4 text-amber-400 shrink-0" />
                                <span className="font-bold text-amber-200">
                                  {q.title}
                                </span>
                              </div>
                              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-bold">
                                {q.questionCount || 10} câu hỏi trắc nghiệm
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* RIGHT COL: ACTION PANEL & AI MENTOR ADVICE */}
          <div className="space-y-6">
            {/* Primary Action Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#111728] to-[#0d1322] border border-indigo-500/40 shadow-xl space-y-5">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                  Sẵn sàng hành trình
                </span>
                <h3 className="text-lg font-bold text-white">
                  Kích hoạt lộ trình học tập
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Lộ trình này sẽ thay thế danh sách khóa học hiện tại trên Dashboard của bạn và bắt đầu đếm tiến độ thực tế từ 0%.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveRoadmap}
                  disabled={isSaving}
                  className="w-full inline-flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang lưu vào hồ sơ...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="w-4 h-4" />
                      <span>Lưu & Bắt đầu học ngay 🚀</span>
                    </>
                  )}
                </button>

                <Link
                  href="/create-goal"
                  className="w-full inline-flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all text-center"
                >
                  Điều chỉnh lại mục tiêu
                </Link>
              </div>
            </div>

            {/* AI Companion Advice Card */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-xs">Lời khuyên từ Mentor AI</h4>
                  <span className="text-[10px] text-slate-400">Cố vấn học tập LearnVerse</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                <p>
                  💡 <strong>Chiến lược thành công:</strong> Hãy duy trì học đều đặn <strong>{commitParam === "30m" ? "30 phút" : commitParam === "90m" ? "90 phút" : "45 phút"}</strong> mỗi ngày thay vì dồn vào cuối tuần.
                </p>
                <p>
                  🎯 Hoàn thành mỗi chặng sẽ mở khóa bài kiểm tra năng lực và cộng <strong>+150 XP</strong> trực tiếp vào hồ sơ của bạn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center min-h-screen bg-[#090d16] text-white">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <RoadmapContent />
    </Suspense>
  );
}
