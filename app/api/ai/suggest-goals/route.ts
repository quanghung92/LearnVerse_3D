import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Fallback curated suggestions per domain in case Gemini API is temporarily busy (503)
const DOMAIN_FALLBACK_SUGGESTIONS: Record<string, Array<{ label: string; prompt: string; outcome: string; level: string }>> = {
  k12_school: [
    {
      label: "Tiếng Anh Lớp 2 (Global Success)",
      prompt: "Tôi muốn học Tiếng Anh lớp 2 bám sát SGK Global Success, thành thạo từ vựng gia đình, số đếm và giao tiếp tự tin.",
      outcome: "school_high",
      level: "beginner",
    },
    {
      label: "Toán Lớp 2: Phép tính có nhớ",
      prompt: "Tôi muốn học Toán lớp 2, làm chủ phép cộng trừ có nhớ trong phạm vi 100 và bảng nhân 2, nhân 5.",
      outcome: "school_high",
      level: "beginner",
    },
    {
      label: "Toán Lớp 5: Ôn thi vào Lớp 6",
      prompt: "Tôi muốn ôn luyện các dạng toán chuyển động đều, phân số, tỉ số phần trăm để thi vào trường THCS chất lượng cao.",
      outcome: "exam",
      level: "intermediate",
    },
  ],
  stem_kids: [
    {
      label: "Lập trình Scratch: Tự tạo Game 2D",
      prompt: "Tôi muốn học lập trình kéo thả Scratch để tự sáng tạo game né chướng ngại vật và phim hoạt hình tương tác.",
      outcome: "project",
      level: "beginner",
    },
    {
      label: "Toán tư duy Kangaroo",
      prompt: "Tôi muốn rèn luyện tư duy phản biện và giải các câu đố toán học thông minh theo đề thi quốc tế Kangaroo.",
      outcome: "exam",
      level: "intermediate",
    },
  ],
  it_dev: [
    {
      label: "Next.js 15 & Fullstack SaaS",
      prompt: "Tôi muốn học chuyên sâu React 19, Next.js 15 App Router, Server Actions và Supabase để tự xây dựng một ứng dụng SaaS hoàn chỉnh sẵn sàng tuyển dụng.",
      outcome: "job",
      level: "intermediate",
    },
    {
      label: "TypeScript & System Architecture",
      prompt: "Tôi muốn nắm vững TypeScript nâng cao, Design Patterns và kiến trúc phần mềm Clean Architecture để nâng cấp lên vị trí Mid-level.",
      outcome: "advance",
      level: "experienced",
    },
    {
      label: "Mobile App với Flutter / React Native",
      prompt: "Tôi muốn học phát triển ứng dụng di động đa nền tảng iOS & Android với Flutter và Firebase từ số 0 để làm đồ án thực tế.",
      outcome: "project",
      level: "beginner",
    },
  ],
  data_ai: [
    {
      label: "Python Data Analytics & SQL",
      prompt: "Tôi muốn học Python, thư viện Pandas, NumPy, SQL và PowerBI để phân tích dữ liệu kinh doanh và ứng tuyển vị trí Data Analyst.",
      outcome: "job",
      level: "beginner",
    },
    {
      label: "Generative AI & LLM Engineering",
      prompt: "Tôi muốn làm chủ kiến trúc RAG, Prompt Engineering, Vector Databases và tích hợp mô hình Gemini/OpenAI vào ứng dụng thực tế.",
      outcome: "advance",
      level: "intermediate",
    },
    {
      label: "Machine Learning Dự đoán",
      prompt: "Tôi muốn học các thuật toán Machine Learning Scikit-Learn và xây dựng mô hình dự báo tài chính/thị trường thực tế.",
      outcome: "project",
      level: "intermediate",
    },
  ],
  ui_ux: [
    {
      label: "Product UI/UX & Design System",
      prompt: "Tôi muốn học làm chủ Figma từ Auto-layout, Variables, đến việc xây dựng một Design System quy mô lớn và chuẩn bị Portfolio trên Behance.",
      outcome: "job",
      level: "intermediate",
    },
    {
      label: "UX Research & Phỏng vấn người dùng",
      prompt: "Tôi muốn học các phương pháp nghiên cứu người dùng UX, Usability Testing và thiết kế Wireframe tối ưu hóa tỷ lệ chuyển đổi.",
      outcome: "advance",
      level: "intermediate",
    },
    {
      label: "Motion UI & 3D Interactive Web",
      prompt: "Tôi muốn kết hợp UI Design với chuyển động vi mô (Micro-animations) và đồ họa 3D để tạo ra trải nghiệm website đột phá.",
      outcome: "project",
      level: "experienced",
    },
  ],
  languages: [
    {
      label: "Tiếng Anh chuyên ngành IT & Phỏng vấn",
      prompt: "Tôi muốn nâng cao vốn từ vựng IT, kỹ năng thuyết trình Sprint Review và tự tin trả lời phỏng vấn kỹ thuật bằng Tiếng Anh với công ty quốc tế.",
      outcome: "job",
      level: "intermediate",
    },
    {
      label: "Luyện thi IELTS 6.5 - 7.0 Cấp tốc",
      prompt: "Tôi muốn ôn luyện chiến lược 4 kỹ năng IELTS, tập trung vào Writing Task 2 và Speaking theo các chủ đề học thuật.",
      outcome: "advance",
      level: "intermediate",
    },
    {
      label: "Giao tiếp Công sở & Đàm phán",
      prompt: "Tôi muốn rèn luyện kỹ năng viết Email chuyên nghiệp, thương lượng lương và giao tiếp đa văn hóa trong môi trường làm việc toàn cầu.",
      outcome: "advance",
      level: "beginner",
    },
  ],
  marketing: [
    {
      label: "Performance Ads & Tối ưu ROAS",
      prompt: "Tôi muốn làm chủ Facebook Ads, Google Performance Max, đo lường dữ liệu với GA4 và tối ưu chi phí quảng cáo cho doanh nghiệp.",
      outcome: "job",
      level: "intermediate",
    },
    {
      label: "SEO Tổng thể & Content Strategy",
      prompt: "Tôi muốn xây dựng chiến lược Content SEO lên Top Google bền vững, kết hợp công cụ AI để gia tăng lượng truy cập tự nhiên.",
      outcome: "project",
      level: "beginner",
    },
    {
      label: "Growth Hacking & E-commerce",
      prompt: "Tôi muốn học cách xây dựng phễu chuyển đổi (Sales Funnel), Email Automation và tối ưu tỷ lệ mua hàng trên sàn thương mại điện tử.",
      outcome: "advance",
      level: "experienced",
    },
  ],
  management: [
    {
      label: "Agile & Scrum Master Chuyên nghiệp",
      prompt: "Tôi muốn nắm vững quy trình Scrum, các nghi thức Agile, vận hành Jira mượt mà và chuẩn bị cho chứng chỉ PSM I để dẫn dắt team.",
      outcome: "job",
      level: "intermediate",
    },
    {
      label: "Product Management & Định hình sản phẩm",
      prompt: "Tôi muốn học cách xây dựng Product Roadmap, phân tích đối thủ, viết User Story và đo lường Product-Market Fit.",
      outcome: "advance",
      level: "experienced",
    },
    {
      label: "Kỹ năng Lãnh đạo & Quản lý nhóm",
      prompt: "Tôi muốn rèn luyện kỹ năng giao việc, phản hồi (Feedback) xây dựng, giải quyết xung đột và thúc đẩy hiệu suất làm việc nhóm.",
      outcome: "advance",
      level: "beginner",
    },
  ],
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { domainId = "it_dev", subTopics = [], proficiencyLevel = "Cơ bản", targetDailyMinutes = 45 } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const fallback = DOMAIN_FALLBACK_SUGGESTIONS[domainId] || DOMAIN_FALLBACK_SUGGESTIONS.it_dev;
      return NextResponse.json({ suggestions: fallback, source: "curated" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Bạn là cố vấn học tập AI cao cấp của nền tảng LearnVerse 3D.
Dựa trên thông tin hồ sơ người dùng sau đây:
- Lĩnh vực học tập: ${domainId}
- Các chủ đề con quan tâm: ${Array.isArray(subTopics) && subTopics.length > 0 ? subTopics.join(", ") : "Chưa chọn cụ thể"}
- Trình độ hiện tại: ${proficiencyLevel}
- Thời gian học mỗi ngày: ${targetDailyMinutes} phút/ngày

Hãy gợi ý ĐÚNG 3 mục tiêu học tập cụ thể, thực tế, hấp dẫn và cá nhân hóa cao cho người học này. KHÔNG ĐƯỢC trả về những chủ đề không liên quan đến lĩnh vực ${domainId} của họ.
Ví dụ: nếu họ chọn Lập trình Web/IT thì KHÔNG ĐƯỢC gợi ý Python Data Science hay Marketing. Phải khớp 100% với lĩnh vực của họ!

Hãy trả về DUY NHẤT một mảng JSON thuần túy (không kèm markdown, không kèm giải thích ngoài JSON) theo cấu trúc:
[
  {
    "label": "Tên ngắn gọn của mục tiêu (dưới 35 ký tự)",
    "prompt": "Câu phát biểu mục tiêu chi tiết của người học (Tôi muốn học... để... trong 3 tháng)",
    "outcome": "job" | "project" | "switch_career" | "advance",
    "level": "beginner" | "intermediate" | "experienced"
  }
]`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
      });

      const responseText = response.text || "";
      // Làm sạch markdown json nếu có
      const cleanJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return NextResponse.json({ suggestions: parsed, source: "gemini_ai" });
      }
    } catch (aiErr) {
      console.warn("Gemini suggest API fallback triggered:", aiErr);
    }

    // Fallback nếu Gemini API bận
    const fallback = DOMAIN_FALLBACK_SUGGESTIONS[domainId] || DOMAIN_FALLBACK_SUGGESTIONS.it_dev;
    return NextResponse.json({ suggestions: fallback, source: "curated_fallback" });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
