"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  X, 
  Upload, 
  FileText, 
  Sparkles, 
  Bot, 
  CheckCircle2, 
  Loader2, 
  FileUp, 
  BookOpen, 
  Layers, 
  AlertCircle,
  FolderArchive,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";
import { useLearningStore } from "@/stores/useLearningStore";
import { Course, DomainId } from "@/types/learning";

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessNavigate?: (courseId: string) => void;
}

export default function DocumentScannerModal({
  isOpen,
  onClose,
  onSuccessNavigate,
}: DocumentScannerModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addCustomCourse = useLearningStore((state) => state.addCustomCourse);
  const activeGoal = useLearningStore((state) => state.activeGoal);
  const userProfile = useLearningStore((state) => state.userProfile);

  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [customCourseTitle, setCustomCourseTitle] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<DomainId>(
    userProfile?.domainId || "it_dev"
  );

  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);

  const scanSteps = [
    "Đang đọc và tiền xử lý dữ liệu từ tài liệu...",
    "NotebookLM AI đang phân tích cấu trúc & nội dung cốt lõi...",
    "Đang biên soạn bài giảng chi tiết từng chương và câu hỏi trắc nghiệm...",
    "Hoàn thiện cấu trúc khóa học và lưu trữ...",
  ];

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Giới hạn 20MB
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File quá lớn. Vui lòng chọn file dưới 20MB.");
      return;
    }

    setSelectedFile(file);
    if (!customCourseTitle) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setCustomCourseTitle(nameWithoutExt);
    }
  };

  const handleStartScan = async () => {
    if (activeTab === "file" && !selectedFile) {
      toast.error("Vui lòng chọn file tài liệu cần quét!");
      return;
    }
    if (activeTab === "paste" && !pastedText.trim()) {
      toast.error("Vui lòng dán nội dung văn bản cần quét!");
      return;
    }

    setIsScanning(true);
    setScanStep(0);

    const stepInterval = setInterval(() => {
      setScanStep((prev) => (prev < scanSteps.length - 1 ? prev + 1 : prev));
    }, 2000);

    try {
      let fileBase64: string | undefined = undefined;
      let documentText: string | undefined = undefined;
      let mimeType = "text/plain";
      const fileName = selectedFile?.name || customCourseTitle || "Tài liệu học tập";

      if (activeTab === "file" && selectedFile) {
        mimeType = selectedFile.type || "text/plain";

        if (selectedFile.type === "application/pdf") {
          // Đọc PDF thành base64 để gửi trực tiếp cho Gemini
          const reader = new FileReader();
          fileBase64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => {
              const res = reader.result as string;
              const base64 = res.split(",")[1];
              resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
        } else {
          // File text / markdown
          documentText = await selectedFile.text();
        }
      } else {
        documentText = pastedText;
      }

      // Gọi API scan document
      const res = await fetch("/api/ai/scan-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentText,
          fileBase64,
          mimeType,
          fileName,
          domainId: selectedDomain,
        }),
      });

      const data = await res.json();
      clearInterval(stepInterval);

      if (data.error || !data.course) {
        throw new Error(data.error || "Không nhận được dữ liệu khóa học từ AI");
      }

      const generatedCourseDetail = data.course;
      const courseId = generatedCourseDetail.courseId || `doc-course-${Date.now()}`;
      const courseTitle = customCourseTitle.trim() || generatedCourseDetail.title || fileName;

      // Đếm số bài học
      const totalLessons = generatedCourseDetail.chapters.reduce(
        (acc: number, ch: any) => acc + (ch.lessons?.length || 0),
        0
      );

      // Tạo Course meta cho Dashboard & MyCourses
      const newCourseMeta: Course = {
        id: courseId,
        domainId: selectedDomain,
        goalId: activeGoal?.id,
        title: courseTitle,
        iconBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
        iconColor: "#6366f1",
        iconType: "ai",
        totalLessons: Math.max(1, totalLessons),
        completedLessons: 0,
        progress: 0,
        timeRemaining: `${Math.max(2, Math.round(totalLessons * 0.4))} giờ học`,
        status: "learning",
        statusText: "Đang học",
        lessonCount: `0/${Math.max(1, totalLessons)} bài`,
        currentLesson: generatedCourseDetail.chapters[0]?.lessons[0]?.title || "1.1 Bắt đầu bài học",
      };

      // Lưu vào Zustand Store & Supabase
      await addCustomCourse(generatedCourseDetail, newCourseMeta);

      toast.success(`AI NotebookLM đã quét xong tài liệu! Đang mở khóa học "${courseTitle}"... 🚀`);
      setIsScanning(false);
      onClose();

      if (onSuccessNavigate) {
        onSuccessNavigate(courseId);
      } else {
        router.push(`/lesson?course=${courseId}`);
      }
    } catch (err: any) {
      clearInterval(stepInterval);
      setIsScanning(false);
      console.error(err);
      toast.error(err?.message || "Có lỗi khi quét tài liệu. Vui lòng thử lại!");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090d16]/90 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0e1424] border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isScanning}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-2 pr-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Document Engine (NotebookLM Mode)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Quét tài liệu & Tạo khóa học cá nhân
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
            Tải lên tài liệu (PDF, giáo trình, slide, ghi chú) hoặc dán văn bản. Gemini AI sẽ đọc sâu sắc toàn bộ nội dung để chia chương, viết bài giảng chi tiết và tạo bộ câu hỏi trắc nghiệm.
          </p>
        </div>

        {/* Loading Overlay if scanning */}
        {isScanning ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-5 animate-in fade-in duration-300">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
              <Bot className="w-9 h-9 text-indigo-400 animate-pulse" />
            </div>

            <div className="space-y-2 max-w-md">
              <h3 className="text-base font-bold text-white">
                {scanSteps[scanStep]}
              </h3>
              <p className="text-xs text-slate-400">
                Gemini AI đang phân tích toàn diện để đảm bảo kiến thức được trích xuất chính xác và dễ hiểu nhất.
              </p>
            </div>

            <div className="w-48 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${((scanStep + 1) / scanSteps.length) * 100}%` }}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Input Method Tabs */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab("file")}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "file"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileUp className="w-4 h-4" />
                <span>Tải lên file (PDF, TXT, MD)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("paste")}
                className={`py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  activeTab === "paste"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Dán văn bản trực tiếp</span>
              </button>
            </div>

            {/* Tab 1: File Upload Dropzone */}
            {activeTab === "file" && (
              <div className="space-y-4">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.txt,.md,.json"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 border-2 border-dashed border-indigo-500/40 hover:border-indigo-400 bg-slate-900/60 hover:bg-slate-900 rounded-2xl text-center cursor-pointer transition-all space-y-3 group"
                >
                  <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">
                      {selectedFile ? selectedFile.name : "Nhấp để chọn file hoặc kéo thả tài liệu vào đây"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Hỗ trợ PDF (tự động nhận diện OCR), TXT, Markdown (Dưới 20MB)
                    </p>
                  </div>
                  {selectedFile && (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Đã chọn: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Paste Text Area */}
            {activeTab === "paste" && (
              <div className="space-y-2">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={7}
                  placeholder="Dán toàn bộ tài liệu học tập, giáo trình, công thức, slide hoặc ghi chú của bạn vào đây... (Tối đa 50,000 ký tự)"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none leading-relaxed resize-none"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>Mẹo: Bạn có thể dán tài liệu một chương hoặc một môn học cụ thể</span>
                  <span>{pastedText.length.toLocaleString()} ký tự</span>
                </div>
              </div>
            )}

            {/* Course Title Override */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">
                Tên khóa học bạn muốn đặt (hoặc để AI tự đặt tên hay):
              </label>
              <input
                type="text"
                value={customCourseTitle}
                onChange={(e) => setCustomCourseTitle(e.target.value)}
                placeholder="Ví dụ: Giáo trình Lập trình Hướng đối tượng Chương 1-3..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {/* Action Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>

              <button
                type="button"
                onClick={handleStartScan}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs sm:text-sm font-extrabold shadow-xl shadow-indigo-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Bắt đầu quét & Tạo bài học 🚀</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
