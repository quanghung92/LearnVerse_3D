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

    const isEnglishLesson = /english|tiếng anh|ngoại ngữ|german|french|japanese|korean|chinese/i.test(`${courseTitle} ${chapterTitle} ${lessonTitle} ${domainId}`);

    const prompt = `Bạn là Chuyên gia Giảng dạy & Biên soạn Giáo trình AI của nền tảng LearnVerse 3D.
Hãy tạo nội dung bài học THỰC SỰ CHUYÊN SÂU, CHI TIẾT, THỰC CHIẾN và CỰC KỲ DỄ HIỂU cho học viên:
- Tên khóa học: "${courseTitle}"
- Tên chương: "${chapterTitle}"
- Tên bài học: "${lessonTitle}"
- Lĩnh vực: ${domainId} (Bao gồm K-12 Phổ thông như Toán, Tiếng Anh, hoặc IT/AI/Design...)
- Hình thức bài học: ${lessonType}

YÊU CẦU CHẤT LƯỢNG NỘI DUNG (BẮT BUỘC - bài học sơ sài sẽ bị từ chối):
- Bài giảng PHẢI DÀI và CHI TIẾT (tối thiểu 800-1200 từ cho bài lý thuyết, không được viết qua loa vài đoạn ngắn).
- Cấu trúc bài giảng bắt buộc gồm đủ các mục, mỗi mục có nội dung thực chất:
  1. **Khái niệm & Tại sao cần học**: giải thích tường tận, liên hệ đời sống thực tế của học viên.
  2. **Kiến thức trọng tâm**: chia nhỏ thành từng ý, mỗi ý giải thích kỹ kèm lý do.
  3. **Ví dụ minh họa sinh động**: TỐI THIỂU 4-6 ví dụ cụ thể, gần gũi, có tình huống thực tế (không ví dụ chung chung 1 dòng).
  4. **Lưu ý & Bẫy lỗi thường gặp**: liệt kê các nhầm lẫn phổ biến, giải thích TẠI SAO sai và cách sửa đúng.
  5. **Bài tập vận dụng mini**: 2-3 bài tập có đáp án và lời giải ngắn để học viên tự kiểm tra ngay.
  6. **Mẹo ghi nhớ**: mẹo, câu thần chú hoặc sơ đồ tư duy giúp nhớ lâu.
- Dùng Markdown đẹp: tiêu đề ##, ###, **in đậm** từ khóa, danh sách gạch đầu dòng, bảng so sánh khi phù hợp.
- summaryPoints: TỐI THIỂU 6 điểm cốt lõi, mỗi điểm là một câu hoàn chỉnh, cụ thể (không chung chung).
- quizzes: TỐI THIỂU 5 câu trắc nghiệm phủ đều các phần của bài, mỗi câu có explanation giải thích TẠI SAO đáp án đúng và tại sao các đáp án khác sai.
${isEnglishLesson ? `
ĐẶC BIỆT CHO BÀI HỌC TIẾNG ANH / NGOẠI NGỮ (BẮT BUỘC):
- Trong contentMarkdown: danh sách từ vựng liệt kê từng dòng rõ ràng (ví dụ: - **One** /wʌn/ - Số một), câu giao tiếp mẫu đặt trong dấu trích dẫn > kèm nghĩa tiếng Việt (ví dụ: > "How old are you?" — "Bạn bao nhiêu tuổi?").
- BẮT BUỘC trả thêm trường "audioExamples": mảng các mục luyện nghe, MỖI MỤC có đúng 3 trường:
  - "label": nhãn ngắn gọn (ví dụ: "Từ vựng: Số đếm", "Câu giao tiếp mẫu 1")
  - "english": CHỈ CHỨA TIẾNG ANH THUẦN TÚY để máy đọc phát âm — TUYỆT ĐỐI KHÔNG lẫn tiếng Việt, KHÔNG phiên âm /.../, KHÔNG ngoặc đơn, KHÔNG số thứ tự, KHÔNG ký tự đặc biệt. Ví dụ đúng: "How old are you?" / "One, two, three, four, five". Ví dụ SAI: "One /wʌn/ (Số một)".
  - "vietnamese": nghĩa tiếng Việt tương ứng (chỉ để hiển thị, không đọc).
- Tạo TỐI THIỂU 8-12 mục audioExamples: bao phủ toàn bộ từ vựng + câu mẫu quan trọng trong bài. Mỗi câu/từ vựng chỉ xuất hiện 1 lần, không trùng lặp.
` : `
- Trả thêm trường "audioExamples": [] (mảng rỗng vì đây không phải bài ngoại ngữ).
`}
Hãy biên soạn đầy đủ các phần sau và trả về DUY NHẤT một chuỗi JSON hợp lệ (không kèm markdown \`\`\`json, không chú thích ngoài JSON):
{
  "summaryPoints": [
    "Điểm cốt lõi 1 (câu hoàn chỉnh, cụ thể)",
    "Điểm cốt lõi 2",
    "Điểm cốt lõi 3",
    "Điểm cốt lõi 4",
    "Điểm cốt lõi 5",
    "Điểm cốt lõi 6"
  ],
  "contentMarkdown": "Bài giảng chi tiết tối thiểu 800-1200 từ, Markdown chuẩn đẹp, đủ 6 mục: Khái niệm & Tại sao, Kiến thức trọng tâm, Ví dụ minh họa (4-6 ví dụ), Lưu ý & Bẫy lỗi, Bài tập vận dụng mini có đáp án, Mẹo ghi nhớ.",
  "audioExamples": [
    { "label": "Từ vựng: Số đếm", "english": "One, two, three", "vietnamese": "Một, hai, ba" },
    { "label": "Câu giao tiếp mẫu 1", "english": "How old are you?", "vietnamese": "Bạn bao nhiêu tuổi?" }
  ],
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
      "explanation": "Giải thích chi tiết vì sao đáp án A đúng và các đáp án khác chưa chính xác"
    },
    {
      "id": "q-ai-3",
      "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài số 3",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctIndex": 2,
      "explanation": "Giải thích chi tiết vì sao đáp án C đúng và các đáp án khác chưa chính xác"
    },
    {
      "id": "q-ai-4",
      "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài số 4",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctIndex": 3,
      "explanation": "Giải thích chi tiết vì sao đáp án D đúng và các đáp án khác chưa chính xác"
    },
    {
      "id": "q-ai-5",
      "question": "Câu hỏi trắc nghiệm kiểm tra độ hiểu bài số 5",
      "options": ["Lựa chọn A", "Lựa chọn B", "Lựa chọn C", "Lựa chọn D"],
      "correctIndex": 1,
      "explanation": "Giải thích chi tiết vì sao đáp án B đúng và các đáp án khác chưa chính xác"
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
