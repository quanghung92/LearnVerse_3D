"use client";

import { useState, useEffect } from "react";
import { 
  CheckCircle2, 
  FileText, 
  Download, 
  Sparkles, 
  Bot, 
  Send, 
  Loader2, 
  FileCode, 
  ChevronRight,
  ExternalLink,
  HelpCircle,
  FolderArchive
} from "lucide-react";
import { toast } from "sonner";
import { LessonItem } from "@/lib/data/lessonCatalog";

interface LessonRightPanelProps {
  lesson: LessonItem;
  courseTitle: string;
}

export default function LessonRightPanel({ lesson, courseTitle }: LessonRightPanelProps) {
  const [question, setQuestion] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: `Xin chào! Tôi là AI Tutor của bài học "${lesson.title}". Nếu có điểm nào chưa rõ về lý thuyết hay gặp bài tập khó, bạn hãy hỏi tôi nhé!`,
    },
  ]);

  // Cập nhật lời chào AI Tutor khi đổi bài học
  useEffect(() => {
    setMessages([
      {
        sender: "ai",
        text: `Xin chào! Tôi là AI Tutor của bài học "${lesson.title}". Nếu có điểm nào chưa rõ về lý thuyết hay gặp bài tập khó, bạn hãy hỏi tôi nhé!`,
      },
    ]);
  }, [lesson.id, lesson.title]);

  const handleAskTutor = async (qText?: string) => {
    const textToSend = qText || question;
    if (!textToSend.trim() || isAiLoading) return;

    const userMessage = textToSend.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setQuestion("");
    setIsAiLoading(true);

    try {
      const res = await fetch("/api/ai/lesson-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: userMessage,
          lessonTitle: lesson.title,
          lessonContent: lesson.summaryPoints.join(", "),
          courseTitle,
        }),
      });

      const data = await res.json();
      if (data.answer) {
        setMessages((prev) => [...prev, { sender: "ai", text: data.answer }]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Xin lỗi, hiện tôi đang bị quá tải kết nối. Bạn hãy thử lại sau ít giây nhé!",
        },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleDownloadResource = (resName: string) => {
    toast.success(`Đang tải tài liệu: ${resName}...`);
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 flex flex-col bg-[#0b101d] border-l border-slate-800/80 shrink-0 h-full overflow-y-auto custom-scrollbar p-4 sm:p-5 space-y-6">
      {/* 1. Nội dung bài học (Chuẩn Screen 7) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Nội dung bài học</span>
        </h3>

        <div className="bg-[#0e1424] rounded-2xl border border-slate-800 p-4 space-y-2.5">
          {lesson.summaryPoints.map((point, index) => (
            <div key={index} className="flex items-start gap-2.5 text-sm text-slate-300 leading-relaxed">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
              <span>{point}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Tài liệu đính kèm (Chuẩn Screen 7: Slide PDF & Source code ZIP) */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Download className="w-4 h-4 text-indigo-400" />
          <span>Tài liệu</span>
        </h3>

        <div className="space-y-2">
          {lesson.resources.length > 0 ? (
            lesson.resources.map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleDownloadResource(res.name)}
                className="w-full p-3 rounded-xl bg-[#0e1424] hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                    {res.type === "pdf" ? (
                      <FileText className="w-4 h-4" />
                    ) : (
                      <FolderArchive className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-200 group-hover:text-white truncate block">
                      {res.name}
                    </span>
                    {res.size && (
                      <span className="text-[10px] text-slate-500 block mt-0.5">{res.size}</span>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white shrink-0 group-hover:translate-x-0.5 transition-transform" />
              </button>
            ))
          ) : (
            <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-400 text-center">
              Không có tài liệu đính kèm cho bài này
            </div>
          )}
        </div>
      </div>

      {/* 3. AI Tutor Gia sư trực tiếp */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Gia sư AI (Gemini 2.5)</span>
          </h3>
          <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
            Online
          </span>
        </div>

        {/* Khung chat mini */}
        <div className="bg-[#0e1424] rounded-2xl border border-indigo-500/30 p-3 space-y-3 flex flex-col h-72">
          {/* Tin nhắn */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-sm">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl leading-relaxed ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white ml-4 rounded-br-xs"
                    : "bg-slate-900 border border-slate-800 text-slate-300 mr-2 rounded-bl-xs"
                }`}
              >
                {m.text}
              </div>
            ))}
            {isAiLoading && (
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-indigo-400 flex items-center gap-2 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>AI Tutor đang suy nghĩ lời giải...</span>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 custom-scrollbar text-[11px]">
            {[
              "Giải thích lại ý chính",
              "Lỗi thường gặp là gì?",
              "Cho ví dụ thực tế",
            ].map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAskTutor(qp)}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input text */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskTutor();
            }}
            className="flex gap-1.5 pt-1 border-t border-slate-800/80"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Hỏi AI về bài học này..."
              className="flex-1 bg-slate-900 text-sm text-white placeholder-slate-500 rounded-xl px-3 py-2 border border-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={isAiLoading || !question.trim()}
              className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center shrink-0 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
