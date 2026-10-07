import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export async function POST(req: NextRequest) {
  try {
    const { question, lessonTitle, lessonContent, courseTitle } = await req.json();

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Thiếu câu hỏi" }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({
        answer: `Chào bạn! Tôi là AI Tutor của LearnVerse. Về câu hỏi "${question}" trong bài "${lessonTitle}":\n\nTrong bài học này, bạn cần lưu ý nắm chắc các khái niệm trọng tâm được liệt kê trong mục "Nội dung bài học" và thực hành trực tiếp theo code mẫu. Hãy thử chạy thử lệnh trong terminal hoặc xem lại video ở mốc thời gian liên quan nhé!`,
        source: "fallback",
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `Bạn là Trợ lý Gia sư AI (AI Tutor) thân thiện, am hiểu sâu sắc và tận tâm của nền tảng học tập LearnVerse 3D.
Hiện tại học viên đang học:
- Khóa học: ${courseTitle || "Khóa học"}
- Bài học: ${lessonTitle || "Bài học"}
- Nội dung tóm tắt bài học: ${lessonContent || "Kiến thức bài học"}

Học viên vừa đặt câu hỏi:
"${question}"

Hướng dẫn trả lời:
1. Trả lời trực tiếp, rõ ràng, dễ hiểu, bằng tiếng Việt.
2. Nếu là câu hỏi về lập trình, hãy cung cấp ví dụ code ngắn gọn, chuẩn sạch (clean code).
3. Đưa ra mẹo thực tế (pro-tip) hoặc cảnh báo lỗi thường gặp liên quan đến câu hỏi.
4. Giữ giọng văn thân thiện, động viên học viên tiếp tục hoàn thành bài học.
5. Định dạng Markdown đẹp mắt với bullet points, bold và code blocks.`;

    let answer = "";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash-lite",
        contents: systemPrompt,
      });
      answer = response.text || "Tôi chưa thể trả lời câu hỏi này lúc này. Bạn vui lòng thử lại nhé!";
    } catch (e1) {
      console.warn("Thử lại với model gemini-3.8-flash:", e1);
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: systemPrompt,
      });
      answer = response.text || "Tôi chưa thể trả lời câu hỏi này lúc này. Bạn vui lòng thử lại nhé!";
    }

    return NextResponse.json({
      answer,
      source: "gemini_ai",
    });
  } catch (error: any) {
    console.error("Lỗi AI Tutor:", error);
    return NextResponse.json({
      answer: "AI Tutor đang xử lý nhiều yêu cầu cùng lúc. Bạn có thể xem lại tóm tắt nội dung bài học ở cột bên phải hoặc thử hỏi lại sau giây lát nhé!",
      source: "error_fallback",
    });
  }
}
