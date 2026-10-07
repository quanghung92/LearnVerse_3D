import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      courseTitle = "Khóa học", 
      chapterTitle = "Chương 1", 
      lessonTitle = "Bài học", 
      domainId = "it_dev",
      lessonType = "video"
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `Bạn là Chuyên gia Giảng dạy & Biên soạn Giáo trình AI của nền tảng LearnVerse 3D.
Hãy tạo nội dung bài học THỰC SỰ CHUYÊN SÂU, THỰC CHIẾN và CỰC KỲ DỄ HIỂU cho học viên:
- Tên khóa học: "${courseTitle}"
- Tên chương: "${chapterTitle}"
- Tên bài học: "${lessonTitle}"
- Lĩnh vực: ${domainId} (Bao gồm K-12 Phổ thông như Toán, Tiếng Anh, hoặc IT/AI/Design...)
- Hình thức bài học: ${lessonType}

Hãy biên soạn đầy đủ các phần sau và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json, không chú thích ngoài JSON):
{
  "summaryPoints": [
    "Điểm cốt lõi 1",
    "Điểm cốt lõi 2",
    "Điểm cốt lõi 3",
    "Điểm cốt lõi 4",
    "Điểm cốt lõi 5"
  ],
  "contentMarkdown": "Bài giảng chi tiết (khoảng 400 - 800 từ) được định dạng Markdown chuẩn đẹp. Bao gồm: 1. Khái niệm & Tại sao cần học, 2. Nguyên lý hoạt động / Công thức / Phương pháp giải, 3. Ví dụ minh họa thực tế sinh động, 4. Các lưu ý & bẫy lỗi thường gặp. ĐẶC BIỆT KHI DẠY TIẾNG ANH HOẶC NGOẠI NGỮ: Danh sách từ vựng/số đếm hãy liệt kê từng dòng rõ ràng (ví dụ: - 1 - One /wʌn/ - Số một), và các câu giao tiếp mẫu hãy để trong dấu trích dẫn > (ví dụ: > \"How old are you?\" - \"I am seven years old.\") để hệ thống tự động gắn nút phát âm cho học sinh bấm nghe.",
  "codeSnippet": {
    "language": "typescript" | "python" | "html" | "css" | "javascript" | "text",
    "filename": "Tên file (ví dụ: main.ts, calculator.py...)",
    "code": "Đoạn mã nguồn mẫu hoàn chỉnh hoặc bài tập thực hành (nếu là bài không liên quan đến code thì có thể là đoạn văn bản câu hỏi thực hành)"
  },
  "resources": [
    { "name": "Slide bài giảng tóm tắt (PDF)", "type": "pdf", "size": "2.4 MB" },
    { "name": "Bài tập thực hành và tài liệu tham khảo (ZIP)", "type": "zip", "size": "1.8 MB" }
  ],
  "quizzes": [
    {
      "id": "q-ai-1",
      "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài số 1",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctIndex": 1,
      "explanation": "Giải thích chi tiết vì sao đáp án B đúng và các đáp án khác chưa chính xác"
    },
    {
      "id": "q-ai-2",
      "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài số 2",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctIndex": 0,
      "explanation": "Giải thích chi tiết..."
    },
    {
      "id": "q-ai-3",
      "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài số 3",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctIndex": 2,
      "explanation": "Giải thích chi tiết..."
    }
  ]
}`;

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      responseText = response.text || "";
    } catch (e1) {
      console.warn("Thử lại với model gemini-3.8-flash:", e1);
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });
      responseText = response.text || "";
    }

    let parsedData: any = null;
    try {
      parsedData = JSON.parse(responseText.trim());
    } catch (parseErr) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsedData = JSON.parse(jsonMatch[0]);
        } catch (e) {
          try {
            const cleaned = jsonMatch[0].replace(/,\s*([\]}])/g, "$1");
            parsedData = JSON.parse(cleaned);
          } catch (e2) {
            console.warn("Không parse được JSON trực tiếp, sử dụng dữ liệu trích xuất:", e2);
            // Fallback tạo dữ liệu bài học từ phản hồi
            parsedData = {
              summaryPoints: [
                `Nội dung trọng tâm: ${lessonTitle}`,
                "Phương pháp thực hành và vận dụng kiến thức",
                "Bài tập và lưu ý thực tiễn",
              ],
              contentMarkdown: responseText.replace(/```json/gi, "").replace(/```/g, "").trim(),
              resources: [
                { name: `Tài liệu bài giảng - ${lessonTitle} (PDF)`, type: "pdf", size: "1.6 MB" },
              ],
              quizzes: [],
            };
          }
        }
      } else {
        parsedData = {
          summaryPoints: [`Kiến thức trọng tâm: ${lessonTitle}`],
          contentMarkdown: responseText.trim(),
          resources: [],
          quizzes: [],
        };
      }
    }

    return NextResponse.json({
      lessonData: parsedData,
      source: "gemini_ai",
    });
  } catch (error: any) {
    console.error("Lỗi khi sinh nội dung bài học bằng AI:", error);
    return NextResponse.json(
      { error: "Không thể tạo nội dung bài học AI", details: error?.message },
      { status: 500 }
    );
  }
}
