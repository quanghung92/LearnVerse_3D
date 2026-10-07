"use client";

import { useState, useEffect } from "react";
import { 
  X, 
  Clock, 
  Bookmark, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Award, 
  Flame, 
  Zap, 
  RotateCcw, 
  ChevronRight,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { QuizQuestion, LessonItem } from "@/lib/data/lessonCatalog";

interface QuizModalOrViewProps {
  lesson: LessonItem;
  courseTitle: string;
  chapterTitle?: string;
  onClose: () => void;
  onFinishQuiz: (score: number, total: number, xpEarned: number) => void;
}

export default function QuizModalOrView({
  lesson,
  courseTitle,
  chapterTitle = "Chương 2: Components",
  onClose,
  onFinishQuiz,
}: QuizModalOrViewProps) {
  // Questions from lesson or fallback 5 questions
  const questions: QuizQuestion[] = lesson.quizzes && lesson.quizzes.length > 0 ? lesson.quizzes : [
    {
      id: "q-default-1",
      question: "Props trong React được sử dụng để làm gì?",
      options: [
        "Quản lý state nội tại của component",
        "Truyền dữ liệu từ component cha xuống component con",
        "Xử lý các side effects như gọi API, subscription",
        "Tạo ra một component hoàn toàn mới",
      ],
      correctIndex: 1,
      explanation: "Props (Properties) là cơ chế truyền dữ liệu một chiều từ cha xuống con, tuân thủ nguyên tắc bất biến (Read-only).",
    },
    {
      id: "q-default-2",
      question: "Component con có được phép chỉnh sửa trực tiếp giá trị của Props nhận vào hay không?",
      options: [
        "Có, component con có toàn quyền thay đổi props",
        "Không, Props trong React là bất biến (Read-only)",
        "Chỉ được sửa khi dùng TypeScript",
        "Được sửa nếu là kiểu dữ liệu Object",
      ],
      correctIndex: 1,
      explanation: "Tất cả các hàm component phải hoạt động như pure functions đối với props của chúng.",
    },
    {
      id: "q-default-3",
      question: "Để truyền nội dung lồng bên trong cặp thẻ <Modal>...</Modal>, ta sử dụng prop đặc biệt nào?",
      options: ["props.content", "props.children", "props.innerHtml", "props.body"],
      correctIndex: 1,
      explanation: "React tự động gom các phần tử con giữa thẻ mở và thẻ đóng vào `props.children`.",
    },
    {
      id: "q-default-4",
      question: "Khi render một danh sách các phần tử bằng hàm `.map()`, thuộc tính bắt buộc cần có ở mỗi thẻ là gì?",
      options: ["id", "key", "index", "ref"],
      correctIndex: 1,
      explanation: "Thuộc tính `key` duy nhất giúp thuật toán Virtual DOM định danh chính xác phần tử nào đã thay đổi, thêm mới hoặc bị xóa.",
    },
    {
      id: "q-default-5",
      question: "Trong React 19, cú pháp nào sau đây được dùng để định nghĩa một functional component?",
      options: [
        "class MyComponent extends React.Component {}",
        "export default function MyComponent() { return <div>Hello</div>; }",
        "createReactComponent({})",
        "defineComponent({})",
      ],
      correctIndex: 1,
      explanation: "Functional Component được viết dưới dạng hàm JavaScript thông thường trả về JSX.",
    },
  ];

  // Quiz state: "quiz" (Screen 8) | "result" (Screen 9) | "review"
  const [viewMode, setViewMode] = useState<"quiz" | "result" | "review">("quiz");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [bookmarked, setBookmarked] = useState<Record<number, boolean>>({});

  // Countdown timer: 14 phút 25 giây (chuẩn Screen 8: ⏱️ 14:25)
  const [secondsRemaining, setSecondsRemaining] = useState(865);

  useEffect(() => {
    if (viewMode !== "quiz") return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [viewMode]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setUserAnswers((prev) => ({
      ...prev,
      [currentIndex]: optIndex,
    }));
  };

  const toggleBookmark = () => {
    setBookmarked((prev) => {
      const isMarked = !prev[currentIndex];
      toast(isMarked ? "Đã đánh dấu câu hỏi này để xem lại" : "Đã bỏ đánh dấu");
      return { ...prev, [currentIndex]: isMarked };
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleSubmitQuiz();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Tính kết quả
  const calculateScore = () => {
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    });
    return correctCount;
  };

  const handleSubmitQuiz = () => {
    const score = calculateScore();
    const xp = score >= Math.ceil(questions.length * 0.7) ? 150 : 50;
    setViewMode("result");
    onFinishQuiz(score, questions.length, xp);
  };

  const score = calculateScore();
  const percentage = Math.round((score / questions.length) * 100);
  const currentQ = questions[currentIndex];
  const progressRatio = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-[#090d16]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-in fade-in duration-300">
      {/* ================= SCREEN 8: LÀM BÀI TRẮC NGHIỆM ================= */}
      {viewMode === "quiz" && (
        <div className="flex-1 flex flex-col justify-between max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Top Bar Header (Screen 8) */}
          <header className="flex items-center justify-between pb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">{courseTitle}</h2>
                <p className="text-xs text-slate-400">{chapterTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Thoát bài kiểm tra"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </header>

          {/* Progress & Countdown Timer (Screen 8) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Câu</span>
                <span className="text-indigo-400 text-sm">
                  {currentIndex + 1}/{questions.length}
                </span>
                {bookmarked[currentIndex] && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                    Đã đánh dấu
                  </span>
                )}
              </div>

              {/* Countdown Clock (Screen 8: ⏱️ 14:25) */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono text-xs">{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            {/* Glowing Purple Progress Bar */}
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
                style={{ width: `${progressRatio}%` }}
              />
            </div>
          </div>

          {/* Main Question Card (Screen 8) */}
          <div className="p-6 sm:p-8 rounded-3xl bg-[#0e1424] border border-indigo-500/30 shadow-2xl space-y-6">
            <h3 className="text-lg sm:text-xl font-black text-white leading-relaxed">
              {currentQ.question}
            </h3>

            {/* 4 Option Cards (Screen 8) */}
            <div className="grid grid-cols-1 gap-3.5 pt-2">
              {currentQ.options.map((optText, optIdx) => {
                const optLetter = ["A", "B", "C", "D"][optIdx];
                const isSelected = userAnswers[currentIndex] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? "bg-gradient-to-r from-indigo-900/60 to-purple-900/60 border-indigo-400 text-white shadow-xl shadow-indigo-600/30 ring-1 ring-indigo-400"
                        : "bg-slate-900/80 hover:bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white"
                    }`}
                  >
                    {/* Letter Badge (A, B, C, D) */}
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                        isSelected
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/40"
                          : "bg-slate-800 text-slate-400 border border-slate-700"
                      }`}
                    >
                      {optLetter}
                    </div>

                    <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                      {optText}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer (Screen 8: [Câu trước] [Đánh dấu] [Câu tiếp theo]) */}
          <footer className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-bold transition-all disabled:opacity-30 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Câu trước</span>
            </button>

            <button
              type="button"
              onClick={toggleBookmark}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                bookmarked[currentIndex]
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">Đánh dấu</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <span>{currentIndex === questions.length - 1 ? "Nộp bài kiểm tra 🏁" : "Câu tiếp theo"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </footer>
        </div>
      )}

      {/* ================= SCREEN 9: KẾT QUẢ BÀI KIỂM TRA ================= */}
      {viewMode === "result" && (
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-[#0e1424] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
            {/* Celebration Title (Screen 9: 🎉 Hoàn thành bài kiểm tra!) */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Hoàn thành bài kiểm tra!</span>
              </div>
              <h2 className="text-2xl font-black text-white">Kết quả đánh giá</h2>
            </div>

            {/* Circular Score Visual (Screen 9: 8/10 - 80%) */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-emerald-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-white">{score}/{questions.length}</span>
                <span className="text-xs font-bold text-emerald-400">{percentage}%</span>
              </div>
            </div>

            {/* AI Evaluation Message (Screen 9) */}
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white">
                {percentage >= 80 ? "Khá tốt!" : percentage >= 50 ? "Hoàn thành khá!" : "Cần cố gắng thêm!"}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed px-4">
                {percentage >= 80
                  ? "Bạn đã nắm vững kiến thức cơ bản. Hãy ôn lại những câu sai để hiểu rõ hơn."
                  : "Bạn đã hoàn thành bài kiểm tra! Hãy xem lại giải thích chi tiết bên dưới để bổ sung kiến thức nhé."}
              </p>
            </div>

            {/* 3 Reward Badges (Screen 9: +150 XP, +1 Thành tích, +2 Streak) */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-center space-y-1">
                <Zap className="w-4 h-4 text-amber-400 mx-auto" />
                <div className="text-xs font-extrabold text-amber-300">
                  +{percentage >= 70 ? 150 : 50} XP
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center space-y-1">
                <Award className="w-4 h-4 text-purple-400 mx-auto" />
                <div className="text-xs font-extrabold text-purple-300">+1 Thành tích</div>
              </div>

              <div className="p-3 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-center space-y-1">
                <Flame className="w-4 h-4 text-orange-400 mx-auto" />
                <div className="text-xs font-extrabold text-orange-300">+2 Ngày streak</div>
              </div>
            </div>

            {/* Action Buttons (Screen 9: [Xem chi tiết] [Ôn lại câu sai] [Tiếp tục học]) */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => setViewMode("review")}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-colors cursor-pointer"
              >
                Xem chi tiết đáp án & giải thích
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/40 hover:scale-102 transition-all cursor-pointer"
              >
                Tiếp tục học 🚀
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= REVIEW MODE: XEM GIẢI THÍCH ĐÁP ÁN ================= */}
      {viewMode === "review" && (
        <div className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <header className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Chi tiết đáp án & Giải thích</h2>
            <button
              type="button"
              onClick={() => setViewMode("result")}
              className="text-xs font-bold text-indigo-400 hover:text-white cursor-pointer"
            >
              ← Quay lại bảng điểm
            </button>
          </header>

          <div className="space-y-4">
            {questions.map((q, qIdx) => {
              const userOpt = userAnswers[qIdx];
              const isCorrect = userOpt === q.correctIndex;

              return (
                <div
                  key={q.id}
                  className={`p-5 rounded-2xl border space-y-3 ${
                    isCorrect
                      ? "bg-emerald-950/20 border-emerald-500/40"
                      : "bg-red-950/20 border-red-500/40"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        Câu {qIdx + 1}: {q.question}
                      </h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Lựa chọn của bạn: <span className="font-semibold text-slate-200">{q.options[userOpt] ?? "Chưa trả lời"}</span>
                      </p>
                      {!isCorrect && (
                        <p className="text-xs text-emerald-400 mt-0.5">
                          Đáp án đúng: <span className="font-bold">{q.options[q.correctIndex]}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <span className="font-bold text-indigo-400">Giải thích: </span>
                    {q.explanation}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              Đóng và tiếp tục học 🚀
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
