import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { DOMAIN_CURRICULA } from "@/lib/data/curriculumCatalog";
import { DomainId } from "@/types/learning";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      topic = "Lập trình Web Fullstack",
      domain = "it_dev",
      outcome = "job",
      level = "beginner",
      commitment = "45m",
      duration = "3 tháng",
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });

        const prompt = `Bạn là Giám đốc Học thuật kiêm Chuyên gia AI của nền tảng LearnVerse 3D.
Hãy thiết kế một LỘ TRÌNH HỌC TẬP TOÀN DIỆN, THỰC CHIẾN, CHUẨN ĐẦU RA và HOÀN TOÀN CÁ NHÂN HÓA theo yêu cầu của học viên:

- Chủ đề mục tiêu: "${topic}"
- Lĩnh vực: ${domain} (Bao gồm cả các môn K-12 phổ thông như Toán lớp 1-12, Tiếng Anh tiểu học/phổ thông, Khoa học, STEM lẫn các kỹ năng công nghệ/nghề nghiệp)
- Kết quả mong muốn: ${outcome} (school_high = bám sát SGK & đạt điểm 9-10, exam = luyện thi học sinh giỏi/chứng chỉ quốc tế, job = đi làm ngay/tuyển dụng, project = hoàn thiện đồ án/sản phẩm thực tế, switch_career = chuyển ngành từ số 0, advance = nâng cao chuyên môn)
- Trình độ ban đầu: ${level} (beginner = người mới/học sinh bắt đầu, intermediate = đã có nền tảng cơ bản, experienced = nâng cao)
- Thời gian học mỗi ngày: ${commitment}
- Tổng thời lượng dự kiến: ${duration}

Hãy phân tích và thiết kế lộ trình gồm ĐÚNG 4 đến 6 giai đoạn (Milestones/Chặng học), trải dài theo tuần.
Đối với mỗi giai đoạn, hãy đưa ra danh sách các bài học (lessons) cụ thể (không viết chung chung) và bài quiz/kiểm tra đánh giá năng lực.

BẮT BUỘC trả về ĐÚNG DUY NHẤT một chuỗi JSON thuần túy (không bọc trong \`\`\`json, không chú thích ngoài JSON) theo đúng cấu trúc sau:
{
  "title": "Tên lộ trình chuyên nghiệp (ví dụ: Chinh phục Fullstack Next.js & TypeScript Thực chiến)",
  "targetRole": "Vị trí công việc hoặc danh xưng đạt được sau khi học xong",
  "totalWeeks": 12,
  "totalLessons": 36,
  "totalQuizzes": 8,
  "skills": ["Kỹ năng 1", "Kỹ năng 2", "Kỹ năng 3", "Kỹ năng 4", "Kỹ năng 5", "Kỹ năng 6"],
  "summary": "Mô tả ngắn gọn 2-3 câu về triết lý và kết quả đạt được của lộ trình này",
  "milestones": [
    {
      "id": "m1",
      "title": "Tên chặng 1 (ví dụ: Nền tảng cốt lõi & Cấu trúc dự án)",
      "weeks": "Tuần 1-2",
      "description": "Mô tả ngắn về mục tiêu chặng này",
      "lessons": [
        { "id": "l1_1", "title": "Tên bài học cụ thể", "durationMinutes": 30, "type": "theory" },
        { "id": "l1_2", "title": "Tên bài học thực hành", "durationMinutes": 45, "type": "practice" },
        { "id": "l1_3", "title": "Xây dựng mini-project", "durationMinutes": 60, "type": "project" }
      ],
      "quizzes": [
        { "id": "q1_1", "title": "Đánh giá kiến thức nền tảng chặng 1", "questionCount": 10 }
      ]
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash-lite",
          contents: prompt,
        });

        const text = response.text || "";
        const cleanJson = text
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/i, "")
          .replace(/\s*```$/i, "")
          .trim();

        const parsed = JSON.parse(cleanJson);
        if (parsed.title && Array.isArray(parsed.milestones) && parsed.milestones.length > 0) {
          return NextResponse.json({
            roadmap: parsed,
            source: "gemini_ai",
          });
        }
      } catch (aiErr) {
        console.warn("Gemini generate roadmap API fallback triggered:", aiErr);
      }
    }

    // Fallback: Sử dụng catalog tương ứng với domain
    const validDomain = (DOMAIN_CURRICULA[domain as DomainId] ? domain : "it_dev") as DomainId;
    const curriculum = DOMAIN_CURRICULA[validDomain];
    const defaultGoal = curriculum.defaultGoal;

    const fallbackRoadmap = {
      title: `${topic} - Lộ trình Chuẩn hóa AI`,
      targetRole: defaultGoal.targetRole,
      totalWeeks: 12,
      totalLessons: defaultGoal.milestones.reduce((acc, m) => acc + m.lessonsCount, 0),
      totalQuizzes: defaultGoal.milestones.reduce((acc, m) => acc + m.quizzesCount, 0),
      skills: defaultGoal.skills,
      summary: `Lộ trình học tập toàn diện từ nền tảng đến thực chiến cho chủ đề "${topic}", thiết kế tối ưu với cam kết học ${commitment}.`,
      milestones: defaultGoal.milestones.map((m, idx) => ({
        id: m.id,
        title: m.title,
        weeks: m.weeks,
        description: `Trang bị đầy đủ kiến thức và kỹ năng thực hành cho ${m.title}`,
        lessons: Array.from({ length: Math.min(m.lessonsCount, 4) }).map((_, lIdx) => ({
          id: `${m.id}_l${lIdx + 1}`,
          title: `${m.title} - Bài ${lIdx + 1}: Thực hành chuyên sâu`,
          durationMinutes: 30 + lIdx * 10,
          type: lIdx === 3 ? "project" : lIdx % 2 === 0 ? "theory" : "practice",
        })),
        quizzes: Array.from({ length: Math.max(1, m.quizzesCount) }).map((_, qIdx) => ({
          id: `${m.id}_q${qIdx + 1}`,
          title: `Kiểm tra năng lực: ${m.title}`,
          questionCount: 10,
        })),
      })),
    };

    return NextResponse.json({
      roadmap: fallbackRoadmap,
      source: "curated_catalog",
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
