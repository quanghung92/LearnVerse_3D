import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      documentText, 
      fileBase64, 
      mimeType = "text/plain", 
      fileName = "Tài liệu học tập", 
      domainId = "it_dev" 
    } = body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Chưa cấu hình GEMINI_API_KEY" }, { status: 500 });
    }

    if (!documentText && !fileBase64) {
      return NextResponse.json({ error: "Vui lòng cung cấp văn bản hoặc file tài liệu" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `Bạn là Trí tuệ Nhân tạo cao cấp tương tự Google NotebookLM của nền tảng học tập cá nhân hóa LearnVerse 3D.
Nhiệm vụ của bạn:
1. Đọc và quét sâu sắc toàn bộ tài liệu học tập được đính kèm/cung cấp.
2. Trích xuất kiến thức trọng tâm, sơ đồ hóa thành một KHÓA HỌC THỰC TẾ hoàn chỉnh gồm từ 2 đến 4 Chương (Chapters), mỗi chương có từ 2 đến 4 Bài học (Lessons).
3. Với MỖI bài học, hãy tạo nội dung học tập thực sự chi tiết, chất lượng cao:
   - "title": Tên bài học rõ ràng, hấp dẫn
   - "duration": Thời lượng ước tính (ví dụ: "15:00")
   - "type": "theory" | "practice" | "video" | "quiz"
   - "summaryPoints": 4 đến 6 ý trọng tâm cốt lõi được rút ra trực tiếp từ tài liệu
   - "contentMarkdown": Bài giảng chi tiết từ 300 đến 600 từ giải thích rõ ràng khái niệm, công thức, ví dụ minh họa hoặc hướng dẫn từng bước dựa trên tài liệu
   - "codeSnippet": Nếu tài liệu về lập trình/công nghệ, hãy cung cấp mã nguồn mẫu chuẩn sạch kèm tên file. Nếu không phải lập trình, có thể để null
   - "quizzes": 3 đến 5 câu hỏi trắc nghiệm kiểm tra độ hiểu bài được trích xuất từ tài liệu, mỗi câu có 4 phương án, correctIndex (0-3) và explanation giải thích vì sao đúng

BẮT BUỘC TRẢ VỀ DUY NHẤT một đối tượng JSON hợp lệ (không kèm markdown \`\`\`json, không chú thích ngoài JSON) theo đúng định dạng:
{
  "courseId": "doc-course-${Date.now()}",
  "title": "Tên khóa học đúc kết từ tài liệu (ngắn gọn, dưới 60 ký tự)",
  "overview": "Tóm tắt ngắn 2-3 câu về nội dung và giá trị của tài liệu",
  "progressPercent": 0,
  "chapters": [
    {
      "id": "ch-1",
      "title": "Tên Chương 1",
      "lessons": [
        {
          "id": "doc-l-1-1",
          "chapterId": "ch-1",
          "title": "1.1 Tên bài học",
          "duration": "12:00",
          "videoDurationSeconds": 720,
          "type": "video",
          "completed": false,
          "summaryPoints": ["Ý trọng tâm 1", "Ý trọng tâm 2", "Ý trọng tâm 3", "Ý trọng tâm 4"],
          "resources": [
            { "name": "Bản tóm tắt bài học trích xuất từ tài liệu (PDF)", "type": "pdf", "size": "1.5 MB" }
          ],
          "contentMarkdown": "### Nội dung bài giảng...",
          "codeSnippet": null,
          "quizzes": [
            {
              "id": "q-1-1",
              "question": "Câu hỏi trắc nghiệm...",
              "options": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
              "correctIndex": 1,
              "explanation": "Giải thích chi tiết..."
            }
          ]
        }
      ]
    }
  ]
}`;

    // Chuẩn bị nội dung gửi cho Gemini
    let contentsPayload: any[] = [];

    if (fileBase64 && mimeType === "application/pdf") {
      // Gemini xử lý file PDF trực tiếp bằng base64
      contentsPayload = [
        {
          inlineData: {
            mimeType: "application/pdf",
            data: fileBase64,
          },
        },
        {
          text: `${systemInstruction}\nTên tài liệu: "${fileName}". Hãy quét tài liệu PDF này và tạo khóa học chi tiết.`,
        },
      ];
    } else {
      // Xử lý text / markdown / trích xuất
      const textToAnalyze = documentText || "";
      contentsPayload = [
        {
          text: `${systemInstruction}\nTên tài liệu: "${fileName}"\n\nNỘI DUNG TÀI LIỆU CẦN QUÉT:\n"""\n${textToAnalyze.slice(0, 50000)}\n"""`,
        },
      ];
    }

    let responseText = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: contentsPayload,
      });
      responseText = response.text || "";
    } catch (e1) {
      console.warn("Thử lại với model gemini-3.8-flash:", e1);
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: contentsPayload,
      });
      responseText = response.text || "";
    }

    const cleanJson = responseText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsedCourse = JSON.parse(cleanJson);

    if (!parsedCourse.title || !Array.isArray(parsedCourse.chapters)) {
      throw new Error("Dữ liệu khóa học từ AI không đúng định dạng");
    }

    return NextResponse.json({
      course: parsedCourse,
      source: "notebooklm_ai",
    });
  } catch (error: any) {
    console.error("Lỗi khi quét tài liệu NotebookLM:", error);
    return NextResponse.json(
      { 
        error: "Không thể quét tài liệu để tạo bài học. Vui lòng thử lại hoặc giảm dung lượng tài liệu.", 
        details: error?.message 
      },
      { status: 500 }
    );
  }
}
