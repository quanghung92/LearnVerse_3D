"use client";

import { useState, useEffect } from "react";
import { Volume2, Play, Square, Sparkles, MessageCircle, Mic, CheckCircle2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface DialogueLine {
  speaker: string;
  avatar: string;
  text: string;
  translation: string;
}

interface EnglishSpeechPlayerProps {
  lessonTitle: string;
  customDialogues?: DialogueLine[];
}

export function extractCleanEnglish(raw: string): string {
  if (!raw) return "";

  // 1. Loại bỏ các phần dịch nghĩa tiếng Việt trong ngoặc: (Tên bạn là gì?), (Tên tôi là...)
  let text = raw.replace(/\([^)]*\)/g, " ");
  // Loại bỏ ngoặc vuông placeholder: [Tên của bạn]
  text = text.replace(/\[[^\]]*\]/g, " ");
  // Loại bỏ phần phiên âm trong dấu gạch chéo: /wʌn/, /tuː/, /θriː/
  text = text.replace(/\/([^\/]+)\//g, " ");
  // Loại bỏ số thứ tự đầu dòng: 1 - One -> One
  text = text.replace(/^\s*\d+\s*[-–—.]\s*/g, " ");
  // Bỏ ký tự markdown và icon
  text = text.replace(/[*_#`~>🔊]/g, " ").trim();

  const vietnameseRegex = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;

  // 2. Bỏ các cụm từ nối tiếng Việt thường gặp giữa các câu mẫu
  text = text.replace(/\b(hoặc|hoặc là|cách ngắn gọn hơn|trả lời|hỏi tên|hỏi tuổi|đếm đồ vật|mẹo|phát âm từ chuyên gia)\b/gi, "|");

  // 3. Tách theo dấu gạch đứng |, dấu hai chấm, dấu chấm hỏi, chấm than, hoặc xuống dòng
  const sentences = text.split(/[|\n:]+/);
  const englishParts: string[] = [];

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    // Nếu không chứa ký tự tiếng Việt có dấu
    if (!vietnameseRegex.test(trimmed)) {
      const cleaned = trimmed.replace(/^[-–—,.\s]+|[-–—,.\s]+$/g, "").trim();
      if (cleaned.length >= 2 && /[a-zA-Z]/.test(cleaned)) {
        englishParts.push(cleaned);
      }
    } else {
      // Nếu có tiếng Việt, trích xuất các cụm tiếng Anh trong ngoặc kép
      const matches = trimmed.match(/"([^"]+)"/g) || trimmed.match(/“([^”]+)”/g);
      if (matches) {
        for (const m of matches) {
          const inner = m.replace(/["“”]/g, "").trim();
          if (!vietnameseRegex.test(inner) && /[a-zA-Z]/.test(inner)) {
            englishParts.push(inner);
          }
        }
      }
    }
  }

  let result = englishParts.join(". ").replace(/\s+/g, " ").trim();
  if (!result || result.length < 2) {
    result = raw.replace(/\([^)]*\)/g, "").replace(/[*_#`~>]/g, "").trim();
  }
  return result;
}

export function hasEnglishAudioTarget(raw: string): boolean {
  if (!raw) return false;

  // Bỏ qua các mục chú thích lỗi hoặc giải thích mẹo bằng tiếng Việt thuần túy
  if (/^\s*(lưu ý|lỗi|nhầm lẫn|chú ý|phương pháp)\b/i.test(raw.trim())) {
    return false;
  }

  // 1. Có ký hiệu loa rõ ràng
  if (raw.includes("🔊")) return true;

  // 2. Có phiên âm quốc tế (phonics): /wʌn/, /tuː/, /θriː/
  if (/\/[^\/\s]{2,}\//.test(raw)) return true;

  // 3. Có dạng số đếm + từ tiếng Anh: 1 - One, 2 - Two, 3 - Three
  if (/\d+\s*[-–—.]\s*[A-Za-z]{2,}/.test(raw)) return true;

  // 4. Có câu tiếng Anh trong ngoặc kép: "How old are you?"
  const quotes = raw.match(/"([^"]+)"/g) || raw.match(/“([^”]+)”/g);
  if (quotes) {
    const VIETNAMESE_REGEX = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
    for (const q of quotes) {
      const inner = q.replace(/["“”]/g, "").trim();
      if (!VIETNAMESE_REGEX.test(inner) && /[a-zA-Z]{2,}/.test(inner)) {
        return true;
      }
    }
  }

  // 5. Có từ tiếng Anh in đậm trong danh sách: **One**, **Hello**, **Father**
  const bolds = raw.match(/\*\*([^*]+)\*\*/g);
  if (bolds) {
    const VIETNAMESE_REGEX = /[àáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵđ]/i;
    for (const b of bolds) {
      const inner = b.replace(/\*/g, "").trim();
      if (!VIETNAMESE_REGEX.test(inner) && /[a-zA-Z]{2,}/.test(inner)) {
        return true;
      }
    }
  }

  // 6. Có câu hỏi tiếng Anh với cấu trúc WH- / Do / Can / Is
  if (/\b(How|What|Where|When|Who|Why|Is|Are|Do|Does|Can)\b[^?]+\?/i.test(raw)) {
    return true;
  }

  return false;
}

export function speakEnglish(text: string, rate: number = 0.85, onEnd?: () => void) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    toast.error("Trình duyệt không hỗ trợ đọc tự động (SpeechSynthesis).");
    return;
  }

  // 1. Dừng câu trước đó và unpause/resume (Khắc phục lỗi đơ giọng đọc của Chrome trên Windows)
  window.speechSynthesis.cancel();
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  // 2. Tự động bóc tách câu tiếng Anh chuẩn, loại bỏ các chú thích tiếng Việt
  const clean = extractCleanEnglish(text);
  if (!clean) return;

  toast.info(`🔊 Đang đọc: "${clean.length > 50 ? clean.substring(0, 50) + "..." : clean}"`, {
    duration: 3000,
  });

  // 3. Khởi tạo SpeechSynthesisUtterance
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "en-US";
  utterance.rate = rate;

  // 4. Chọn giọng đọc tiếng Anh tốt nhất
  const voices = window.speechSynthesis.getVoices();
  const enVoice = voices.find(
    (v) =>
      (v.lang === "en-US" || v.lang === "en-GB") &&
      (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Jenny") || v.name.includes("Samantha") || v.name.includes("Zira"))
  ) || voices.find((v) => v.lang.startsWith("en"));

  if (enVoice) utterance.voice = enVoice;

  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }

  // Delay 60ms để trình duyệt Chrome/Edge xử lý lệnh cancel() trước đó
  setTimeout(() => {
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  }, 60);
}

export default function EnglishSpeechPlayer({ lessonTitle, customDialogues }: EnglishSpeechPlayerProps) {
  const [speed, setSpeed] = useState<number>(0.85); // 0.85x chuẩn cho trẻ em & người mới học
  const [activeSpeakingIndex, setActiveSpeakingIndex] = useState<number | null>(null);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [customInputText, setCustomInputText] = useState<string>("");

  // Tự động tạo đoạn hội thoại tương ứng theo bài học
  const dialogues: DialogueLine[] = customDialogues || (
    lessonTitle.toLowerCase().includes("number") || lessonTitle.toLowerCase().includes("số đếm")
      ? [
          { speaker: "Ben", avatar: "👦", text: "Hello Linh! How many apples do you have?", translation: "Chào Linh! Bạn có bao nhiêu quả táo?" },
          { speaker: "Linh", avatar: "👧", text: "Hi Ben! Let's count: One, two, three, four, five! I have five apples.", translation: "Chào Ben! Cùng đếm nhé: 1, 2, 3, 4, 5! Mình có 5 quả táo." },
          { speaker: "Ben", avatar: "👦", text: "Great! How old are you, Linh?", translation: "Tuyệt quá! Bạn bao nhiêu tuổi rồi Linh?" },
          { speaker: "Linh", avatar: "👧", text: "I am seven years old. And you?", translation: "Mình 7 tuổi. Còn bạn thì sao?" },
          { speaker: "Ben", avatar: "👦", text: "I am eight years old!", translation: "Mình 8 tuổi!" },
        ]
      : lessonTitle.toLowerCase().includes("family") || lessonTitle.toLowerCase().includes("gia đình")
      ? [
          { speaker: "Ben", avatar: "👦", text: "Who is this, Linh?", translation: "Ai đây vậy Linh?" },
          { speaker: "Linh", avatar: "👧", text: "This is my father. He is very kind.", translation: "Đây là bố của mình. Bố rất hiền." },
          { speaker: "Ben", avatar: "👦", text: "And who is that?", translation: "Còn kia là ai?" },
          { speaker: "Linh", avatar: "👧", text: "This is my mother, and this is my little sister.", translation: "Đây là mẹ mình, và đây là em gái nhỏ của mình." },
        ]
      : [
          { speaker: "Teacher", avatar: "👩‍🏫", text: "Good morning class! What is your name?", translation: "Chào buổi sáng cả lớp! Tên em là gì?" },
          { speaker: "Student", avatar: "👦", text: "Good morning Teacher! My name is Ben. Nice to meet you!", translation: "Chào buổi sáng cô giáo! Em tên là Ben. Rất vui được gặp cô ạ!" },
        ]
  );

  // Dừng phát khi unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handlePlaySingle = (index: number, text: string) => {
    if (isPlayingAll) {
      window.speechSynthesis.cancel();
      setIsPlayingAll(false);
    }
    setActiveSpeakingIndex(index);
    speakEnglish(text, speed, () => {
      setActiveSpeakingIndex(null);
    });
  };

  const handlePlayAll = () => {
    if (isPlayingAll) {
      window.speechSynthesis.cancel();
      setIsPlayingAll(false);
      setActiveSpeakingIndex(null);
      return;
    }

    setIsPlayingAll(true);
    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex >= dialogues.length) {
        setIsPlayingAll(false);
        setActiveSpeakingIndex(null);
        toast.success("Đã hoàn thành luyện nghe đoạn hội thoại! 🌟 (+10 XP)");
        return;
      }

      setActiveSpeakingIndex(currentIndex);
      const currentDialogue = dialogues[currentIndex];
      currentIndex++;

      speakEnglish(currentDialogue.text, speed, () => {
        // Nghỉ 600ms giữa 2 câu để nghe rõ từng nhân vật
        setTimeout(playNext, 600);
      });
    };

    playNext();
  };

  const handlePlayCustomText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim()) return;
    speakEnglish(customInputText.trim(), speed);
  };

  return (
    <div className="p-5 rounded-2xl bg-gradient-to-tr from-sky-950/40 via-indigo-950/40 to-slate-900 border border-sky-500/30 space-y-4 shadow-xl shadow-sky-950/20 animate-in fade-in">
      {/* Header Widget */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
            <Volume2 className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Luyện nghe & Phát âm chuẩn bản xứ</span>
              <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/20 text-[10px] font-bold">
                Audio AI 🎧
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Bấm loa từng câu để nghe rõ ngữ điệu, hoặc bấm phát toàn bộ hội thoại.
            </p>
          </div>
        </div>

        {/* Tốc độ đọc */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 font-medium">Tốc độ:</span>
          <div className="flex items-center bg-slate-900/90 rounded-xl p-0.5 border border-slate-800 text-[11px]">
            <button
              type="button"
              onClick={() => setSpeed(0.75)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                speed === 0.75
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tốc độ chậm cho bé dễ nghe theo từng âm"
            >
              🐢 Chậm (0.75x)
            </button>
            <button
              type="button"
              onClick={() => setSpeed(0.95)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                speed === 0.95
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
              title="Tốc độ tự nhiên của người bản ngữ"
            >
              🐰 Chuẩn (1.0x)
            </button>
          </div>
        </div>
      </div>

      {/* Danh sách các câu thoại sinh động */}
      <div className="space-y-2.5">
        {dialogues.map((item, idx) => {
          const isCurrentActive = activeSpeakingIndex === idx;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                isCurrentActive
                  ? "bg-sky-500/15 border-sky-500/60 shadow-md shadow-sky-500/10 scale-[1.01]"
                  : "bg-slate-900/60 hover:bg-slate-900/90 border-slate-800"
              }`}
            >
              <span className="text-xl select-none shrink-0 mt-0.5">{item.avatar}</span>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-300">{item.speaker}</span>
                  {isCurrentActive && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Đang đọc...
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-semibold text-white leading-relaxed">
                  &ldquo;{item.text}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 italic">
                  ({item.translation})
                </p>
              </div>

              {/* Nút nghe từng câu */}
              <button
                type="button"
                onClick={() => handlePlaySingle(idx, item.text)}
                className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 ${
                  isCurrentActive
                    ? "bg-sky-600 text-white border-sky-400 scale-105"
                    : "bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700 hover:text-white"
                }`}
                title="Nghe câu này"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Bar dưới cùng của Audio Player */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePlayAll}
          className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer shadow-lg ${
            isPlayingAll
              ? "bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 shadow-rose-600/30"
              : "bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white border border-sky-400/30 shadow-sky-600/30"
          }`}
        >
          {isPlayingAll ? (
            <>
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Dừng đọc hội thoại</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Phát toàn bộ đoạn hội thoại 🎧</span>
            </>
          )}
        </button>

        {/* Ô đọc câu tiếng Anh tùy ý của học viên */}
        <form onSubmit={handlePlayCustomText} className="w-full sm:flex-1 flex gap-2">
          <input
            type="text"
            value={customInputText}
            onChange={(e) => setCustomInputText(e.target.value)}
            placeholder="Nhập từ hoặc câu tiếng Anh bất kỳ để nghe đọc..."
            className="flex-1 bg-slate-950 text-xs text-white placeholder-slate-500 rounded-xl px-3.5 py-2 border border-slate-800 focus:outline-none focus:border-sky-500"
          />
          <button
            type="submit"
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 hover:text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0"
            title="Đọc câu bạn vừa nhập"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Đọc</span>
          </button>
        </form>
      </div>
    </div>
  );
}
