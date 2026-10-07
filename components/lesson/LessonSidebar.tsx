"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  PlayCircle, 
  Circle, 
  ChevronDown, 
  ChevronUp, 
  Search, 
  Lock, 
  FileCode2, 
  HelpCircle,
  Sparkles,
  BookOpen
} from "lucide-react";
import { ChapterItem, LessonItem } from "@/lib/data/lessonCatalog";

interface LessonSidebarProps {
  courseTitle: string;
  progressPercent: number;
  chapters: ChapterItem[];
  activeLessonId: string;
  completedLessonIds: string[];
  onSelectLesson: (lesson: LessonItem) => void;
  onOpenQuiz: (lesson: LessonItem) => void;
}

export default function LessonSidebar({
  courseTitle,
  progressPercent,
  chapters,
  activeLessonId,
  completedLessonIds,
  onSelectLesson,
  onOpenQuiz,
}: LessonSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  // Mặc định mở chương chứa bài học active, hoặc chương đầu tiên
  const [openChapters, setOpenChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    chapters.forEach((ch, idx) => {
      const hasActive = ch.lessons.some((l) => l.id === activeLessonId);
      initial[ch.id] = hasActive || idx === 0;
    });
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setOpenChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  // Lọc bài học theo tìm kiếm
  const filterLesson = (lesson: LessonItem) => {
    if (!searchQuery.trim()) return true;
    return lesson.title.toLowerCase().includes(searchQuery.toLowerCase());
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col bg-[#0b101d] border-r border-slate-800/80 shrink-0 h-full select-none">
      {/* 1. Header Khóa học & Tiến độ (Chuẩn Screen 7) */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 bg-[#0e1424]/60 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-sm font-bold text-white truncate" title={courseTitle}>
              {courseTitle}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-emerald-400">
                {progressPercent}% hoàn thành
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>

        {/* 2. Ô tìm kiếm bài học (Chuẩn Screen 7: "Tìm kiếm bài học...") */}
        <div className="relative mt-2">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm bài học..."
            className="w-full bg-slate-900/90 text-xs text-slate-200 placeholder-slate-500 rounded-xl pl-9 pr-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* 3. Danh sách Chương & Bài học (Accordion) */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 custom-scrollbar p-2 sm:p-3 space-y-2">
        {chapters.map((chapter) => {
          const isOpen = openChapters[chapter.id] ?? false;
          const visibleLessons = chapter.lessons.filter(filterLesson);
          if (visibleLessons.length === 0 && searchQuery.trim()) return null;

          const chapterCompleted = chapter.lessons.every((l) =>
            completedLessonIds.includes(l.id) || l.completed
          );

          return (
            <div key={chapter.id} className="pt-2 first:pt-0">
              {/* Chapter Header Button */}
              <button
                type="button"
                onClick={() => toggleChapter(chapter.id)}
                className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-900/60 text-left transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                    {chapter.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
                  <span className="text-[11px] font-medium text-slate-500">
                    {chapter.lessons.filter((l) => completedLessonIds.includes(l.id) || l.completed).length}/{chapter.lessons.length}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Lesson Items inside Chapter */}
              {isOpen && (
                <div className="mt-1 space-y-1 pl-1">
                  {visibleLessons.map((lesson) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessonIds.includes(lesson.id) || lesson.completed;
                    const isQuiz = lesson.type === "quiz";

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => {
                          if (isQuiz) {
                            onOpenQuiz(lesson);
                          } else {
                            onSelectLesson(lesson);
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                          isActive
                            ? "bg-indigo-600/20 border border-indigo-500/50 text-white shadow-md shadow-indigo-600/10"
                            : isCompleted
                            ? "hover:bg-slate-900/70 text-slate-300"
                            : "hover:bg-slate-900/50 text-slate-400"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                          {/* Trạng thái icon chuẩn Screen 7 */}
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          ) : isActive ? (
                            <div className="w-4 h-4 rounded-full border-2 border-indigo-400 flex items-center justify-center shrink-0">
                              <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                            </div>
                          ) : isQuiz ? (
                            <HelpCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                          )}

                          <div className="min-w-0">
                            <span
                              className={`text-xs block truncate ${
                                isActive
                                  ? "font-bold text-indigo-300"
                                  : isCompleted
                                  ? "font-medium text-slate-200"
                                  : "font-normal text-slate-400"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 text-[11px] text-slate-500">
                          {isQuiz ? (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                              Quiz
                            </span>
                          ) : (
                            <span>{lesson.duration}</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
