"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  SkipForward,
  Code2,
  BrainCircuit,
  Palette,
  TrendingUp,
  Globe2,
  Users2,
  Target,
  Clock,
  Award,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import InteractiveStudent3D from "@/components/onboarding/InteractiveStudent3D";
import { useLearningStore } from "@/stores/useLearningStore";
import { DomainId } from "@/types/learning";

// 1. Danh sách các Lĩnh vực học tập (Đa lĩnh vực, không chỉ dev)
interface LearningDomain {
  id: string;
  name: string;
  desc: string;
  icon: typeof Code2;
  color: string;
  subTopics: string[];
}

const LEARNING_DOMAINS: LearningDomain[] = [
  {
    id: "it_dev",
    name: "Công nghệ thông tin & Lập trình",
    desc: "Frontend, Backend, Mobile App, DevOps, An toàn thông tin",
    icon: Code2,
    color: "from-blue-600 to-indigo-600",
    subTopics: ["React & Next.js", "Node.js & Python", "Mobile (Flutter/React Native)", "DevOps & Cloud", "An toàn thông tin"],
  },
  {
    id: "data_ai",
    name: "Khoa học Dữ liệu & Trí tuệ Nhân tạo",
    desc: "Data Analysis, Machine Learning, Deep Learning, GenAI",
    icon: BrainCircuit,
    color: "from-purple-600 to-pink-600",
    subTopics: ["Data Analysis với Python", "Machine Learning", "Generative AI & LLMs", "SQL & Kho dữ liệu", "Data Visualization"],
  },
  {
    id: "ui_ux",
    name: "Thiết kế Đồ họa & UI/UX Design",
    desc: "UI/UX Product Design, Figma, Design System, 3D Art",
    icon: Palette,
    color: "from-rose-500 to-orange-500",
    subTopics: ["Figma & UI Design", "Nghiên cứu trải nghiệm UX", "Design System", "Blender & 3D Art", "Motion Graphics"],
  },
  {
    id: "marketing_biz",
    name: "Kinh doanh số & Marketing",
    desc: "Digital Marketing, SEO, Social Media, Growth, E-Commerce",
    icon: TrendingUp,
    color: "from-amber-500 to-emerald-600",
    subTopics: ["Digital Marketing Strategy", "SEO & Content Marketing", "Performance Ads", "E-Commerce", "Tối ưu chuyển đổi CRO"],
  },
  {
    id: "languages",
    name: "Ngoại ngữ & Giao tiếp quốc tế",
    desc: "Tiếng Anh chuyên ngành, IELTS, Tiếng Nhật, Tiếng Hàn",
    icon: Globe2,
    color: "from-teal-500 to-cyan-600",
    subTopics: ["Tiếng Anh công sở & IT", "Luyện thi IELTS", "Tiếng Nhật thương mại", "Tiếng Trung giao tiếp", "Tiếng Hàn du học"],
  },
  {
    id: "management",
    name: "Quản trị dự án & Kỹ năng mềm",
    desc: "Project Management, Agile/Scrum, Lãnh đạo, Tư duy phản biện",
    icon: Users2,
    color: "from-violet-600 to-indigo-800",
    subTopics: ["Agile & Scrum Master", "Product Management", "Kỹ năng thuyết trình", "Quản lý thời gian", "Tư duy phản biện"],
  },
];

// 2. Bộ câu hỏi trắc nghiệm thích ứng theo từng lĩnh vực (Adaptive Questions)
interface Question {
  id: number;
  question: string;
  options: { key: string; text: string }[];
}

const QUESTIONS_BY_DOMAIN: Record<string, Question[]> = {
  it_dev: [
    {
      id: 1,
      question: "Bạn đã có kinh nghiệm lập trình hoặc kiến thức nền tảng nào trước đây chưa?",
      options: [
        { key: "A", text: "Tôi là người mới bắt đầu hoàn toàn, chưa từng học lập trình" },
        { key: "B", text: "Đã biết các khái niệm cơ bản (Biến, Vòng lặp, Hàm, Điều kiện)" },
        { key: "C", text: "Đã có thể tự xây dựng các dự án web nhỏ hoặc làm bài tập ứng dụng" },
        { key: "D", text: "Đã đi làm hoặc có kinh nghiệm lập trình chuyên sâu" },
      ],
    },
    {
      id: 2,
      question: "Trong lập trình Web hiện đại (như React), `useEffect` thường được sử dụng để làm gì?",
      options: [
        { key: "A", text: "Quản lý state nội bộ của component" },
        { key: "B", text: "Thực hiện side effects như gọi API, đăng ký subscription, cập nhật DOM..." },
        { key: "C", text: "Tạo một functional component mới từ đầu" },
        { key: "D", text: "Xử lý phân trang và định tuyến (Routing) cho trang web" },
      ],
    },
    {
      id: 3,
      question: "Khái niệm nào mô tả đúng nhất về API (Application Programming Interface)?",
      options: [
        { key: "A", text: "Giao diện người dùng đồ họa hiển thị trên màn hình" },
        { key: "B", text: "Cầu nối cho phép hai hoặc nhiều phần mềm giao tiếp và trao đổi dữ liệu với nhau" },
        { key: "C", text: "Một loại cơ sở dữ liệu quan hệ lưu trữ dữ liệu dạng bảng" },
        { key: "D", text: "Hệ điều hành dành riêng cho máy chủ đám mây" },
      ],
    },
  ],
  data_ai: [
    {
      id: 1,
      question: "Mức độ hiểu biết hiện tại của bạn về Khoa học Dữ liệu và AI là gì?",
      options: [
        { key: "A", text: "Mới tìm hiểu, quan tâm đến ứng dụng của ChatGPT và AI" },
        { key: "B", text: "Biết sử dụng Python hoặc Excel cơ bản để xử lý số liệu" },
        { key: "C", text: "Đã từng thực hành thư viện Pandas, NumPy và huấn luyện mô hình ML cơ bản" },
        { key: "D", text: "Có kinh nghiệm thực chiến Deep Learning, NLP hoặc Computer Vision" },
      ],
    },
    {
      id: 2,
      question: "Trong Python phân tích dữ liệu, thư viện nào phổ biến nhất để xử lý cấu trúc bảng (DataFrame)?",
      options: [
        { key: "A", text: "Matplotlib" },
        { key: "B", text: "Pandas" },
        { key: "C", text: "PyTorch" },
        { key: "D", text: "Scrapy" },
      ],
    },
    {
      id: 3,
      question: "Sự khác biệt cốt lõi giữa Học có giám sát (Supervised) và Học không giám sát (Unsupervised) là gì?",
      options: [
        { key: "A", text: "Dữ liệu huấn luyện có chứa nhãn (labels) kết quả hay không" },
        { key: "B", text: "Tốc độ chạy của mô hình trên GPU" },
        { key: "C", text: "Dùng ngôn ngữ Python hay R để lập trình" },
        { key: "D", text: "Số lượng tham số của mô hình lớn hay nhỏ" },
      ],
    },
  ],
  ui_ux: [
    {
      id: 1,
      question: "Kinh nghiệm của bạn trong lĩnh vực thiết kế đồ họa / UI-UX như thế nào?",
      options: [
        { key: "A", text: "Mới bắt đầu, có thẩm mỹ tốt và muốn học bài bản" },
        { key: "B", text: "Biết sử dụng công cụ thiết kế cơ bản như Canva, Photoshop" },
        { key: "C", text: "Thành thạo Figma, biết làm Wireframe và Prototype tương tác" },
        { key: "D", text: "Đã thiết kế sản phẩm thực tế, xây dựng Design System hoàn chỉnh" },
      ],
    },
    {
      id: 2,
      question: "Mục đích quan trọng nhất của việc xây dựng 'Design System' trong sản phẩm là gì?",
      options: [
        { key: "A", text: "Để trang trí cho ứng dụng đẹp mắt hơn" },
        { key: "B", text: "Đảm bảo tính nhất quán (consistency), tái sử dụng và tăng tốc phát triển giữa Design & Dev" },
        { key: "C", text: "Thay thế hoàn toàn vai trò của lập trình viên Frontend" },
        { key: "D", text: "Giảm dung lượng cài đặt của ứng dụng di động" },
      ],
    },
    {
      id: 3,
      question: "Thuật ngữ 'Affordance' trong thiết kế trải nghiệm người dùng (UX) có nghĩa là gì?",
      options: [
        { key: "A", text: "Chi phí tài chính để mua bản quyền phần mềm thiết kế" },
        { key: "B", text: "Dấu hiệu gợi mở trực quan cho người dùng biết vật thể hoặc nút đó có thể tương tác như thế nào" },
        { key: "C", text: "Độ phân giải hiển thị của màn hình thiết bị" },
        { key: "D", text: "Bảng mã màu RGB chuẩn trong thiết kế in ấn" },
      ],
    },
  ],
  marketing_biz: [
    {
      id: 1,
      question: "Trình độ kinh nghiệm của bạn trong Digital Marketing và Kinh doanh số?",
      options: [
        { key: "A", text: "Người mới bắt đầu tìm hiểu về kinh doanh trực tuyến" },
        { key: "B", text: "Đã thử viết content, quản lý fanpage hoặc bán hàng online nhỏ" },
        { key: "C", text: "Đã chạy quảng cáo Facebook/Google Ads, biết làm SEO hoặc email marketing" },
        { key: "D", text: "Đã có kinh nghiệm quản lý chiến dịch ngân sách lớn và tối ưu phễu chuyển đổi" },
      ],
    },
    {
      id: 2,
      question: "Trong Marketing phễu bán hàng (Marketing Funnel), chỉ số 'CAC' biểu thị điều gì?",
      options: [
        { key: "A", text: "Tổng doanh thu bán hàng mỗi tháng" },
        { key: "B", text: "Customer Acquisition Cost - Chi phí để có được một khách hàng mới" },
        { key: "C", text: "Tỷ lệ khách hàng rời bỏ dịch vụ sau 30 ngày" },
        { key: "D", text: "Số lượng bình luận tích cực trên mạng xã hội" },
      ],
    },
    {
      id: 3,
      question: "Yếu tố nào sau đây là quan trọng nhất để cải thiện thứ hạng SEO tự nhiên bền vững?",
      options: [
        { key: "A", text: "Spam thật nhiều từ khóa ẩn trong mã HTML" },
        { key: "B", text: "Nội dung chất lượng cao, giải quyết đúng ý định tìm kiếm (Search Intent) và trải nghiệm người dùng tốt" },
        { key: "C", text: "Mua hàng nghìn backlink giá rẻ từ các trang web lạ" },
        { key: "D", text: "Thay đổi tiêu đề bài viết liên tục mỗi ngày" },
      ],
    },
  ],
  languages: [
    {
      id: 1,
      question: "Trình độ ngoại ngữ hiện tại của bạn đang ở mức nào?",
      options: [
        { key: "A", text: "Mất gốc hoặc mới bắt đầu từ con số 0" },
        { key: "B", text: "Đã nắm ngữ pháp cơ bản, đọc hiểu câu đơn giản nhưng ngại nói" },
        { key: "C", text: "Giao tiếp được các tình huống quen thuộc, tương đương B1/IELTS 5.0+" },
        { key: "D", text: "Giao tiếp trôi chảy trong công việc chuyên môn và môi trường quốc tế" },
      ],
    },
    {
      id: 2,
      question: "Phương pháp học ngoại ngữ nào sau đây được chứng minh mang lại phản xạ tự nhiên cao nhất?",
      options: [
        { key: "A", text: "Chỉ ghi nhớ danh sách từ vựng đơn lẻ không theo ngữ cảnh" },
        { key: "B", text: "Đắm chìm (Immersion) kết hợp Spaced Repetition và thực hành giao tiếp theo ngữ cảnh thực tế" },
        { key: "C", text: "Học thuộc lòng toàn bộ cuốn sách ngữ pháp" },
        { key: "D", text: "Chỉ làm bài tập ngữ pháp trắc nghiệm trên giấy" },
      ],
    },
    {
      id: 3,
      question: "Khi bạn gặp một từ vựng mới trong bài đọc chuyên ngành, cách xử lý tối ưu là:",
      options: [
        { key: "A", text: "Dừng lại tra từ điển ngay lập tức cho từng từ" },
        { key: "B", text: "Đoán nghĩa dựa trên ngữ cảnh xung quanh câu, sau đó ghi chú lại cụm từ (collocation)" },
        { key: "C", text: "Bỏ qua luôn và không cần quan tâm" },
        { key: "D", text: "Dịch nguyên văn cả đoạn văn bản sang tiếng mẹ đẻ bằng máy" },
      ],
    },
  ],
  management: [
    {
      id: 1,
      question: "Kinh nghiệm quản lý dự án hoặc điều phối công việc của bạn như thế nào?",
      options: [
        { key: "A", text: "Chưa có kinh nghiệm, muốn rèn luyện kỹ năng làm việc hiệu quả" },
        { key: "B", text: "Đã từng làm việc nhóm hoặc làm nhóm trưởng trong các bài tập/dự án nhỏ" },
        { key: "C", text: "Đã áp dụng phương pháp Agile, Scrum, Kanban trong công việc thực tế" },
        { key: "D", text: "Đang là Project Manager / Scrum Master / Trưởng nhóm chuyên nghiệp" },
      ],
    },
    {
      id: 2,
      question: "Trong quy trình Agile/Scrum, buổi họp 'Sprint Retrospective' được tổ chức nhằm mục đích gì?",
      options: [
        { key: "A", text: "Chỉ trích những cá nhân mắc lỗi trong dự án" },
        { key: "B", text: "Đội ngũ cùng nhìn lại quy trình vừa qua để tìm ra điểm cải tiến liên tục cho sprint tiếp theo" },
        { key: "C", text: "Báo cáo doanh thu tài chính với ban giám đốc" },
        { key: "D", text: "Phân chia tiền thưởng cho các thành viên" },
      ],
    },
    {
      id: 3,
      question: "Kỹ năng mềm nào sau đây đóng vai trò nền tảng nhất trong việc giải quyết xung đột nhóm?",
      options: [
        { key: "A", text: "Áp đặt quyền lực của người đứng đầu" },
        { key: "B", text: "Lắng nghe tích cực (Active Listening) và thấu cảm (Empathy)" },
        { key: "C", text: "Tránh né vấn đề để không làm mất hòa khí" },
        { key: "D", text: "Nhờ người ngoài can thiệp và quyết định thay" },
      ],
    },
  ],
};

// 3. Danh sách mục tiêu học tập (Bước 3)
const LEARNING_GOALS = [
  { id: "job", title: "Đi làm / Ứng tuyển doanh nghiệp", desc: "Chuẩn bị kỹ năng thực chiến để vượt qua phỏng vấn và nhận việc", icon: "💼" },
  { id: "project", title: "Xây dựng sản phẩm cá nhân", desc: "Tự tay hiện thực hóa ý tưởng thành sản phẩm hoàn chỉnh để đưa vào Portfolio", icon: "🚀" },
  { id: "switch", title: "Chuyển hướng nghề nghiệp", desc: "Chuyển từ ngành khác sang với lộ trình bài bản từ con số 0", icon: "🔄" },
  { id: "upgrade", title: "Nâng cao chuyên môn & Thăng tiến", desc: "Cập nhật công nghệ mới, nâng cao hiệu suất và gia tăng thu nhập", icon: "📈" },
];

const COMMITMENT_TIMES = [
  { id: "15-30m", label: "15 - 30 phút / ngày", desc: "Nhẹ nhàng, duy trì thói quen streak mỗi ngày" },
  { id: "45-60m", label: "45 - 60 phút / ngày", desc: "Tiêu chuẩn đề xuất, tiến độ đều đặn và hiệu quả cao" },
  { id: "1-2h", label: "1 - 2 giờ / ngày", desc: "Tăng tốc nhanh, nhanh chóng chinh phục mục tiêu lớn" },
  { id: "2h+", label: "Trên 2 giờ / ngày", desc: "Toàn thời gian, rèn luyện chuyên sâu bứt phá" },
];

export default function OnboardingPage() {
  const router = useRouter();

  // Multi-step state: Bắt đầu chuẩn xác từ Step 1/4!
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Lĩnh vực
  const [selectedDomain, setSelectedDomain] = useState<string>("it_dev");
  const [selectedSubTopics, setSelectedSubTopics] = useState<string[]>(["React & Next.js"]);

  // Step 2: Khảo sát năng lực (Questions)
  const currentQuestions = QUESTIONS_BY_DOMAIN[selectedDomain] || QUESTIONS_BY_DOMAIN["it_dev"];
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({
    1: "B",
    2: "B",
  });

  // Step 3: Mục tiêu & Thời gian
  const [selectedGoal, setSelectedGoal] = useState<string>("job");
  const [selectedCommitment, setSelectedCommitment] = useState<string>("45-60m");

  // Robot State
  const [robotMood, setRobotMood] = useState<"idle" | "happy" | "thinking" | "analyzing">("idle");
  const [robotTooltip, setRobotTooltip] = useState<string>("Xin chào! Mình là trợ lý AI LearnVerse ✨");

  // Dynamic tip theo step
  const getStepTip = () => {
    switch (currentStep) {
      case 1:
        return "Bạn có thể chọn bất kỳ lĩnh vực nào bạn yêu thích. LearnVerse sẽ tinh chỉnh toàn bộ nội dung khóa học và phòng thực hành 3D theo lựa chọn của bạn!";
      case 2:
        return "Đừng lo nếu bạn chưa biết câu trả lời. Đây chỉ là bài kiểm tra để chúng tôi hiểu bạn hơn và thiết lập lộ trình chính xác nhất.";
      case 3:
        return "Học đều đặn 30 - 45 phút mỗi ngày hiệu quả hơn gấp 3 lần so với việc dồn học 5 tiếng vào cuối tuần!";
      case 4:
        return "Hệ thống AI đã phân tích hồ sơ năng lực của bạn và sẵn sàng đưa bạn vào vũ trụ học tập 3D!";
      default:
        return "LearnVerse 3D luôn đồng hành cùng bạn!";
    }
  };

  const handleSelectSubTopic = (topic: string) => {
    setSelectedSubTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const handleSelectOption = (key: string) => {
    const q = currentQuestions[currentQIndex];
    if (!q) return;
    setAnswers((prev) => ({
      ...prev,
      [q.id]: key,
    }));
    setRobotMood("happy");
    setRobotTooltip("Lựa chọn rất tốt! Hãy tiếp tục nào ✨");
  };

  const handleNextInStep2 = () => {
    if (currentQIndex < currentQuestions.length - 1) {
      setCurrentQIndex((prev) => prev + 1);
      setRobotMood("thinking");
    } else {
      // Đã xong câu hỏi -> chuyển sang Bước 3
      setCurrentStep(3);
      setRobotMood("happy");
      setRobotTooltip("Đã xong khảo sát năng lực! Tiếp theo là mục tiêu của bạn.");
    }
  };

  const handlePrevInStep2 = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex((prev) => prev - 1);
    } else {
      // Quay lại bước 1
      setCurrentStep(1);
    }
  };

  const saveOnboarding = useLearningStore((state) => state.saveOnboarding);
  const setDomain = useLearningStore((state) => state.setDomain);

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setCurrentQIndex(0);
      setRobotMood("thinking");
      setRobotTooltip("Hãy cùng trả lời vài câu hỏi nhanh để AI đánh giá nhé!");
    } else if (currentStep === 3) {
      setCurrentStep(4);
      setRobotMood("analyzing");
      setRobotTooltip("Đang phân tích dữ liệu & khởi tạo lộ trình học 3D...");
    } else if (currentStep === 4) {
      const minutesMap: Record<string, number> = {
        "15-30m": 30,
        "45-60m": 45,
        "1-2h": 60,
        "2h+": 120,
      };

      saveOnboarding({
        domainId: selectedDomain as DomainId,
        selectedSubTopics,
        testScore: Object.keys(answers).length * 10,
        totalQuestions: currentQuestions.length * 10,
        proficiencyLevel: "Trung cấp",
        learningObjective: selectedGoal,
        targetDailyMinutes: minutesMap[selectedCommitment] || 45,
        completedAt: new Date().toISOString(),
      });

      toast.success("Khởi tạo lộ trình thành công! Đang đưa bạn đến Bảng điều khiển...");
      router.push("/dashboard");
    }
  };

  const handleSkip = () => {
    setDomain((selectedDomain as DomainId) || "it_dev");
    toast.info("Đã bỏ qua khảo sát ban đầu. Bạn có thể cập nhật lại mục tiêu bất cứ lúc nào trong cài đặt!");
    router.push("/dashboard");
  };

  const currentQ = currentQuestions[currentQIndex] || currentQuestions[0];
  const activeDomainObj = LEARNING_DOMAINS.find((d) => d.id === selectedDomain) || LEARNING_DOMAINS[0];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* 1. Top Navbar (Clean White Header matching Master Design) */}
      <header className="h-16 border-b border-slate-200/90 px-6 sm:px-12 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/50 transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-800 bg-clip-text text-transparent">
            LearnVerse
          </span>
        </Link>

        <button
          onClick={handleSkip}
          className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors py-1.5 px-3 rounded-lg hover:bg-slate-100 border border-slate-200 cursor-pointer"
        >
          <span>Bỏ qua kiểm tra</span>
          <SkipForward className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* 2. Main Onboarding Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Progress Bar & Steps Indicator */}
        <div className="max-w-3xl mb-6 space-y-2.5">
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-indigo-600">
            <span>
              Bước {currentStep}/{totalSteps}
            </span>
            <span>
              {currentStep === 1 && "Chọn lĩnh vực học tập"}
              {currentStep === 2 && "Kiểm tra trình độ ban đầu"}
              {currentStep === 3 && "Mục tiêu & Kế hoạch thời gian"}
              {currentStep === 4 && "AI Phân tích & Khởi tạo lộ trình"}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200/90 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 rounded-full transition-all duration-500 ease-out shadow-xs"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Section Heading */}
        <div className="mb-6 space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            {currentStep === 1 && "Bạn muốn phát triển kỹ năng trong lĩnh vực nào?"}
            {currentStep === 2 && "Kiểm tra trình độ ban đầu"}
            {currentStep === 3 && "Mục tiêu học tập & Cam kết thời gian"}
            {currentStep === 4 && "AI Phân tích & Thiết kế lộ trình cá nhân hóa"}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            {currentStep === 1 &&
              "LearnVerse hỗ trợ đa dạng lĩnh vực. Hãy chọn lĩnh vực bạn quan tâm nhất để AI chuẩn bị bài khảo sát và lộ trình phù hợp."}
            {currentStep === 2 &&
              "Chúng tôi sẽ đưa ra một số câu hỏi để đánh giá trình độ hiện tại và tạo lộ trình phù hợp nhất cho bạn."}
            {currentStep === 3 &&
              "Xác định rõ đích đến và quỹ thời gian giúp hệ thống phân bổ khối lượng kiến thức khoa học và bền vững."}
            {currentStep === 4 &&
              "Dựa trên các câu trả lời và phân tích năng lực, trợ lý AI đang khởi tạo lộ trình học tập 3D dành riêng cho bạn."}
          </p>
        </div>

        {/* Main Grid: Left Area (Step Content) & Right Area (Interactive 3D Robot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ================= CỘT TRÁI (8 CỘT) ================= */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between min-h-[460px]">
            {/* ====== BƯỚC 1: CHỌN LĨNH VỰC ====== */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Lĩnh vực học tập chính
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {LEARNING_DOMAINS.map((domain) => {
                      const IconComponent = domain.icon;
                      const isSelected = selectedDomain === domain.id;
                      return (
                        <div
                          key={domain.id}
                          onClick={() => {
                            setSelectedDomain(domain.id);
                            setSelectedSubTopics(domain.subTopics.slice(0, 2));
                            setRobotMood("happy");
                            setRobotTooltip(`Tuyệt vời! ${domain.name} là một lựa chọn đón đầu xu hướng! ✨`);
                          }}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all duration-200 relative ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-600 shadow-sm ring-1 ring-indigo-500/50"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-white bg-gradient-to-br ${domain.color} shadow-xs`}
                            >
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-bold text-sm text-slate-900 leading-snug">{domain.name}</h4>
                                {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                              </div>
                              <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{domain.desc}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Sub-topics tags */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
                    Chủ đề chuyên sâu bạn đặc biệt quan tâm trong {activeDomainObj.name}:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {activeDomainObj.subTopics.map((topic) => {
                      const isChecked = selectedSubTopics.includes(topic);
                      return (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => handleSelectSubTopic(topic)}
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer border ${
                            isChecked
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                              : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200"
                          }`}
                        >
                          {isChecked ? "✓ " : "+ "}
                          {topic}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Action for Step 1 */}
                <div className="flex items-center justify-end pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>Tiếp tục sang khảo sát năng lực</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ====== BƯỚC 2: KHẢO SÁT NĂNG LỰC (THEO THIẾT KẾ MẪU SCREEN 3) ====== */}
            {currentStep === 2 && (
              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* Badge số câu hỏi (Chuẩn mẫu Screen 3: 'Câu 3/10') */}
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold mb-4 shadow-2xs">
                    Câu {currentQIndex + 1}/{currentQuestions.length} • Lĩnh vực {activeDomainObj.name}
                  </div>

                  {/* Tiêu đề câu hỏi */}
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 leading-relaxed">
                    {currentQ.question}
                  </h2>

                  {/* Danh sách 4 Option A, B, C, D chuẩn phong cách thiết kế Screen 3 */}
                  <div className="space-y-3">
                    {currentQ.options.map((option) => {
                      const isSelected = answers[currentQ.id] === option.key;
                      return (
                        <button
                          key={option.key}
                          type="button"
                          onClick={() => handleSelectOption(option.key)}
                          className={`w-full p-4 rounded-xl text-left text-sm font-medium transition-all duration-200 flex items-center gap-4 cursor-pointer border ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20 ring-2 ring-indigo-600/30"
                              : "bg-white border-slate-200 hover:border-slate-300 text-slate-800 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${
                              isSelected
                                ? "bg-white/25 text-white"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {option.key}
                          </div>
                          <span className="flex-1 leading-snug">{option.text}</span>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-white shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation Buttons (Chuẩn vị trí mẫu Screen 3) */}
                <div className="flex items-center justify-between pt-8 mt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handlePrevInStep2}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>{currentQIndex === 0 ? "Quay lại chọn lĩnh vực" : "Câu trước"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextInStep2}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>{currentQIndex === currentQuestions.length - 1 ? "Hoàn thành kiểm tra" : "Câu tiếp theo"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ====== BƯỚC 3: MỤC TIÊU & THỜI GIAN ====== */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* Mục tiêu học tập */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <span>Mục tiêu cốt lõi của bạn khi học {activeDomainObj.name}?</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {LEARNING_GOALS.map((goal) => {
                      const isSelected = selectedGoal === goal.id;
                      return (
                        <div
                          key={goal.id}
                          onClick={() => {
                            setSelectedGoal(goal.id);
                            setRobotMood("happy");
                            setRobotTooltip(`Mục tiêu rất rõ ràng! Chúng ta cùng quyết tâm nhé! 💪`);
                          }}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-600 shadow-sm ring-1 ring-indigo-500/50"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-2xl">{goal.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm text-slate-900">{goal.title}</h4>
                              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{goal.desc}</p>
                            </div>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quỹ thời gian mỗi ngày */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    <span>Thời gian bạn có thể dành ra mỗi ngày?</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {COMMITMENT_TIMES.map((time) => {
                      const isSelected = selectedCommitment === time.id;
                      return (
                        <div
                          key={time.id}
                          onClick={() => {
                            setSelectedCommitment(time.id);
                            setRobotMood("happy");
                          }}
                          className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? "bg-indigo-50/70 border-indigo-600 shadow-sm ring-1 ring-indigo-500/50"
                              : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-900">{time.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />}
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{time.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Navigation for Step 3 */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Quay lại khảo sát</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-xs sm:text-sm font-bold text-white shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <span>Xem kết quả phân tích AI</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ====== BƯỚC 4: AI PHÂN TÍCH & KHỞI TẠO LỘ TRÌNH ====== */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50/50 to-pink-50/30 border border-indigo-100 rounded-2xl p-6 relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                        Đánh giá năng lực tổng quan
                      </span>
                      <h3 className="text-lg font-bold text-slate-900">
                        Trình độ đề xuất: Sơ cấp vững vàng (Beginner+)
                      </h3>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed mb-4">
                    Dựa trên các câu trả lời trắc nghiệm, AI nhận thấy bạn đã có tư duy logic cơ bản trong lĩnh vực{" "}
                    <strong className="text-indigo-700 font-bold">{activeDomainObj.name}</strong>. Lộ trình của bạn sẽ
                    bỏ qua các lý thuyết rườm rà, tập trung 80% thời lượng vào dự án thực chiến và phòng thí nghiệm 3D
                    tương tác!
                  </p>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-indigo-600">12 Tuần</div>
                      <div className="text-[11px] text-slate-500 font-medium">Thời gian dự kiến</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-purple-600">8 Chặng</div>
                      <div className="text-[11px] text-slate-500 font-medium">Milestones 3D</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-pink-600">48 Bài</div>
                      <div className="text-[11px] text-slate-500 font-medium">Bài học & Lab</div>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm border border-indigo-100 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-emerald-600">24 Test</div>
                      <div className="text-[11px] text-slate-500 font-medium">Thử thách trắc nghiệm</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Chủ đề đã chọn đưa vào lộ trình:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSubTopics.map((topic) => (
                      <span
                        key={topic}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold"
                      >
                        <Zap className="w-3 h-3 text-indigo-600" />
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Action for Step 4 */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Điều chỉnh lại</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/35 transition-all cursor-pointer"
                  >
                    <span>Khám phá Dashboard & Bắt đầu học ngay 🚀</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ================= CỘT PHẢI (4 CỘT): 3D ROBOT ASSISTANT & TIP BOX ================= */}
          <div className="lg:col-span-4 flex flex-col items-center">
            {/* Robot 3D Character Card (Light, Frosted, Clean Style matching master design) */}
            <div className="w-full bg-gradient-to-b from-indigo-50/70 via-purple-50/40 to-white border border-indigo-100/90 rounded-2xl p-6 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
              {/* Soft Ambient Radial Glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

              {/* Status Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 border border-indigo-100 text-indigo-700 text-xs font-semibold mb-2 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Bạn đồng hành 3D LearnVerse</span>
              </div>

              {/* 3D WebGL Student Companion Canvas with Mouse Tracking & Expressions */}
              <div className="my-2">
                <InteractiveStudent3D
                  mood={robotMood}
                  tooltipText={robotTooltip}
                  onCharacterClick={() => {
                    setRobotMood("happy");
                    setRobotTooltip("Chào bạn! Chúng mình cùng cố gắng học tập nhé! 🎒✨");
                  }}
                />
              </div>

              {/* Speech / Tip Card (Chuẩn theo Screen 3 trong mẫu thiết kế) */}
              <div className="w-full bg-white border border-slate-200/90 rounded-xl p-4 text-left shadow-xs relative z-10 space-y-1.5 mt-2">
                <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                  <span>Mẹo nhỏ</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {getStepTip()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
