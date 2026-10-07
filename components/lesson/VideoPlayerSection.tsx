"use client";

import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Minimize2, 
  Check, 
  ArrowRight, 
  Code2, 
  BookOpen, 
  FileText, 
  MessageSquare, 
  Send, 
  Sparkles, 
  CheckCircle2,
  Copy,
  Terminal,
  HelpCircle,
  Video,
  Lightbulb,
  Calculator,
  ChevronRight,
  BrainCircuit,
  Award,
  Square
} from "lucide-react";
import { toast } from "sonner";
import { LessonItem, AudioExample } from "@/lib/data/lessonCatalog";
import EnglishSpeechPlayer, { speakEnglish, hasEnglishAudioTarget } from "./EnglishSpeechPlayer";

function extractHastText(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.value || "";
  if (Array.isArray(node.children)) {
    return node.children.map(extractHastText).join(" ");
  }
  return "";
}

/**
 * Section "Luyện phát âm chuẩn bản xứ" — render từ `lesson.audioExamples`
 * do AI sinh ra với trường `english` CHỈ chứa tiếng Anh thuần túy.
 * Nút loa đọc thẳng chuỗi này, không cần bóc tách -> phát âm chuẩn 100%,
 * không còn hiện tượng đọc lẫn tiếng Việt.
 */
function AudioExamplesSection({ examples }: { examples: AudioExample[] }) {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState(false);
  const playToken = useRef(0);

  const stopAll = () => {
    playToken.current++;
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAll(false);
    setActiveIdx(null);
  };

  const playOne = (idx: number) => {
    stopAll();
    setActiveIdx(idx);
    // english đã là tiếng Anh thuần -> đọc trực tiếp, chuẩn xác
    speakEnglish(examples[idx].english, 0.85, () => setActiveIdx(null));
  };

  const playAll = () => {
    if (isPlayingAll) {
      stopAll();
      return;
    }
    const token = ++playToken.current;
    setIsPlayingAll(true);
    let i = 0;
    const next = () => {
      if (playToken.current !== token) return; // đã bị dừng
      if (i >= examples.length) {
        setIsPlayingAll(false);
        setActiveIdx(null);
        toast.success("Hoàn thành luyện phát âm! 🌟 (+10 XP)");
        return;
      }
      const idx = i++;
      setActiveIdx(idx);
      speakEnglish(examples[idx].english, 0.85, () => setTimeout(next, 700));
    };
    next();
  };

  // Dừng đọc khi unmount
  useEffect(() => () => stopAll(), []);

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-tr from-sky-950/50 via-indigo-950/40 to-[#0e1424] border border-sky-500/30 space-y-4 shadow-xl shadow-sky-950/20">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
              Luyện phát âm chuẩn bản xứ
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-bold">
                Audio AI 🎧
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Bấm loa từng mục để nghe đọc tiếng Anh thuần túy — không lẫn tiếng Việt.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={playAll}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
            isPlayingAll
              ? "bg-rose-600 hover:bg-rose-500 text-white border-rose-400"
              : "bg-sky-600 hover:bg-sky-500 text-white border-sky-400/40 shadow-lg shadow-sky-600/30"
          }`}
        >
          {isPlayingAll ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Phát tất cả ({examples.length} mục)</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {examples.map((ex, idx) => {
          const isActive = activeIdx === idx;
          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                isActive
                  ? "bg-sky-500/15 border-sky-500/60 shadow-md shadow-sky-500/10"
                  : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800"
              }`}
            >
              <div className="flex-1 min-w-0 space-y-1">
                <div className="text-[11px] font-bold text-sky-300 uppercase tracking-wide">
                  {ex.label}
                </div>
                <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  &ldquo;{ex.english}&rdquo;
                </p>
                <p className="text-xs sm:text-sm text-slate-400 italic">({ex.vietnamese})</p>
              </div>
              <button
                type="button"
                onClick={() => playOne(idx)}
                className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isActive
                    ? "bg-sky-600 text-white border-sky-400 scale-105"
                    : "bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700 hover:text-white"
                }`}
                title="Nghe phát âm mục này 🔊"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface VideoPlayerSectionProps {
  lesson: LessonItem;
  isCompleted: boolean;
  onToggleComplete: () => void;
  onNextLesson: () => void;
  hasNextLesson: boolean;
  isCinemaMode: boolean;
  onToggleCinemaMode: () => void;
  onOpenQuiz?: () => void;
  isGeneratingLesson?: boolean;
}

export default function VideoPlayerSection({
  lesson,
  isCompleted,
  onToggleComplete,
  onNextLesson,
  hasNextLesson,
  isCinemaMode,
  onToggleCinemaMode,
  onOpenQuiz,
  isGeneratingLesson = false,
}: VideoPlayerSectionProps) {
  // Tabs: "lecture" (mặc định ưu tiên số 1) | "video" | "code" | "notes" | "discussion"
  const [activeTab, setActiveTab] = useState<"lecture" | "video" | "code" | "notes" | "discussion">("lecture");
  
  // Tự động reset về tab Bài giảng mỗi khi đổi bài học
  useEffect(() => {
    setActiveTab("lecture");
    setSelectedQuizOption(null);
    setIsQuizAnswered(false);
    setPracticeAnswer("");
    setPracticeFeedback(null);
  }, [lesson.id]);

  // Video Player state simulation
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentSeconds, setCurrentSeconds] = useState<number>(145);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Quick practice / Interactive Quiz inside lecture
  const [selectedQuizOption, setSelectedQuizOption] = useState<number | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState<boolean>(false);
  const [practiceAnswer, setPracticeAnswer] = useState<string>("");
  const [practiceFeedback, setPracticeFeedback] = useState<string | null>(null);

  // Notes state
  const [notes, setNotes] = useState<string>(
    "Ghi chú quan trọng: Luôn nhớ quy tắc 'Gộp cho đủ chục rồi cộng với số còn lại'. Ví dụ 9 + 5 = 9 + 1 + 4 = 14."
  );

  // Discussion comments
  const [comments, setComments] = useState<Array<{ id: string; user: string; avatar: string; time: string; text: string; likes: number }>>([
    {
      id: "cm1",
      user: "Minh Quân",
      avatar: "🎒",
      time: "2 giờ trước",
      text: "Phương pháp tách gộp số này giúp tính nhẩm nhanh thật, không cần đếm ngón tay nữa!",
      likes: 5,
    },
    {
      id: "cm2",
      user: "LearnVerse AI Tutor",
      avatar: "🤖",
      time: "1 giờ trước",
      text: "Chính xác Minh Quân nhé! Khi làm quen bảng cộng qua 10, chỉ cần thuộc cặp số bù 10 (9 đi với 1, 8 đi với 2, 7 đi với 3) là tính siêu tốc!",
      likes: 9,
    },
  ]);
  const [newComment, setNewComment] = useState("");

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    if (lesson.codeSnippet?.code) {
      navigator.clipboard.writeText(lesson.codeSnippet.code);
      setCopiedCode(true);
      toast.success("Đã sao chép mã nguồn vào bộ nhớ tạm!");
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setComments((prev) => [
      ...prev,
      {
        id: `cm-${Date.now()}`,
        user: "Bạn (Học viên)",
        avatar: "⭐",
        time: "Vừa xong",
        text: newComment.trim(),
        likes: 0,
      },
    ]);
    setNewComment("");
    toast.success("Đã gửi bình luận thảo luận!");
  };

  const handleCheckPractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!practiceAnswer.trim()) return;
    const ans = practiceAnswer.trim().toLowerCase();
    if (
      ans === "14" || 
      ans === "15" || 
      ans === "7" || 
      ans === "bảy" || 
      ans === "số bảy" || 
      ans.includes("đúng") || 
      ans.includes("hiểu") || 
      ans.includes("ok")
    ) {
      setPracticeFeedback("Chính xác 100%! Bạn đã nắm rất vững kiến thức bài học 🌟 (+10 XP)");
    } else {
      setPracticeFeedback(`Gợi ý: Hãy đọc lại phần bài giảng phía trên để tìm đáp án chính xác nhé!`);
    }
  };

  const videoProgressPercent = Math.min(
    100,
    (currentSeconds / (lesson.videoDurationSeconds || 630)) * 100
  );

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#090d16] overflow-y-auto custom-scrollbar">
      {/* 1. Header bài học & Mode switcher */}
      <div className="px-5 sm:px-6 py-4 border-b border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-black text-white truncate flex items-center gap-2.5">
            <span>{lesson.title}</span>
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold shrink-0">
                Đã hoàn thành
              </span>
            )}
          </h1>
        </div>

        {/* Nút Rạp chiếu / Tập trung */}
        <button
          type="button"
          onClick={onToggleCinemaMode}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shrink-0 ${
            isCinemaMode
              ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
              : "bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
          }`}
          title="Chế độ Rạp chiếu mở rộng không gian học tập"
        >
          {isCinemaMode ? (
            <>
              <Minimize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thu nhỏ</span>
            </>
          ) : (
            <>
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Rạp chiếu</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Navigation Tabs (Ưu tiên Bài giảng & Kiến thức để học viên thấy nội dung ngay) */}
      <div className="px-5 sm:px-6 border-b border-slate-800/80 bg-[#0b101d]/60 flex items-center gap-2 sm:gap-4 text-xs font-bold overflow-x-auto custom-scrollbar">
        {[
          { id: "lecture", label: "Bài giảng & Kiến thức", icon: BookOpen },
          { id: "video", label: "Video bài giảng", icon: Video },
          ...(lesson.codeSnippet ? [{ id: "code", label: "Mã nguồn", icon: Code2 }] : []),
          { id: "notes", label: "Ghi chú", icon: FileText },
          { id: "discussion", label: `Thảo luận (${comments.length})`, icon: MessageSquare },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-3.5 px-1 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-indigo-500 text-indigo-400 font-extrabold"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Content View Area */}
      <div className="p-5 sm:p-7 flex-1 space-y-6 max-w-4xl w-full">
        {/* ================= TAB 1: BÀI GIẢNG & KIẾN THỨC (HIỂN THỊ NGAY ĐẦU TIÊN) ================= */}
        {activeTab === "lecture" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* 0. AI Loading Banner (Hiển thị khi AI đang biên soạn trực tiếp) */}
            {isGeneratingLesson && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border border-purple-500/40 space-y-2.5 animate-pulse shadow-xl shadow-purple-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <Sparkles className="w-4 h-4 text-purple-400 animate-spin" />
                    <span>Gemini AI đang trực tiếp biên soạn bài giảng chi tiết...</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400 px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20">
                    Đang tạo nội dung
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Đang phân tích kiến thức trọng tâm, giải thích ví dụ minh họa và biên soạn bài tập thực hành cho <strong>&ldquo;{lesson.title}&rdquo;</strong>...
                </p>
                <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 w-3/4 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {/* Mục tiêu cốt lõi Banner */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-950/50 via-purple-950/40 to-[#0e1424] border border-indigo-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Mục tiêu & Điểm cốt lõi bài học:</span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-medium">
                {lesson.summaryPoints?.[0] || lesson.title}
              </p>

              {lesson.summaryPoints && lesson.summaryPoints.length > 1 && (
                <div className="pt-2 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-slate-300">
                  {lesson.summaryPoints.slice(1, 5).map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                      <span className="leading-snug">{pt}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Widget Luyện nghe & Đọc hội thoại bản xứ dành riêng cho môn Tiếng Anh */}
            {(lesson.title.toLowerCase().includes("tiếng anh") ||
              lesson.title.toLowerCase().includes("english") ||
              lesson.title.toLowerCase().includes("unit") ||
              lesson.title.toLowerCase().includes("hello") ||
              lesson.title.toLowerCase().includes("number")) && (
              <EnglishSpeechPlayer lessonTitle={lesson.title} />
            )}

            {/* Bài giảng Markdown đầy đủ, chuẩn đẹp */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0e1424] border border-slate-800/80 space-y-4">
              <div className="prose prose-invert prose-indigo max-w-none text-slate-200 text-sm sm:text-base leading-loose">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className="text-2xl sm:text-3xl font-black text-white mt-5 mb-3 pb-2 border-b border-slate-800" {...props} />
                    ),
                    h2: ({ node, ...props }) => (
                      <h2 className="text-xl sm:text-2xl font-bold text-indigo-300 mt-5 mb-2.5" {...props} />
                    ),
                    h3: ({ node, ...props }) => (
                      <h3 className="text-base sm:text-lg font-bold text-slate-100 mt-4 mb-2" {...props} />
                    ),
                    p: ({ node, ...props }) => (
                      <p className="text-sm sm:text-base text-slate-300 leading-loose my-2.5" {...props} />
                    ),
                    ul: ({ node, ...props }) => (
                      <ul className="list-disc list-inside space-y-1 my-2 pl-2 text-slate-300" {...props} />
                    ),
                    ol: ({ node, ...props }) => (
                      <ol className="list-decimal list-inside space-y-1 my-2 pl-2 text-slate-300" {...props} />
                    ),
                    li: ({ node, children, ...props }) => {
                      const isEnglishLesson = 
                        lesson.title.toLowerCase().includes("tiếng anh") ||
                        lesson.title.toLowerCase().includes("english") ||
                        lesson.title.toLowerCase().includes("unit") ||
                        lesson.title.toLowerCase().includes("hello") ||
                        lesson.title.toLowerCase().includes("number");

                      const rawText = extractHastText(node);
                      const shouldShowAudio = isEnglishLesson && hasEnglishAudioTarget(rawText);

                      return (
                        <li className="text-slate-300 text-sm sm:text-base leading-loose my-2 flex items-start justify-between gap-2.5 group/item" {...props}>
                          <span className="flex-1 leading-relaxed">{children}</span>
                          {shouldShowAudio && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const liEl = e.currentTarget.closest("li");
                                const text = liEl?.querySelector("span")?.textContent || liEl?.textContent || rawText;
                                speakEnglish(text);
                              }}
                              className="inline-flex items-center justify-center p-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/30 text-sky-400 hover:text-white transition-all cursor-pointer opacity-75 group-hover/item:opacity-100 hover:scale-110 shrink-0 border border-sky-500/20"
                              title="Nghe phát âm từ / câu này 🔊"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </li>
                      );
                    },
                    strong: ({ node, ...props }) => (
                      <strong className="font-extrabold text-white" {...props} />
                    ),
                    code: ({ node, ...props }) => (
                      <code className="bg-slate-900 border border-slate-800 text-indigo-300 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />
                    ),
                    blockquote: ({ node, children, ...props }) => {
                      const isEnglishLesson = 
                        lesson.title.toLowerCase().includes("tiếng anh") ||
                        lesson.title.toLowerCase().includes("english") ||
                        lesson.title.toLowerCase().includes("unit") ||
                        lesson.title.toLowerCase().includes("hello") ||
                        lesson.title.toLowerCase().includes("number");

                      const rawText = extractHastText(node);
                      const shouldShowAudio = isEnglishLesson && hasEnglishAudioTarget(rawText);

                      return (
                        <div className="relative group my-3">
                          <blockquote className="border-l-4 border-sky-500 pl-4 py-2 italic text-slate-300 bg-sky-950/20 rounded-r-xl pr-10" {...props}>
                            {children}
                          </blockquote>
                          {shouldShowAudio && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                const parent = e.currentTarget.parentElement;
                                const quoteEl = parent?.querySelector("blockquote");
                                const text = quoteEl?.textContent || rawText;
                                speakEnglish(text);
                              }}
                              className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-sky-600/30 hover:bg-sky-600 text-sky-300 hover:text-white transition-all cursor-pointer shadow-md hover:scale-110 active:scale-95 border border-sky-500/40 z-10"
                              title="Bấm để nghe đọc câu tiếng Anh này 🔊"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      );
                    },
                  }}
                >
                  {lesson.contentMarkdown}
                </ReactMarkdown>
              </div>
            </div>

            {/* Section Luyện phát âm từ dữ liệu AI sạch (audioExamples) — đọc tiếng Anh thuần, không lẫn Việt */}
            {lesson.audioExamples && lesson.audioExamples.length > 0 && (
              <AudioExamplesSection examples={lesson.audioExamples} />
            )}

            {/* Thực hành nhanh tại chỗ (Quick Interactive Practice) */}
            {lesson.quizzes && lesson.quizzes.length > 0 ? (
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Thử tài trắc nghiệm tại chỗ (Câu 1/{lesson.quizzes.length}):</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    +10 XP
                  </span>
                </div>

                <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                  {lesson.quizzes[0].question}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {lesson.quizzes[0].options.map((opt, optIdx) => {
                    const isSelected = selectedQuizOption === optIdx;
                    const isCorrect = optIdx === lesson.quizzes![0].correctIndex;
                    let btnClass = "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800";
                    if (isQuizAnswered) {
                      if (isCorrect) {
                        btnClass = "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 font-bold";
                      } else if (isSelected && !isCorrect) {
                        btnClass = "bg-rose-500/20 text-rose-300 border-rose-500/50";
                      }
                    } else if (isSelected) {
                      btnClass = "bg-indigo-600/30 text-indigo-300 border-indigo-500";
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => {
                          if (isQuizAnswered) return;
                          setSelectedQuizOption(optIdx);
                          setIsQuizAnswered(true);
                          if (isCorrect) {
                            toast.success("Chính xác 100%! +10 XP 🎉");
                          } else {
                            toast.error("Chưa chính xác! Xem lời giải bên dưới nhé.");
                          }
                        }}
                        className={`p-3 rounded-xl border text-sm text-left transition-all cursor-pointer flex items-center gap-2.5 ${btnClass}`}
                      >
                        <span className="w-5 h-5 rounded-lg bg-black/40 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span className="flex-1">{opt}</span>
                      </button>
                    );
                  })}
                </div>

                {isQuizAnswered && (
                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-sm text-slate-300 animate-in fade-in space-y-1">
                    <p className="font-bold text-indigo-400">💡 Lời giải chi tiết:</p>
                    <p className="leading-relaxed">{lesson.quizzes[0].explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-5 rounded-2xl bg-gradient-to-tr from-indigo-950/40 to-slate-900 border border-indigo-500/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  <span>Thử tài tương tác tại chỗ:</span>
                </div>
                <p className="text-sm text-slate-300">
                  {lesson.title.toLowerCase().includes("number") || lesson.title.toLowerCase().includes("tiếng anh") || lesson.title.toLowerCase().includes("unit")
                    ? "Dịch nhanh sang tiếng Việt: Từ 'Seven' trong tiếng Anh là số mấy?"
                    : lesson.title.toLowerCase().includes("toán") || lesson.title.toLowerCase().includes("cộng")
                    ? "Áp dụng quy tắc vừa học: 9 + 5 = 9 + (1 + 4) = ?"
                    : "Bạn đã nắm vững nội dung bài học này chưa? Hãy nhập 'Đã hiểu' để nhận XP nhé!"}
                </p>

                <form onSubmit={handleCheckPractice} className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={practiceAnswer}
                    onChange={(e) => setPracticeAnswer(e.target.value)}
                    placeholder="Nhập câu trả lời của bạn..."
                    className="bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm rounded-xl px-4 py-2 text-white placeholder-slate-500 focus:outline-none flex-1"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    Kiểm tra đáp án
                  </button>
                </form>

                {practiceFeedback && (
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-indigo-500/40 text-xs text-indigo-300 animate-in fade-in">
                    {practiceFeedback}
                  </div>
                )}
              </div>
            )}

            {/* Banner kêu gọi làm bài Quiz hoàn chỉnh (Screen 8) */}
            {onOpenQuiz && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                    <BrainCircuit className="w-4 h-4 text-purple-400" />
                    <span>Sẵn sàng kiểm tra kiến thức?</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Làm bài trắc nghiệm có chấm điểm tự động, nhận đến <strong className="text-amber-400">+150 XP</strong> và mở khóa huy hiệu!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenQuiz}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-purple-600/30 transition-all cursor-pointer shrink-0"
                >
                  Làm Quiz ngay 🚀
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: VIDEO MINH HỌA (KHI HỌC VIÊN MUỐN XEM VIDEO) ================= */}
        {activeTab === "video" && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-indigo-500/20 shadow-2xl flex flex-col justify-between">
              {/* Cosmic Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/80 via-slate-950/90 to-purple-950/80 pointer-events-none" />

              {/* Video Poster Visual */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
                <div className="text-center space-y-3 p-6 max-w-lg">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 relative">
                    <div className="absolute inset-0 rounded-3xl border border-indigo-400/40 animate-pulse" />
                    <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 text-indigo-400" />
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
                    {lesson.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Trình phát bài giảng mô phỏng LearnVerse 3D
                  </p>
                </div>
              </div>

              {/* Center Play/Pause Button */}
              <div className="relative z-10 flex-1 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setIsPlaying((p) => !p)}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-2xl shadow-indigo-600/50 hover:scale-110 active:scale-95 transition-all cursor-pointer border-2 border-white/20"
                >
                  {isPlaying ? (
                    <Pause className="w-8 h-8 fill-current" />
                  ) : (
                    <Play className="w-8 h-8 fill-current translate-x-0.5" />
                  )}
                </button>
              </div>

              {/* Video Control Bar Bottom */}
              <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent space-y-2">
                <div
                  className="relative w-full h-1.5 hover:h-2.5 bg-slate-800/80 rounded-full cursor-pointer transition-all overflow-hidden"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const ratio = clickX / rect.width;
                    setCurrentSeconds(Math.round(ratio * (lesson.videoDurationSeconds || 630)));
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full"
                    style={{ width: `${videoProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsPlaying((p) => !p)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsMuted((m) => !m)}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <span className="font-mono text-[11px] text-slate-400">
                      {formatTime(currentSeconds)} / {lesson.duration}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => {
                        const speeds = [1, 1.25, 1.5, 2];
                        const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
                        setSpeed(next);
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-slate-200 cursor-pointer"
                    >
                      {speed}x
                    </button>

                    <button
                      type="button"
                      onClick={onToggleCinemaMode}
                      className="hover:text-white transition-colors cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 3: CODE SNIPPET (NẾU CÓ) ================= */}
        {activeTab === "code" && lesson.codeSnippet && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono text-slate-400 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>{lesson.codeSnippet.filename}</span>
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium cursor-pointer transition-colors"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? "Đã chép" : "Sao chép code"}</span>
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-[#070b14] p-4 font-mono text-xs sm:text-sm text-slate-200 overflow-x-auto">
              <pre>
                <code>{lesson.codeSnippet.code}</code>
              </pre>
            </div>
          </div>
        )}

        {/* ================= TAB 4: GHI CHÚ CÁ NHÂN ================= */}
        {activeTab === "notes" && (
          <div className="space-y-3 max-w-2xl animate-in fade-in duration-200">
            <label className="text-xs font-bold text-slate-300 block">
              Ghi chú của bạn cho bài học này:
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              placeholder="Ghi lại các ý chính, mẹo tính nhanh hoặc công thức cần nhớ..."
              className="w-full bg-[#0e1424] text-sm text-slate-200 placeholder-slate-500 rounded-2xl p-4 border border-slate-800 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>Ghi chú tự động được lưu an toàn vào tài khoản của bạn.</span>
              <button
                type="button"
                onClick={() => toast.success("Đã lưu ghi chú thành công!")}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-colors"
              >
                Lưu ghi chú
              </button>
            </div>
          </div>
        )}

        {/* ================= TAB 5: THẢO LUẬN ================= */}
        {activeTab === "discussion" && (
          <div className="space-y-6 max-w-2xl animate-in fade-in duration-200">
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Đặt câu hỏi hoặc chia sẻ cách giải của bạn với các bạn khác..."
                className="flex-1 bg-[#0e1424] text-sm text-slate-200 placeholder-slate-500 rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Gửi</span>
              </button>
            </form>

            <div className="space-y-3">
              {comments.map((cm) => (
                <div key={cm.id} className="p-4 rounded-xl bg-[#0e1424] border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span>{cm.avatar}</span>
                      <span>{cm.user}</span>
                    </span>
                    <span className="text-[11px] text-slate-500">{cm.time}</span>
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed pl-5">{cm.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Bottom Navigation Action Bar */}
      <footer className="p-4 sm:p-5 border-t border-slate-800/80 bg-[#090d16]/95 backdrop-blur-md sticky bottom-0 z-20 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onToggleComplete}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
            isCompleted
              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/30"
              : "bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700"
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isCompleted ? "text-emerald-400" : "text-slate-400"}`} />
          <span>{isCompleted ? "Đã hoàn thành (+20 XP)" : "Đánh dấu hoàn thành"}</span>
        </button>

        {hasNextLesson ? (
          <button
            type="button"
            onClick={onNextLesson}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-indigo-600/30 hover:scale-102 active:scale-98 transition-all cursor-pointer"
          >
            <span>Bài tiếp theo</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onNextLesson}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-extrabold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <span>Hoàn thành khóa học 🏆</span>
          </button>
        )}
      </footer>
    </div>
  );
}
