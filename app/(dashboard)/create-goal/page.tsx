"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Bot, 
  Target, 
  Clock, 
  CheckCircle2, 
  Compass, 
  Lightbulb, 
  Layers, 
  BookOpen, 
  TrendingUp, 
  Briefcase, 
  GraduationCap, 
  Rocket, 
  Check, 
  RefreshCw,
  Send,
  Code2,
  BrainCircuit,
  Palette,
  Globe2,
  Users2,
  SlidersHorizontal,
  Loader2,
  Wand2,
  Award,
  FileUp
} from "lucide-react";
import { toast } from "sonner";
import { useLearningStore } from "@/stores/useLearningStore";
import { DomainId } from "@/types/learning";
import { DOMAIN_CURRICULA } from "@/lib/data/curriculumCatalog";
import DocumentScannerModal from "@/components/lesson/DocumentScannerModal";

// Danh mục Lĩnh vực phong phú của LearnVerse (Bao gồm K-12 Phổ thông và Nghề nghiệp)
const DOMAIN_OPTIONS: { id: DomainId; label: string; icon: typeof Code2; color: string }[] = [
  { id: "k12_school", label: "Môn K-12 (Toán, Tiếng Anh...)", icon: GraduationCap, color: "text-sky-400" },
  { id: "stem_kids", label: "STEM & Lập trình nhí", icon: Sparkles, color: "text-amber-400" },
  { id: "it_dev", label: "Lập trình & IT", icon: Code2, color: "text-blue-400" },
  { id: "data_ai", label: "Dữ liệu & AI", icon: BrainCircuit, color: "text-purple-400" },
  { id: "ui_ux", label: "UI/UX Design", icon: Palette, color: "text-rose-400" },
  { id: "languages", label: "Ngoại ngữ & Giao tiếp", icon: Globe2, color: "text-teal-400" },
  { id: "marketing", label: "Digital Marketing", icon: TrendingUp, color: "text-orange-400" },
  { id: "management", label: "Quản trị & Agile", icon: Users2, color: "text-indigo-400" },
];

// Gợi ý theo từng Domain (Được kích hoạt tự động theo lĩnh vực người học)
const DOMAIN_SPECIFIC_TAGS: Record<DomainId, Array<{ label: string; prompt: string; outcome: string; level: string }>> = {
  k12_school: [
    { 
      label: "Tiếng Anh Lớp 2 (SGK Global Success)", 
      prompt: "Tôi muốn học Tiếng Anh lớp 2 bám sát SGK Global Success, thành thạo từ vựng gia đình, số đếm và giao tiếp tự tin", 
      outcome: "school_high", 
      level: "beginner" 
    },
    { 
      label: "Toán Lớp 2: Phép tính có nhớ & Bảng nhân", 
      prompt: "Tôi muốn học Toán lớp 2, làm chủ phép cộng trừ có nhớ trong phạm vi 100 và bảng nhân 2, nhân 5", 
      outcome: "school_high", 
      level: "beginner" 
    },
    { 
      label: "Toán Lớp 5: Ôn thi chuyển cấp vào Lớp 6", 
      prompt: "Tôi muốn ôn luyện các dạng toán chuyển động đều, phân số, tỉ số phần trăm để thi vào trường THCS chất lượng cao", 
      outcome: "exam", 
      level: "intermediate" 
    },
    { 
      label: "Tiếng Anh Cambridge Starters / Movers", 
      prompt: "Tôi muốn luyện 4 kỹ năng Nghe - Nói - Đọc - Viết theo chuẩn Cambridge Young Learners để đạt chứng chỉ 15 khiên", 
      outcome: "exam", 
      level: "intermediate" 
    },
  ],
  stem_kids: [
    { 
      label: "Lập trình Scratch: Tự tạo Game 2D", 
      prompt: "Tôi muốn học lập trình kéo thả Scratch để tự sáng tạo game né chướng ngại vật và phim hoạt hình tương tác", 
      outcome: "project", 
      level: "beginner" 
    },
    { 
      label: "Toán tư duy Kangaroo & Đố vui logic", 
      prompt: "Tôi muốn rèn luyện tư duy phản biện và giải các câu đố toán học thông minh theo đề thi quốc tế Kangaroo", 
      outcome: "exam", 
      level: "intermediate" 
    },
    { 
      label: "Robotics & Khoa học khám phá nhí", 
      prompt: "Tôi muốn tìm hiểu các nguyên lý khoa học thực nghiệm, lắp ráp mạch điện đơn giản và robot thông minh", 
      outcome: "project", 
      level: "beginner" 
    },
  ],
  it_dev: [
    { 
      label: "Next.js 15 & React 19 Fullstack", 
      prompt: "Tôi muốn học lập trình Web Fullstack với React 19, Next.js 15 App Router, Server Actions và Supabase để sẵn sàng đi làm sau 3 tháng", 
      outcome: "job", 
      level: "intermediate" 
    },
    { 
      label: "TypeScript & Kiến trúc phần mềm", 
      prompt: "Tôi muốn nắm vững TypeScript từ cơ bản đến nâng cao, áp dụng Design Patterns và Clean Code để nâng cao tay nghề lập trình", 
      outcome: "advance", 
      level: "intermediate" 
    },
    { 
      label: "Mobile App Flutter & Dart", 
      prompt: "Tôi muốn học xây dựng ứng dụng di động đa nền tảng iOS & Android với Flutter và Firebase từ số 0 để hoàn thành đồ án tốt nghiệp", 
      outcome: "project", 
      level: "beginner" 
    },
    { 
      label: "Web 3D Interactive với Three.js", 
      prompt: "Tôi muốn học thiết kế không gian 3D tương tác trên Web bằng Three.js, React Three Fiber và WebGL để làm Portfolio ấn tượng", 
      outcome: "project", 
      level: "experienced" 
    },
  ],
  data_ai: [
    { 
      label: "Python Data Analytics & SQL", 
      prompt: "Tôi muốn học phân tích dữ liệu kinh doanh với Python, Pandas, SQL và trực quan hóa dashboard để ứng tuyển vị trí Data Analyst sau 3 tháng", 
      outcome: "job", 
      level: "beginner" 
    },
    { 
      label: "Generative AI & LLM RAG", 
      prompt: "Tôi muốn học xây dựng ứng dụng Generative AI với kiến trúc RAG, Vector Database, Prompt Engineering và tích hợp Gemini API", 
      outcome: "advance", 
      level: "intermediate" 
    },
    { 
      label: "Machine Learning Thực hành", 
      prompt: "Tôi muốn nắm vững các thuật toán học máy cơ bản đến nâng cao với Scikit-Learn để xây dựng mô hình dự báo thực tế", 
      outcome: "project", 
      level: "intermediate" 
    },
    { 
      label: "Deep Learning & Thị giác máy tính", 
      prompt: "Tôi muốn học PyTorch để huấn luyện mạng nơ-ron nhận diện hình ảnh và xử lý ngôn ngữ tự nhiên", 
      outcome: "advance", 
      level: "experienced" 
    },
  ],
  ui_ux: [
    { 
      label: "Figma Master & Design System", 
      prompt: "Tôi muốn làm chủ Figma từ Auto Layout, Component Tokens đến xây dựng Design System hoàn chỉnh cho dự án doanh nghiệp", 
      outcome: "job", 
      level: "intermediate" 
    },
    { 
      label: "Thiết kế Web & Mobile App UX", 
      prompt: "Tôi muốn học quy trình thiết kế UX chuyên nghiệp, phỏng vấn người dùng, vẽ wireframe và hoàn thiện Case Study trên Behance", 
      outcome: "project", 
      level: "beginner" 
    },
    { 
      label: "Motion UI & Micro-interactions", 
      prompt: "Tôi muốn học tạo chuyển động vi mô mượt mà cho UI, tối ưu trải nghiệm tương tác với Framer và Lottie animations", 
      outcome: "advance", 
      level: "intermediate" 
    },
    { 
      label: "Chuyển ngành sang UI/UX Designer", 
      prompt: "Tôi muốn bắt đầu từ số 0 để học tư duy thiết kế, nguyên lý thị giác và công cụ thiết kế chuẩn quốc tế", 
      outcome: "switch_career", 
      level: "beginner" 
    },
  ],
  languages: [
    { 
      label: "Tiếng Anh chuyên ngành IT", 
      prompt: "Tôi muốn học từ vựng công nghệ, thuật ngữ kỹ thuật và kỹ năng giao tiếp trong Daily Standup để làm việc trong dự án Outsourcing quốc tế", 
      outcome: "job", 
      level: "intermediate" 
    },
    { 
      label: "Luyện phỏng vấn Tech bằng Tiếng Anh", 
      prompt: "Tôi muốn rèn luyện kỹ năng trả lời phỏng vấn ứng xử (Behavioral) và phỏng vấn kỹ thuật bằng Tiếng Anh để deal lương cao hơn", 
      outcome: "job", 
      level: "intermediate" 
    },
    { 
      label: "Tiếng Anh Email & Thuyết trình Tech", 
      prompt: "Tôi muốn viết tài liệu kỹ thuật, gửi email khách hàng chuyên nghiệp và tự tin thuyết trình Demo sản phẩm", 
      outcome: "advance", 
      level: "intermediate" 
    },
    { 
      label: "Luyện thi IELTS 6.5 - 7.0 Cấp tốc", 
      prompt: "Tôi muốn củng cố ngữ pháp, từ vựng học thuật và chiến lược làm bài 4 kỹ năng IELTS trong 3 tháng", 
      outcome: "advance", 
      level: "beginner" 
    },
  ],
  marketing: [
    { 
      label: "Performance Ads & Tối ưu ROAS", 
      prompt: "Tôi muốn làm chủ quảng cáo Meta Ads, Google Ads, đo lường Google Analytics 4 và tối ưu chi phí chuyển đổi cho thương mại điện tử", 
      outcome: "job", 
      level: "intermediate" 
    },
    { 
      label: "SEO Tổng thể & Content AI", 
      prompt: "Tôi muốn học chiến lược nghiên cứu từ khóa, tối ưu Onpage/Offpage và kết hợp công cụ AI để viết Content chuẩn SEO bền vững", 
      outcome: "project", 
      level: "beginner" 
    },
    { 
      label: "Growth Hacking & Funnel Marketing", 
      prompt: "Tôi muốn học xây dựng phễu bán hàng tự động, Email Marketing Automation và phương pháp tăng trưởng người dùng bứt phá", 
      outcome: "advance", 
      level: "experienced" 
    },
    { 
      label: "Chuyển ngành sang Digital Marketer", 
      prompt: "Tôi muốn học tổng quan từ căn bản về các kênh truyền thông số, xây dựng kế hoạch Marketing đa kênh từ số 0", 
      outcome: "switch_career", 
      level: "beginner" 
    },
  ],
  management: [
    { 
      label: "Agile & Scrum Master Chuyên nghiệp", 
      prompt: "Tôi muốn nắm vững các nghi thức Scrum, vận hành bảng Jira mượt mà và chuẩn bị kiến thức thi chứng chỉ PSM I", 
      outcome: "job", 
      level: "intermediate" 
    },
    { 
      label: "Product Management (Quản lý sản phẩm)", 
      prompt: "Tôi muốn học cách xác định tầm nhìn sản phẩm, xây dựng Product Roadmap, viết User Story và đo lường Product-Market Fit", 
      outcome: "advance", 
      level: "experienced" 
    },
    { 
      label: "Quản lý tiến độ dự án kỹ thuật", 
      prompt: "Tôi muốn nắm vững kỹ thuật ước lượng thời gian, quản lý rủi ro dự án và điều phối nhóm kỹ thuật hiệu quả", 
      outcome: "project", 
      level: "beginner" 
    },
    { 
      label: "Kỹ năng Lãnh đạo & Giao tiếp nhóm", 
      prompt: "Tôi muốn rèn luyện kỹ năng truyền cảm hứng, giải quyết xung đột và thúc đẩy tinh thần làm việc của đội ngũ kỹ sư", 
      outcome: "advance", 
      level: "intermediate" 
    },
  ],
};

// Danh sách Mục tiêu đầu ra (Bao gồm cả Học đường K-12 và Nghề nghiệp)
const TARGET_OUTCOMES = [
  {
    id: "school_high",
    title: "Bám sát SGK & Đạt điểm cao (Điểm 9 - 10)",
    desc: "Nắm vững toàn bộ kiến thức theo chương trình sách giáo khoa, tự tin đạt điểm xuất sắc trong các bài kiểm tra",
    icon: GraduationCap,
    color: "from-sky-500/20 to-blue-500/20 border-sky-500/40 text-sky-400",
  },
  {
    id: "exam",
    title: "Luyện thi Học sinh giỏi & Chứng chỉ",
    desc: "Chinh phục kỳ thi học sinh giỏi, chứng chỉ quốc tế (Cambridge, IELTS, Kangaroo, VioEdu...)",
    icon: Award,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400",
  },
  {
    id: "job",
    title: "Đi làm ngay (Tuyển dụng)",
    desc: "Tập trung 100% vào kỹ năng thực chiến nhà tuyển dụng yêu cầu cho vị trí Fresher / Junior",
    icon: Briefcase,
    color: "from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400",
  },
  {
    id: "project",
    title: "Làm đồ án & Xây dựng Dự án",
    desc: "Hoàn thiện sản phẩm thực tế, có source code hoàn chỉnh để đăng GitHub và làm đồ án tốt nghiệp",
    icon: Rocket,
    color: "from-purple-500/20 to-pink-500/20 border-purple-500/40 text-purple-400",
  },
  {
    id: "switch_career",
    title: "Chuyển ngành (Non-tech sang Tech)",
    desc: "Đi từ căn bản, giải thích trực quan, xây dựng nền tảng vững chắc không sợ hổng kiến thức",
    icon: RefreshCw,
    color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-400",
  },
  {
    id: "advance",
    title: "Nâng cao chuyên môn & Thăng tiến",
    desc: "Đào sâu kiến trúc, tối ưu hiệu năng, Best Practices và chuẩn hóa kỹ năng lên Mid/Senior level",
    icon: GraduationCap,
    color: "from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-400",
  },
];

// Trình độ ban đầu
const CURRENT_LEVELS = [
  { id: "beginner", label: "Người mới bắt đầu", desc: "Chưa từng tiếp xúc hoặc chỉ mới nghe qua khái niệm" },
  { id: "intermediate", label: "Đã có kiến thức cơ bản", desc: "Đã học qua lý thuyết, đã thử viết mã hoặc làm bài tập đơn giản" },
  { id: "experienced", label: "Đã có kinh nghiệm", desc: "Muốn học thêm công nghệ mới hoặc nâng cấp chuyên sâu" },
];

// Thời gian cam kết
const COMMITMENTS = [
  { id: "30m", label: "15 - 30 phút / ngày", desc: "Bền bỉ mỗi ngày, thích hợp cho người đi làm bận rộn" },
  { id: "45m", label: "45 - 60 phút / ngày", desc: "Tiêu chuẩn vàng: Tiến độ nhanh và ghi nhớ sâu kiến thức", recommended: true },
  { id: "90m", label: "1 - 2 giờ / ngày", desc: "Tăng tốc nhanh, nhanh chóng chinh phục mục tiêu lớn" },
  { id: "120m", label: "Trên 2 giờ / ngày", desc: "Toàn thời gian, tập trung cao độ bứt phá năng lực" },
];

export default function CreateGoalPage() {
  const router = useRouter();
  
  // Lấy dữ liệu thực tế từ Zustand Store
  const onboarding = useLearningStore((state) => state.onboarding);
  const userProfile = useLearningStore((state) => state.userProfile);
  const activeGoal = useLearningStore((state) => state.activeGoal);
  const setDomain = useLearningStore((state) => state.setDomain);
  const updateGoal = useLearningStore((state) => state.updateGoal);
  const applyAiRoadmap = useLearningStore((state) => state.applyAiRoadmap);

  // Xác định domain thực tế của user từ Onboarding / Profile
  const initialDomain: DomainId = onboarding?.domainId || userProfile?.domainId || "it_dev";

  // Step state: 1 to 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states - Đồng bộ tự động theo kết quả khảo sát
  const [selectedDomain, setSelectedDomain] = useState<DomainId>(initialDomain);
  const [promptText, setPromptText] = useState<string>("");
  const [selectedOutcome, setSelectedOutcome] = useState<string>("job");
  const [selectedLevel, setSelectedLevel] = useState<string>("intermediate");
  const [selectedCommitment, setSelectedCommitment] = useState<string>("45m");
  const [targetDuration, setTargetDuration] = useState<string>("3 tháng");
  
  // Trạng thái AI Live Suggestions
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<Array<{ label: string; prompt: string; outcome?: string; level?: string }>>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Tự động khởi tạo form khớp 100% với dữ liệu khảo sát của người dùng
  useEffect(() => {
    if (hasInitialized) return;

    const userDomain = onboarding?.domainId || userProfile?.domainId || "it_dev";
    setSelectedDomain(userDomain);

    // 1. Ánh xạ Level từ khảo sát
    if (onboarding?.proficiencyLevel) {
      if (onboarding.proficiencyLevel === "Mới bắt đầu") setSelectedLevel("beginner");
      else if (onboarding.proficiencyLevel === "Cơ bản") setSelectedLevel("intermediate");
      else setSelectedLevel("experienced");
    }

    // 2. Ánh xạ Cam kết thời gian từ khảo sát
    if (onboarding?.targetDailyMinutes) {
      if (onboarding.targetDailyMinutes <= 30) setSelectedCommitment("30m");
      else if (onboarding.targetDailyMinutes <= 60) setSelectedCommitment("45m");
      else if (onboarding.targetDailyMinutes <= 90) setSelectedCommitment("90m");
      else setSelectedCommitment("120m");
    }

    // 3. Tạo prompt khởi đầu thông minh dựa trên Domain và Chủ đề con đã chọn
    const subTopics = onboarding?.selectedSubTopics || [];
    let initialPrompt = "";

    if (subTopics.length > 0) {
      initialPrompt = `Tôi muốn học chuyên sâu về ${subTopics.join(", ")}, xây dựng dự án thực tế để sẵn sàng ứng tuyển đi làm sau 3 tháng`;
    } else {
      const defaultSuggestions = DOMAIN_SPECIFIC_TAGS[userDomain] || DOMAIN_SPECIFIC_TAGS.it_dev;
      initialPrompt = defaultSuggestions[0]?.prompt || "";
    }

    setPromptText(initialPrompt);
    setHasInitialized(true);
  }, [onboarding, userProfile, hasInitialized]);

  // Gọi Gemini AI gợi ý mục tiêu động theo năng lực & lĩnh vực
  const fetchAiSuggestions = async (domainToFetch: DomainId = selectedDomain) => {
    setIsAiLoading(true);
    try {
      const res = await fetch("/api/ai/suggest-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domainId: domainToFetch,
          subTopics: onboarding?.selectedSubTopics || [],
          proficiencyLevel: onboarding?.proficiencyLevel || "Cơ bản",
          targetDailyMinutes: onboarding?.targetDailyMinutes || 45,
        }),
      });

      const data = await res.json();
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setAiSuggestions(data.suggestions);
        toast.success("AI đã phân tích hồ sơ và đưa ra gợi ý mục tiêu chuẩn xác!");
      }
    } catch (err) {
      console.warn("Lỗi khi tải gợi ý AI:", err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Khi người dùng đổi Domain, cập nhật danh sách gợi ý tương ứng
  const handleDomainChange = (newDomain: DomainId) => {
    setSelectedDomain(newDomain);
    const domainTags = DOMAIN_SPECIFIC_TAGS[newDomain] || DOMAIN_SPECIFIC_TAGS.it_dev;
    if (domainTags[0]) {
      setPromptText(domainTags[0].prompt);
      if (domainTags[0].outcome) setSelectedOutcome(domainTags[0].outcome);
      if (domainTags[0].level) setSelectedLevel(domainTags[0].level);
    }
    // Xóa gợi ý AI cũ để người dùng có thể bấm tạo gợi ý mới cho domain này
    setAiSuggestions([]);
  };

  // Chọn tag gợi ý
  const handleSelectTag = (item: { label: string; prompt: string; outcome?: string; level?: string }) => {
    setPromptText(item.prompt);
    if (item.outcome) setSelectedOutcome(item.outcome);
    if (item.level) setSelectedLevel(item.level);
    toast.success(`Đã chọn mục tiêu: ${item.label}`);
  };

  // Chuyển bước
  const handleNext = () => {
    if (currentStep === 1) {
      if (!promptText.trim()) {
        toast.error("Vui lòng nhập chủ đề bạn muốn học hoặc chọn gợi ý bên dưới!");
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      setCurrentStep(4);
    } else if (currentStep === 4) {
      handleGenerateRoadmap();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.push("/dashboard");
    }
  };

  // Xử lý tạo lộ trình với AI và áp dụng trực tiếp vào Dashboard hoặc xem trước
  const handleGenerateRoadmap = async (targetDestination: "dashboard" | "roadmap" = "dashboard") => {
    setIsGenerating(true);
    toast.loading("Gemini AI đang kiến tạo lộ trình và khởi tạo khóa học cho bạn...");

    try {
      const commitObj = COMMITMENTS.find((c) => c.id === selectedCommitment);
      const commitmentText = commitObj?.label || "45 - 60 phút / ngày";

      // 1. Gọi API AI sinh lộ trình thực tế từ Gemini
      const res = await fetch("/api/ai/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: promptText,
          domain: selectedDomain,
          outcome: selectedOutcome,
          level: selectedLevel,
          commitment: commitmentText,
          duration: targetDuration,
        }),
      });

      const data = await res.json();
      const generatedRoadmap = data.roadmap;

      if (!generatedRoadmap) {
        throw new Error("Không nhận được dữ liệu lộ trình từ AI");
      }

      // 2. Kích hoạt và áp dụng ngay vào Store & Supabase (thay thế lộ trình trên Dashboard)
      await applyAiRoadmap(generatedRoadmap, selectedDomain, commitmentText);

      setIsGenerating(false);
      toast.dismiss();
      toast.success("Đã kích hoạt lộ trình học tập mới thành công! 🚀");

      if (targetDestination === "dashboard") {
        router.push("/dashboard");
      } else {
        const params = new URLSearchParams({
          topic: promptText,
          domain: selectedDomain,
          outcome: selectedOutcome,
          level: selectedLevel,
          duration: targetDuration,
          commit: selectedCommitment,
        });
        router.push(`/roadmap?${params.toString()}`);
      }
    } catch (err) {
      console.error(err);
      setIsGenerating(false);
      toast.dismiss();
      toast.error("Có lỗi khi tạo lộ trình, vui lòng thử lại!");
    }
  };

  // Lấy danh sách tag gợi ý phù hợp cho Domain hiện tại
  const currentDomainTags = DOMAIN_SPECIFIC_TAGS[selectedDomain] || DOMAIN_SPECIFIC_TAGS.it_dev;
  const activeDomainInfo = DOMAIN_OPTIONS.find((d) => d.id === selectedDomain);

  return (
    <div className="flex-1 flex flex-col bg-[#090d16] text-slate-100 min-h-screen">
      {/* 1. Top Bar Navigation */}
      <header className="h-16 px-6 lg:px-8 border-b border-slate-800/80 bg-[#090d16]/80 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{currentStep === 1 ? "Quay lại Dashboard" : "Bước trước"}</span>
        </button>

        {/* 4-Step Stepper (Bám sát thiết kế Screen 5) */}
        <div className="flex items-center gap-2 sm:gap-4 text-xs font-bold">
          {[
            { num: 1, label: "Chủ đề" },
            { num: 2, label: "Mục tiêu" },
            { num: 3, label: "Thời gian" },
            { num: 4, label: "Xem lại" },
          ].map((s, idx) => {
            const isActive = currentStep === s.num;
            const isDone = currentStep > s.num;

            return (
              <div key={s.num} className="flex items-center gap-2">
                {idx > 0 && <span className="h-px w-4 sm:w-8 bg-slate-800 hidden sm:block" />}
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full transition-all ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-500/40"
                      : isDone
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-slate-900 text-slate-500 border border-slate-800"
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px]">
                    {isDone ? <Check className="w-3 h-3 text-emerald-400" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="w-24 text-right text-xs font-semibold text-slate-400">
          Bước {currentStep}/4
        </div>
      </header>

      {/* 2. Main Step Content */}
      <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8 max-w-4xl w-full mx-auto space-y-8">
        {/* ================= STEP 1: CHỦ ĐỀ HỌC TẬP ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Header Titles */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Khởi tạo lộ trình cá nhân hóa</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Bạn muốn học chủ đề gì tiếp theo?
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                AI sẽ căn cứ vào hồ sơ năng lực và chủ đề bạn chọn để thiết kế lộ trình chính xác nhất.
              </p>
            </div>

            {/* Profile Match Banner (Hiển thị ăn khớp với khảo sát) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Đã đồng bộ từ khảo sát ban đầu</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      Khớp 100%
                    </span>
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Lĩnh vực: <span className="text-indigo-300 font-semibold">{activeDomainInfo?.label}</span>
                    {onboarding?.proficiencyLevel && (
                      <> • Trình độ: <span className="text-slate-300 font-medium">{onboarding.proficiencyLevel}</span></>
                    )}
                    {onboarding?.targetDailyMinutes && (
                      <> • Quỹ thời gian: <span className="text-slate-300 font-medium">{onboarding.targetDailyMinutes}p/ngày</span></>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => fetchAiSuggestions(selectedDomain)}
                disabled={isAiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 hover:text-white font-bold transition-all cursor-pointer text-xs shrink-0 self-end sm:self-center"
              >
                {isAiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>AI gợi ý theo năng lực</span>
              </button>
            </div>

            {/* NotebookLM Document Upload Banner (Quét tài liệu thành khóa học) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-indigo-950/40 to-slate-900 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
                  <FileUp className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-white flex items-center gap-2">
                    <span>Bạn đã có sẵn tài liệu hoặc giáo trình?</span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                      NotebookLM Mode
                    </span>
                  </div>
                  <div className="text-slate-400 mt-0.5">
                    Tải file PDF, TXT hoặc dán nội dung để AI quét sâu, tự động chia chương, bài học và tạo đề trắc nghiệm.
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsScannerOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold transition-all cursor-pointer text-xs shrink-0 self-end sm:self-center shadow-md shadow-purple-600/30"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Quét tài liệu ngay 🚀</span>
              </button>
            </div>

            {/* Domain Switcher Pill Bar (Cho phép đổi lĩnh vực nếu muốn học thêm ngành khác) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Lĩnh vực học tập:</span>
                <span>Bấm chọn để chuyển đổi chủ đề gợi ý</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map((opt) => {
                  const isCur = selectedDomain === opt.id;
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleDomainChange(opt.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        isCur
                          ? "bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30"
                          : "bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isCur ? "text-white" : opt.color}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI Smart Input Box */}
            <div className="relative group">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-indigo-500/30 via-purple-500/20 to-pink-500/30 blur-lg opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="relative bg-[#0e1424] border border-indigo-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl focus-within:border-indigo-400 transition-colors">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 shrink-0 mt-1">
                    <Bot className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <textarea
                      value={promptText}
                      onChange={(e) => setPromptText(e.target.value)}
                      rows={3}
                      placeholder={`Ví dụ: Tôi muốn học ${activeDomainInfo?.label} để đi làm trong 3 tháng...`}
                      className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base font-medium resize-none focus:outline-none leading-relaxed"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
                      <span>Mẹo: Bạn có thể viết tự do mục tiêu cụ thể, dự án muốn làm hoặc thời gian</span>
                      <span className="font-medium">{promptText.length}/300 ký tự</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="self-center w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/40 hover:scale-105 transition-all cursor-pointer shrink-0"
                    title="Tiếp tục"
                  >
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Dynamic AI Suggestions if fetched */}
            {aiSuggestions.length > 0 && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-purple-950/60 border border-indigo-500/40 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Gemini AI đề xuất riêng cho hồ sơ của bạn:</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {aiSuggestions.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectTag(item)}
                      className="p-3 rounded-xl bg-slate-900/90 hover:bg-indigo-600/20 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all cursor-pointer group"
                    >
                      <div className="font-bold text-xs text-white group-hover:text-indigo-300 line-clamp-1">
                        {item.label}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.prompt}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggested Topic Tags (Luôn khớp với Domain đã chọn) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <span>Gợi ý chủ đề theo lĩnh vực {activeDomainInfo?.label}:</span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {currentDomainTags.map((tag) => (
                  <button
                    key={tag.label}
                    type="button"
                    onClick={() => handleSelectTag(tag)}
                    className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-indigo-600/20 border border-slate-800 hover:border-indigo-500/50 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer hover:scale-102"
                  >
                    {tag.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 2: MỤC TIÊU & TRÌNH ĐỘ ================= */}
        {currentStep === 2 && (
          <div className="space-y-7 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Mục tiêu của bạn sau khóa học là gì?
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                AI sẽ điều chỉnh độ sâu của bài tập và khối lượng thực hành theo đích đến này.
              </p>
            </div>

            {/* 4 Outcome Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TARGET_OUTCOMES.map((item) => {
                const Icon = item.icon;
                const isSelected = selectedOutcome === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedOutcome(item.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-400 shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-400"
                        : "bg-[#0e1424] border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} flex items-center justify-center border shadow-xs`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? "border-indigo-400 bg-indigo-500 text-white" : "border-slate-700"}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                      </div>
                      <h3 className="font-bold text-white text-base">{item.title}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Level Radio */}
            <div className="space-y-3 pt-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 block">
                  Trình độ xuất phát hiện tại của bạn:
                </label>
                {onboarding?.proficiencyLevel && (
                  <span className="text-[11px] text-indigo-400 font-semibold">
                    (Khảo sát: {onboarding.proficiencyLevel})
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CURRENT_LEVELS.map((lvl) => {
                  const isSelected = selectedLevel === lvl.id;
                  return (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setSelectedLevel(lvl.id)}
                      className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo-900/40 border-indigo-400 text-white shadow-md shadow-indigo-600/20"
                          : "bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="font-bold text-sm text-white">{lvl.label}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{lvl.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Tiếp tục: Chọn thời gian</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 3: THỜI GIAN & CAM KẾT ================= */}
        {currentStep === 3 && (
          <div className="space-y-7 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Cam kết thời gian học tập mỗi ngày
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                AI sẽ tính toán lộ trình vừa vặn với quỹ thời gian của bạn, tránh quá tải hay ngắt quãng.
              </p>
            </div>

            {/* Daily Commitment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {COMMITMENTS.map((c) => {
                const isSelected = selectedCommitment === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCommitment(c.id)}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-indigo-950/60 border-indigo-400 shadow-xl shadow-indigo-600/20 ring-1 ring-indigo-400"
                        : "bg-[#0e1424] border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/80"
                    }`}
                  >
                    {c.recommended && (
                      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Khuyên dùng
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-2">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? "bg-indigo-500 text-white" : "bg-slate-800 text-slate-400"}`}>
                        <Clock className="w-4 h-4" />
                      </div>
                      <h3 className="font-bold text-white text-base">{c.label}</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed pl-12">{c.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Target Duration */}
            <div className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  Thời lượng mong muốn hoàn thành toàn bộ lộ trình:
                </label>
                <span className="text-sm font-bold text-indigo-400">{targetDuration}</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {["1 tháng (Cấp tốc)", "3 tháng (Chuẩn nghề)", "6 tháng (Chuyên sâu)"].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setTargetDuration(d)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                      targetDuration === d
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Xem lại & Khởi tạo lộ trình</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 4: XEM LẠI & CONFIRM ================= */}
        {currentStep === 4 && (
          <div className="space-y-7 animate-in fade-in duration-300">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Sẵn sàng khởi tạo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Xác nhận thông số lộ trình của bạn
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Hãy kiểm tra lại các thiết lập. AI sẽ tổng hợp và kiến tạo một lộ trình chuyên biệt.
              </p>
            </div>

            {/* Summary Review Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0e1424] to-[#0a0f1d] border border-indigo-500/30 shadow-2xl space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">Chủ đề đã chọn</span>
                <h3 className="text-lg sm:text-xl font-bold text-white leading-snug">
                  {promptText}
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
                <div>
                  <span className="text-[11px] text-slate-400 block">Lĩnh vực</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {activeDomainInfo?.label}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Mục tiêu đầu ra</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {TARGET_OUTCOMES.find((o) => o.id === selectedOutcome)?.title.split(" (")[0]}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Trình độ</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {CURRENT_LEVELS.find((l) => l.id === selectedLevel)?.label}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Thời gian học</span>
                  <span className="text-xs font-bold text-slate-200 mt-1 block">
                    {COMMITMENTS.find((c) => c.id === selectedCommitment)?.label.split(" /")[0]} ({targetDuration})
                  </span>
                </div>
              </div>

              {/* AI Generation Highlight */}
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200 leading-relaxed">
                  <span className="font-bold text-white">LearnVerse AI Engine:</span> Lộ trình sẽ được chia thành 4-6 chặng (milestones), tự động tích hợp các bài học lý thuyết, bài thực hành tương tác và quiz kiểm tra năng lực.
                </div>
              </div>
            </div>

            {/* Launch CTA Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                Chỉnh sửa lại thông tin
              </button>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => handleGenerateRoadmap("roadmap")}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Xem chi tiết các tuần học
                </button>

                <button
                  type="button"
                  onClick={() => handleGenerateRoadmap("dashboard")}
                  disabled={isGenerating}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 hover:scale-102 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>AI đang kiến tạo lộ trình...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Áp dụng & Về Dashboard học ngay 🚀</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Bottom Capability Cards */}
        <section className="pt-10 border-t border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>AI sẽ giúp bạn như thế nào?</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { title: "Phân tích đầu vào", desc: "Đánh giá đúng trình độ xuất phát", icon: Target, color: "text-blue-400" },
              { title: "Cấu trúc lộ trình", desc: "Chia nhỏ thành từng chặng tuần tự", icon: Layers, color: "text-indigo-400" },
              { title: "Tuyển chọn nội dung", desc: "Lọc bỏ kiến thức thừa, tập trung cốt lõi", icon: BookOpen, color: "text-purple-400" },
              { title: "Tự động điều chỉnh", desc: "Thích ứng theo tốc độ học thực tế", icon: TrendingUp, color: "text-emerald-400" },
              { title: "Dự án thực tế", desc: "Gắn liền bài tập với sản phẩm thực chiến", icon: Rocket, color: "text-amber-400" },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-4 rounded-xl bg-[#0e1424]/60 border border-slate-800/80 space-y-1.5">
                  <Icon className={`w-4 h-4 ${f.color}`} />
                  <h4 className="text-xs font-bold text-slate-200">{f.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* NotebookLM Document Scanner Modal */}
      <DocumentScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </div>
  );
}
