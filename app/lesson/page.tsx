"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { 
  ArrowLeft as ArrowLeftIcon, 
  HelpCircle as HelpCircleIcon, 
  Flame as FlameIcon, 
  Zap as ZapIcon, 
  Sparkles as SparklesIcon, 
  BookOpen as BookOpenIcon, 
  Layers as LayersIcon, 
  Check as CheckIcon, 
  Loader2 as Loader2Icon, 
  PanelLeftClose as PanelLeftCloseIcon, 
  PanelLeftOpen as PanelLeftOpenIcon, 
  PanelRightClose as PanelRightCloseIcon, 
  PanelRightOpen as PanelRightOpenIcon,
  FileUp as FileUpIcon,
  Wand2 as Wand2Icon,
  RefreshCw as RefreshCwIcon
} from "lucide-react";
import { useLearningStore } from "@/stores/useLearningStore";
import { 
  COURSE_LESSONS_CATALOG, 
  getCourseDetail, 
  LessonItem, 
  CourseDetail 
} from "@/lib/data/lessonCatalog";
import LessonSidebar from "@/components/lesson/LessonSidebar";
import VideoPlayerSection from "@/components/lesson/VideoPlayerSection";
import LessonRightPanel from "@/components/lesson/LessonRightPanel";
import QuizModalOrView from "@/components/lesson/QuizModalOrView";
import DocumentScannerModal from "@/components/lesson/DocumentScannerModal";

function LessonContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL Query Parameters
  const courseParam = searchParams.get("course") || "react-core";
  const initialLessonParam = searchParams.get("lesson");
  const modeParam = searchParams.get("mode");

  // Zustand Store
  const userProfile = useLearningStore((state) => state.userProfile);
  const courses = useLearningStore((state) => state.courses);
  const activeGoal = useLearningStore((state) => state.activeGoal);
  const completedLessons = useLearningStore((state) => state.completedLessons);
  const completeLesson = useLearningStore((state) => state.completeLesson);
  const customCourseDetails = useLearningStore((state) => state.customCourseDetails);
  const updateLessonContent = useLearningStore((state) => state.updateLessonContent);
  const initFromSupabase = useLearningStore((state) => state.initFromSupabase);

  // Khởi tạo Supabase khi vào trang nếu chưa có profile
  useEffect(() => {
    initFromSupabase();
  }, [initFromSupabase]);

  // Modal Upload & Scan tài liệu (NotebookLM mode)
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Trạng thái AI tạo bài học động
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);

  // Tìm khóa học tương ứng: Ưu tiên Khóa học do AI quét từ tài liệu (customCourseDetails) -> Catalog
  const matchingCourse = courses.find((c) => c.id === courseParam);
  const courseDetail: CourseDetail = useMemo(() => {
    if (customCourseDetails && customCourseDetails[courseParam]) {
      return customCourseDetails[courseParam];
    }
    return getCourseDetail(courseParam, matchingCourse?.title || activeGoal?.title);
  }, [courseParam, customCourseDetails, matchingCourse, activeGoal]);

  // Tất cả các bài học làm phẳng để dễ tìm kiếm & next bài
  const allLessons: LessonItem[] = useMemo(() => {
    return courseDetail.chapters.flatMap((ch) => ch.lessons);
  }, [courseDetail]);

  // Tìm bài học active
  const initialLesson = initialLessonParam
    ? allLessons.find((l) => l.id === initialLessonParam)
    : allLessons.find((l) => l.id === "react-1-3") || allLessons[0];

  const [activeLesson, setActiveLesson] = useState<LessonItem>(initialLesson || allLessons[0]);
  const [isCinemaMode, setIsCinemaMode] = useState<boolean>(false);
  const [showLeftSidebar, setShowLeftSidebar] = useState<boolean>(true);
  const [showRightPanel, setShowRightPanel] = useState<boolean>(true);

  // Cập nhật activeLesson khi courseDetail thay đổi (ví dụ sau khi quét tài liệu hoặc AI tạo bài)
  useEffect(() => {
    if (allLessons.length > 0) {
      const found = allLessons.find((l) => l.id === activeLesson?.id);
      if (found) {
        setActiveLesson(found);
      } else if (!activeLesson || !allLessons.some((l) => l.id === activeLesson.id)) {
        setActiveLesson(allLessons[0]);
      }
    }
  }, [allLessons]);

  // Quiz Mode (Screen 8 & Screen 9)
  const [isQuizOpen, setIsQuizOpen] = useState<boolean>(modeParam === "quiz");
  const [quizLesson, setQuizLesson] = useState<LessonItem | null>(
    initialLesson?.type === "quiz" ? initialLesson : null
  );

  // Đồng bộ URL khi đổi bài học
  useEffect(() => {
    if (activeLesson) {
      window.history.replaceState(
        null,
        "",
        `/lesson?course=${courseParam}&lesson=${activeLesson.id}`
      );
    }
  }, [activeLesson, courseParam]);

  // Tự động kích hoạt Gemini AI biên soạn bài giảng thực tế nếu bài học chưa có nội dung chuyên sâu
  useEffect(() => {
    if (!activeLesson) return;
    const isBasicPlaceholder = 
      activeLesson.contentMarkdown?.includes("Đang tải bài giảng") ||
      activeLesson.contentMarkdown?.includes("Trong bài học mở đầu này") ||
      activeLesson.contentMarkdown?.includes("Khám phá số đếm vui nhộn!") ||
      (activeLesson.quizzes?.length === 0 && (activeLesson.contentMarkdown?.length || 0) < 250);

    if (isBasicPlaceholder && !isGeneratingLesson) {
      handleGenerateAiLesson(activeLesson);
    }
  }, [activeLesson?.id]);

  // Hàm gọi AI tự động sinh bài giảng chuyên sâu cho bài học hiện tại (Không hardcode!)
  const handleGenerateAiLesson = async (targetLesson: LessonItem = activeLesson) => {
    if (isGeneratingLesson) return;
    setIsGeneratingLesson(true);
    toast.loading(`Gemini AI đang biên soạn bài học "${targetLesson.title}"...`);

    try {
      const chapter = courseDetail.chapters.find((ch) =>
        ch.lessons.some((l) => l.id === targetLesson.id)
      );

      const res = await fetch("/api/ai/generate-lesson-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseTitle: courseDetail.title,
          chapterTitle: chapter?.title || "Chương 1",
          lessonTitle: targetLesson.title,
          domainId: userProfile?.domainId || "it_dev",
          lessonType: targetLesson.type || "video",
        }),
      });

      const data = await res.json();
      toast.dismiss();

      if (data.lessonData) {
        const enriched = {
          ...targetLesson,
          summaryPoints: data.lessonData.summaryPoints || targetLesson.summaryPoints,
          contentMarkdown: data.lessonData.contentMarkdown || targetLesson.contentMarkdown,
          codeSnippet: data.lessonData.codeSnippet || targetLesson.codeSnippet,
          quizzes: data.lessonData.quizzes || targetLesson.quizzes,
          resources: data.lessonData.resources || targetLesson.resources,
        };

        setActiveLesson(enriched);
        updateLessonContent(courseParam, targetLesson.id, enriched);
        toast.success(`Đã biên soạn bài học bằng AI thành công! 🎉`);
      } else {
        toast.error("Không nhận được nội dung từ AI. Vui lòng thử lại!");
      }
    } catch (err) {
      toast.dismiss();
      console.error(err);
      toast.error("Có lỗi khi gọi AI biên soạn bài học.");
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  // Kiểm tra bài học đã hoàn thành chưa
  const isLessonCompleted =
    completedLessons.includes(activeLesson.id) || !!activeLesson.completed;

  // Toggle hoàn thành bài học
  const handleToggleComplete = async () => {
    if (!isLessonCompleted) {
      await completeLesson(courseParam, activeLesson.id, 20);
      toast.success(`Chúc mừng! Bạn đã hoàn thành "${activeLesson.title}" và nhận +20 XP 🎉`);
    } else {
      toast("Bài học này đã được ghi nhận hoàn thành trước đó.");
    }
  };

  // Chuyển sang bài tiếp theo
  const currentIndex = allLessons.findIndex((l) => l.id === activeLesson.id);
  const hasNextLesson = currentIndex < allLessons.length - 1;

  const handleNextLesson = () => {
    if (hasNextLesson) {
      const next = allLessons[currentIndex + 1];
      if (next.type === "quiz") {
        setQuizLesson(next);
        setIsQuizOpen(true);
      } else {
        setActiveLesson(next);
      }
    } else {
      toast.success("Tuyệt vời! Bạn đã hoàn thành toàn bộ khóa học này 🎓");
      router.push("/dashboard");
    }
  };

  // Mở quiz
  const handleOpenQuiz = (lessonItem: LessonItem) => {
    setQuizLesson(lessonItem);
    setIsQuizOpen(true);
  };

  // Hoàn thành quiz
  const handleFinishQuiz = async (score: number, total: number, xpEarned: number) => {
    if (quizLesson) {
      await completeLesson(courseParam, quizLesson.id, xpEarned);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Navigation Bar (Dành riêng cho Môi trường Học tập tập trung) */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-[#090d16]/95 border-b border-slate-800/80 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between gap-3">
        {/* Nút quay lại Dashboard */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Quay lại Dashboard</span>
          </Link>

          {/* Toggle Sidebars on Desktop */}
          <button
            type="button"
            onClick={() => setShowLeftSidebar((prev) => !prev)}
            className="hidden lg:flex w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={showLeftSidebar ? "Thu gọn danh sách bài học" : "Mở danh sách bài học"}
          >
            {showLeftSidebar ? <PanelLeftCloseIcon className="w-4 h-4" /> : <PanelLeftOpenIcon className="w-4 h-4" />}
          </button>
        </div>

        {/* Course & Active Lesson breadcrumb */}
        <div className="min-w-0 max-w-md text-center hidden md:block">
          <div className="text-[11px] font-semibold text-slate-400 truncate">
            {courseDetail.title}
          </div>
          <div className="text-xs font-bold text-white truncate flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            <span>{activeLesson.title}</span>
          </div>
        </div>

        {/* User Stats & Action shortcuts */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* NÚT QUAN TRỌNG: Tải tài liệu lên & AI quét tạo khóa học (NotebookLM Mode) */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/50 hover:to-indigo-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
            title="Tải lên PDF/tài liệu để AI quét tạo khóa học mới (NotebookLM Mode)"
          >
            <FileUpIcon className="w-3.5 h-3.5 text-purple-300" />
            <span className="hidden sm:inline">Quét tài liệu (NotebookLM)</span>
            <span className="sm:hidden">Quét tài liệu</span>
          </button>

          {/* NÚT AI Biên soạn bài học chuyên sâu (Sinh nội dung động, không hardcode) */}
          <button
            type="button"
            onClick={() => handleGenerateAiLesson(activeLesson)}
            disabled={isGeneratingLesson}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            title="Dùng Gemini AI biên soạn bài giảng chi tiết và bài tập thực hành cho bài này"
          >
            {isGeneratingLesson ? (
              <RefreshCwIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Wand2Icon className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="hidden md:inline">AI Biên soạn</span>
          </button>

          {/* Làm bài trắc nghiệm ngay */}
          <button
            type="button"
            onClick={() => {
              const quizItem = allLessons.find((l) => l.type === "quiz") || activeLesson;
              handleOpenQuiz(quizItem);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
          >
            <HelpCircleIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Làm Quiz</span>
          </button>

          {/* User Streak */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
            <FlameIcon className="w-3.5 h-3.5 fill-current" />
            <span>{userProfile.currentStreak || 1} ngày</span>
          </div>

          {/* XP Pill */}
          <div className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
            <ZapIcon className="w-3.5 h-3.5 fill-current" />
            <span>{userProfile.xp || 0} XP</span>
          </div>

          {/* Toggle Right Panel */}
          <button
            type="button"
            onClick={() => setShowRightPanel((prev) => !prev)}
            className="hidden lg:flex w-8 h-8 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={showRightPanel ? "Thu gọn bảng tài liệu & AI" : "Mở bảng tài liệu & AI"}
          >
            {showRightPanel ? <PanelRightCloseIcon className="w-4 h-4" /> : <PanelRightOpenIcon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. Main 3-Column Learning Workspace (Chuẩn 100% Screen 7) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column: Lesson Sidebar (Screen 7 Cột Trái) */}
        {showLeftSidebar && !isCinemaMode && (
          <LessonSidebar
            courseTitle={courseDetail.title}
            progressPercent={courseDetail.progressPercent}
            chapters={courseDetail.chapters}
            activeLessonId={activeLesson.id}
            completedLessonIds={completedLessons}
            onSelectLesson={(lesson) => {
              setActiveLesson(lesson);
              const needsGen = 
                lesson.contentMarkdown?.includes("Đang tải bài giảng") ||
                lesson.contentMarkdown?.includes("Khám phá số đếm vui nhộn!") ||
                (lesson.quizzes?.length === 0 && (lesson.contentMarkdown?.length || 0) < 250);

              if (needsGen && !isGeneratingLesson) {
                handleGenerateAiLesson(lesson);
              }
            }}
            onOpenQuiz={handleOpenQuiz}
          />
        )}

        {/* Center Column: Video Player & Tabs (Screen 7 Cột Giữa) */}
        <VideoPlayerSection
          lesson={activeLesson}
          isCompleted={isLessonCompleted}
          onToggleComplete={handleToggleComplete}
          onNextLesson={handleNextLesson}
          hasNextLesson={hasNextLesson}
          isCinemaMode={isCinemaMode}
          onToggleCinemaMode={() => setIsCinemaMode((prev) => !prev)}
          isGeneratingLesson={isGeneratingLesson}
          onOpenQuiz={() => {
            const quizItem = allLessons.find((l) => l.type === "quiz") || activeLesson;
            handleOpenQuiz(quizItem);
          }}
        />

        {/* Right Column: Outline, Resources & AI Tutor (Screen 7 Cột Phải) */}
        {showRightPanel && !isCinemaMode && (
          <LessonRightPanel
            lesson={activeLesson}
            courseTitle={courseDetail.title}
          />
        )}
      </div>

      {/* 3. Quiz & Assessment Modal / View (Chuẩn Screen 8 & Screen 9) */}
      {isQuizOpen && quizLesson && (
        <QuizModalOrView
          lesson={quizLesson}
          courseTitle={courseDetail.title}
          chapterTitle={
            courseDetail.chapters.find((ch) =>
              ch.lessons.some((l) => l.id === quizLesson.id)
            )?.title || "Chương 2: Components"
          }
          onClose={() => setIsQuizOpen(false)}
          onFinishQuiz={handleFinishQuiz}
        />
      )}

      {/* 4. NotebookLM Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccessNavigate={(newCourseId) => {
          router.push(`/lesson?course=${newCourseId}`);
        }}
      />
    </div>
  );
}

export default function LessonPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#090d16] flex flex-col items-center justify-center text-white space-y-4">
          <Loader2Icon className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className="text-xs sm:text-sm font-medium text-slate-400">
            Đang tải không gian học tập LearnVerse 3D...
          </p>
        </div>
      }
    >
      <LessonContent />
    </Suspense>
  );
}
