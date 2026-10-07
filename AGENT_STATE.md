# LearnVerse 3D AI Learning Platform - Agent State

## Design Reference
Image: `Design/Bảng thiết kế LearnVerse đa màn hình.png`
Workflow: **Login → Onboarding → Dashboard → Create Goal → AI Roadmap → Lesson**
Rule: **Làm xong màn nào thì báo user kiểm tra rồi mới làm tiếp!**

---

## Progress Overview

- [x] **Phase 0: Foundation & Setup**
  - [x] Next.js 16+ TypeScript setup
  - [x] Tailwind CSS + shadcn/ui configured
  - [x] Core packages installed (@supabase/ssr, lucide-react, sonner, etc.)
  - [x] Project folder structure mapped
  - [x] Supabase client/server/middleware configured with provided credentials
  - [x] `.env.local` configured with Supabase URL & Key

- [x] **Màn 1: Đăng nhập & Đăng ký (Login / Register)** - *HOÀN THÀNH*
  - [x] Trang Login (`/login`) bám sát 100% thiết kế Screen 2 trong ảnh mẫu
  - [x] Trang Register (`/register`) đồng bộ phong cách và luồng đăng ký
  - [x] Cột trái: Logo LearnVerse, Social Auth (Google, GitHub), form Email/Password, Ghi nhớ, Quên mật khẩu, nút Submit gradient
  - [x] Cột phải: Visual vũ trụ 3D Fantasy Learning và trích dẫn William Butler Yeats
  - [x] Tích hợp Supabase Auth (Email + OAuth callback route)
  - [x] Sửa đường dẫn callback thành `/auth/callback`

- [x] **Màn 2: Onboarding & Khảo sát trình độ ban đầu (`/onboarding`)** - *ĐÃ TÁI CẤU TRÚC HOÀN TOÀN THEO YÊU CẦU*
  - [x] **Luồng chuẩn 4 bước bắt đầu từ Bước 1/4**:
    - **Bước 1/4: Chọn lĩnh vực học tập**: Hỗ trợ đa ngành nghề (CNTT & Lập trình, Khoa học Dữ liệu & AI, Thiết kế UI/UX, Marketing & Kinh doanh số, Ngoại ngữ & Giao tiếp, Quản trị dự án & Kỹ năng mềm) cùng các chủ đề con chi tiết.
    - **Bước 2/4: Kiểm tra trình độ ban đầu**: Bộ câu hỏi trắc nghiệm tương thích theo từng lĩnh vực (Adaptive Testing), chuẩn 100% phong cách Screen 3 (card trắng tinh tế, badge "Câu X/Y", lựa chọn A, B, C, D active tím gradient, nút điều hướng).
    - **Bước 3/4: Mục tiêu & Cam kết thời gian**: Lựa chọn đích đến (Đi làm, làm đồ án/dự án, chuyển ngành, nâng cao chuyên môn) và thời gian học mỗi ngày (15-30p, 45-60p, 1-2h, 2h+).
    - **Bước 4/4: AI Phân tích & Khởi tạo lộ trình**: Đánh giá năng lực tổng quan, thời lượng, số mốc milestone 3D và bài học thực chiến.
  - [x] **Bạn đồng hành 3D: Cậu bé Học sinh Thám hiểm (Lựa chọn 1 đã chọn)**:
    - Trả về đúng nhân vật Cậu bé Học sinh Thám hiểm Pixar đeo ba lô vẫy tay chào mà bạn đã chọn (đồng bộ với Màn 1 & Màn 10).
    - **Tách nền trong suốt 100%**: Loại bỏ hoàn toàn viền xám và khung chữ nhật, nhân vật đứng tự nhiên trong không gian WebGL với bóng đổ mềm dưới sàn và bụi sao XP lơ lửng.
    - **Chuyển động sinh động (Không còn cứng đơ)**: Nhịp thở nhấp nhô (breathing physics), cánh tay vẫy nhẹ nhàng, toàn thân nghiêng xoay theo góc nhìn 3D dõi theo chuột.
    - **Tương tác click**: Khi click vào, cậu bé nhún nhảy vui vẻ ("👋🎒"), phát âm thanh bíp bíp chime synth và hiển thị lời thoại động viên.
  - [x] Đã build thành công và kiểm tra máy chủ `http://localhost:3000/onboarding` (HTTP 200 OK).

- [x] **Màn 3: Dashboard (Sau khi đăng nhập - `/dashboard`)** - *ĐÃ NÂNG CẤP TOÀN DIỆN THEO SKILL FRONTEND-DESIGN & REACT-BEST-PRACTICES*
  - [x] **Thẩm mỹ Cosmic Luxury (`frontend-design` Skill)**:
    - Loại bỏ giao diện hộp trắng SaaS đơn điệu, chuyển sang Canvas vũ trụ sang trọng `#090d16` đồng bộ với Sidebar Dark Navy.
    - Màu nhấn có chủ đích: Luminous Indigo (`#6366f1`), Electric Violet (`#a855f7`), Cyber Cyan (`#06b6d4`), Emerald (`#10b981`).
  - [x] **Thanh Chọn Môn Học Đa Năng (`SubjectSwitcherBar.tsx`)**:
    - Hỗ trợ học viên theo học **nhiều môn song song** (VD: `[ 💻 Lập trình Web ]`, `[ 📘 Tiếng Anh lớp 2 ]`, `[ 📐 Toán lớp 2 ]`, `[ ➕ Thêm môn mới ]`).
    - Chuyển đổi môn học chỉ với **1 cú click**, ngay lập tức đồng bộ lại Mục tiêu, Cột mốc 3D và Bài học của riêng môn đó.
  - [x] **Tâm điểm thị giác - Thẻ Hành trình Odyssey (`HeroQuestCard.tsx`)**:
    - Mục tiêu thực chiến + Bộ Stepper Milestone co giãn động theo số chặng (glowing step dots + tooltip chi tiết bài học từng tuần).
    - Thanh điều hướng tích hợp: nút **"Bắt đầu học ngay 🚀"**, **"Chi tiết lộ trình"** (`/roadmap`) và **"+ Đổi mục tiêu"** (`/create-goal`).
    - **Cổng vũ trụ Đảo Tri Thức 3D Live (`Interactive3DWorldPreview.tsx`)**: Đảo bay thần thoại 3D tinh tế, hạt bụi sao stardust, cố định êm dịu không nhảy xóc.
  - [x] **Bộ 4 thẻ thống kê trực quan (`DailyProgressStats.tsx`)**:
    - Thời gian hôm nay (0/45p), Chuỗi ngọn lửa Streak động, Thanh XP tiến lên Cấp kế tiếp, Nhiệm vụ hàng ngày (+25 XP).
  - [x] **Tổ chức Khóa học khoa học & Siêu gọn gàng (`MyCoursesSection.tsx`)**:
    - **3 chế độ xem linh hoạt (View Switcher)**:
      1. **🎯 Chế độ Đang học (Focus View - Mặc định)**: Chỉ làm nổi bật 1 chặng học duy nhất đang cần hoàn thành, kèm danh sách các chặng tiếp theo thu gọn dạng mini-tags bên dưới. Loại bỏ 100% cảm giác tràn lan, ngợp mắt.
      2. **📜 Chế độ Lộ trình (Timeline View)**: Chuỗi tiến trình tuần tự thu gọn (Chặng 1 -> Chặng 2 -> Chặng 3...) chiếm diện tích cực kỳ tiết kiệm.
      3. **🗂️ Chế độ Dạng thẻ (Grid View)**: Giới hạn hiển thị tối đa 3 thẻ, có nút "Xem thêm / Thu gọn" tránh kéo dài trang.
  - [x] **Tối ưu hóa hiệu năng (`react-best-practices` Vercel Skill)**:
    - Tách dynamic import (`next/dynamic`) cho WebGL canvas, tránh blocking waterfall rendering.
    - Đồng bộ Data thời gian thực với Supabase Auth (`linhsamiu`, Level, XP, Streak).

- [x] **Màn 4: Tạo chủ đề học & mục tiêu (`/create-goal`, Screen 5 trong thiết kế)** - *ĐÃ ĐỒNG BỘ 100% VỚI KHẢO SÁT, HỖ TRỢ K-12 & GEMINI AI*
  - [x] **Mở rộng kho Lĩnh vực & Cấp lớp Phổ thông (K-12 & STEM)**:
    - Bổ sung `k12_school` (Toán, Tiếng Anh, Tiếng Việt/Khoa học lớp 1-12) và `stem_kids` (Robotics, Lập trình Scratch, Toán tư duy Kangaroo).
    - Bổ sung Mục tiêu đầu ra: `Bám sát SGK & Đạt điểm cao (Điểm 9-10)`, `Luyện thi Học sinh giỏi & Chứng chỉ`.
  - [x] **Đồng bộ tự động theo hồ sơ người dùng (Không còn hardcode)**:
    - Đọc dữ liệu từ `onboarding` và `userProfile`: tự động điền đúng lĩnh vực đã chọn (VD: Lập trình Web `it_dev`), trình độ xuất phát và cam kết thời gian.
    - Banner "Đã đồng bộ từ khảo sát ban đầu" hiển thị thông tin thực tế của học viên.
  - [x] **Chủ đề gợi ý động phân tách theo từng Lĩnh vực (Domain-Specific)**:
    - Gợi ý riêng cho từng ngành (Lập trình & IT, Dữ liệu & AI, UI/UX Design, Ngoại ngữ IT, Marketing, Quản trị Agile).
    - Có thanh chuyển đổi Lĩnh vực (Domain Switcher) linh hoạt nếu muốn học thêm lĩnh vực mới.
  - [x] **Tích hợp Google Gemini Live Suggestions (`/api/ai/suggest-goals`)**:
    - Nút "✨ AI gợi ý theo năng lực" kết nối trực tiếp với Google Gemini để phân tích hồ sơ và đưa ra 3 đề xuất mục tiêu chuyên sâu, sát thực tế.

- [x] **Màn 5: Xem trước Lộ trình học AI tạo ra (`/roadmap`, Screen 6 trong thiết kế)** - *HOÀN THÀNH*
  - [x] **API Sinh lộ trình tự động với Google Gemini (`/api/ai/generate-roadmap`)**:
    - Nhận diện toàn bộ thông số từ bước Tạo mục tiêu: Chủ đề, Lĩnh vực, Trình độ ban đầu, Mục tiêu đầu ra (đi làm/đồ án/chuyển ngành/thăng tiến), Thời lượng và Cam kết học mỗi ngày.
    - Gemini AI thiết kế chi tiết từng chặng (Milestones/Tuần), danh sách bài học cụ thể (thời lượng, phân loại lý thuyết/thực hành/đồ án mini) và các bài quiz kiểm tra năng lực.
  - [x] **Giao diện Xem trước Lộ trình chuẩn Cosmic Luxury (`app/(dashboard)/roadmap/page.tsx`)**:
    - **Header Hero**: Tên lộ trình chuyên nghiệp, tóm tắt triết lý học tập, 4 thẻ chỉ số (Thời gian, Vị trí đạt được, Tổng số bài học, Bài kiểm tra đánh giá), dải Skill Pills đạt được.
    - **Danh sách Chặng học tuần tự (Milestones Accordion)**: Cho phép mở xem chi tiết từng bài học, thời lượng dự kiến, nhãn bài học và quiz đánh giá.
    - **Sidebar Cố vấn AI**: Lời khuyên từ Mentor AI đồng hành và nút CTA chính **"Lưu & Bắt đầu học 🚀"**.
  - [x] **Lưu lộ trình vào hệ thống (`applyAiRoadmap`)**:
    - Nhấn "Lưu & Bắt đầu học 🚀" sẽ cập nhật mục tiêu mới, kiến tạo danh sách khóa học thực tế trên Dashboard, đồng bộ lên Supabase Cloud và bắt đầu tính tiến độ từ 0%.

  - [x] **Lựa chọn Đích đến & Trình độ hiện tại**: Đi làm ngay, Làm dự án/Portfolio, Chuyển ngành, Nâng cao chuyên sâu; kèm 3 mức độ xuất phát (Người mới, Cơ bản, Đã có kinh nghiệm).
  - [x] **Cam kết thời gian & Tốc độ hoàn thành**: 15-30p, 45-60p, 1-2h, 2h+/ngày; dự kiến hoàn thành 1 tháng, 3 tháng hoặc 6 tháng.
  - [x] **Thẻ tổng kết xác nhận & Nút kích hoạt AI**: Đánh giá dự kiến số tuần, số mốc Milestone, bài học và bài test trước khi chuyển tiếp sang Màn 5 (Roadmap Preview).
  - [x] **Khu vực "AI sẽ giúp bạn như thế nào?"**: 5 thẻ năng lực AI trực quan (Phân tích mục tiêu, Tạo lộ trình, Chia module, Đề xuất bài học & test, Theo dõi & thích ứng).

- [x] **Màn 5: AI tạo & Xem trước lộ trình học (`/roadmap`, Screen 6 trong thiết kế)** - *HOÀN THÀNH*
- [x] **Màn 6: Chi tiết khóa học, Trải nghiệm bài học & Trắc nghiệm (`/lesson`, Screen 7, 8, 9)** - *HOÀN THÀNH*
  - [x] **Screen 7 - Chi tiết khóa học & Trình phát bài học (`/lesson`)**:
    - **Cột trái (Lesson Sidebar)**: Header khóa học kèm thanh % hoàn thành, ô tìm kiếm bài học, Accordion mở rộng từng chương, phân loại rõ ràng bài đã học (xanh lá), bài đang học (xanh dương sáng active), bài thực hành và bài quiz.
    - **Cột giữa (Video Player Section)**: Video player tỉ lệ 16:9 với hiệu ứng Cosmic Dark luxury, thanh tiến độ thời gian nhấp chọn được, nút Play/Pause lớn, nút chuyển chế độ "Rạp chiếu / Tập trung" (Cinema Mode), hệ thống 4 Tabs: *Bài học*, *Mã nguồn thực hành*, *Ghi chú cá nhân* (tự lưu), *Thảo luận cộng đồng*.
    - **Cột phải (Lesson Right Panel)**: Tóm tắt nội dung trọng tâm bài học (bullet points xanh lá), danh sách tài liệu tải về (Slide PDF, Source code ZIP), và tích hợp **AI Tutor trực tiếp** (kết nối Google Gemini 2.5 giải đáp thắc mắc và gợi ý code theo thời gian thực).
    - **Thanh điều hướng dưới**: Nút "Đánh dấu hoàn thành" (+20 XP, lưu tiến độ vào Store & Supabase) và nút "Bài tiếp theo ➔" (Gradient tím).
  - [x] **Screen 8 - Làm bài trắc nghiệm (Interactive Quiz)**:
    - Top bar: Tên khóa học, tên chương, nút thoát bài kiểm tra.
    - Thanh tiến độ tím glowing + Badge "Câu X/Y" + Đồng hồ đếm ngược thời gian thực (⏱️ 14:25).
    - Thẻ câu hỏi trắc nghiệm với 4 lựa chọn A, B, C, D phong cách card nổi bật, nút "Đánh dấu" câu hỏi, nút "Câu trước" / "Câu tiếp theo" / "Nộp bài kiểm tra 🏁".
  - [x] **Công cụ AI Biên soạn Động (Dynamic Lesson Generator - `/api/ai/generate-lesson-content`)**:
    - Xóa bỏ 100% cảm giác hardcode: Với bất kỳ môn học hay chặng nào do học viên tự chọn (Toán, Tiếng Anh K-12, Python, Web, hay bất kỳ chủ đề custom nào), Gemini AI sẽ trực tiếp biên soạn bài giảng chi tiết (300-600 từ), gạch đầu dòng cốt lõi, ví dụ code/thực hành, và bộ câu hỏi trắc nghiệm kiểm tra sát theo bài học đó.
    - Nút **"✨ AI Biên soạn"** ngay trên thanh điều hướng cho phép học viên yêu cầu AI cập nhật/đào sâu bài giảng theo nhu cầu.
  - [x] **Động cơ Quét Tài liệu Học tập NotebookLM (`/api/ai/scan-document` & `DocumentScannerModal.tsx`)**:
    - Cho phép học viên **tải file lên (PDF, TXT, Markdown) hoặc dán trực tiếp giáo trình/ghi chú bài giảng**.
    - Gemini AI đóng vai trò như **Google NotebookLM**: quét toàn bộ nội dung tài liệu, tự động phân tích cấu trúc, chia thành các Chương (Chapters) và Bài học (Lessons), viết nội dung bài giảng và tạo bộ câu hỏi trắc nghiệm đúc kết từ chính tài liệu đó.
    - Khóa học sinh ra từ tài liệu được tự động lưu vào hệ thống và chuyển ngay sang giao diện học tập `/lesson` để bắt đầu học.
    - Tích hợp nút **"Quét tài liệu (NotebookLM)"** tiện lợi ở cả 3 nơi: Màn hình bài học (`/lesson`), Bảng điều khiển (`/dashboard`), và Màn hình tạo mục tiêu (`/create-goal`).
- [ ] **Màn 7: Thế giới học tập 3D (Screen 10)**

---

## Đợt Fix & Cải tiến (07/10/2026) — theo feedback test thực tế của user

- [x] **Loa phát âm tiếng Anh chuẩn (không còn đọc lẫn Anh-Việt)**
  - [x] `app/api/ai/generate-lesson-content/route.ts`: prompt bắt AI trả thêm trường `audioExamples[]` — mỗi mục có `english` CHỈ chứa tiếng Anh thuần túy (cấm lẫn tiếng Việt/phiên âm/ngoặc), `vietnamese` chỉ để hiển thị
  - [x] `lib/data/lessonCatalog.ts`: thêm type `AudioExample` + field `audioExamples?` vào `LessonItem`
  - [x] `app/lesson/page.tsx`: truyền `audioExamples` khi enrich bài học từ AI
  - [x] `components/lesson/VideoPlayerSection.tsx`: thêm section "Luyện phát âm chuẩn bản xứ" render từ `audioExamples`, nút loa đọc thẳng chuỗi tiếng Anh thuần (không cần bóc tách), có nút "Phát tất cả"
  - [x] `components/lesson/EnglishSpeechPlayer.tsx`: viết lại `extractCleanEnglish` — xử lý đúng các mẫu `1 - One /wʌn/ - Số một` → "One", `"How old are you?" — "Bạn bao nhiêu tuổi?"` → "How old are you?", `'Seven'` → "Seven"; KHÔNG BAO GIỜ trả về chuỗi lẫn tiếng Việt (trả "" + toast cảnh báo thay vì đọc bừa)
- [x] **Bài học AI sinh ra chi tiết hơn (không còn sơ sài)**
  - [x] Prompt yêu cầu tối thiểu 800-1200 từ, đủ 6 mục (Khái niệm, Kiến thức trọng tâm, 4-6 ví dụ thực tế, Bẫy lỗi, Bài tập mini có đáp án, Mẹo ghi nhớ), tối thiểu 6 summaryPoints + 5 quiz có giải thích chi tiết
- [x] **Tăng cỡ chữ giao diện cho dễ đọc**
  - [x] `VideoPlayerSection`: nội dung bài giảng `text-xs/sm` → `text-sm/base`, leading-loose; tiêu đề H1/H2/H3 tăng 1 nấc; quiz, ghi chú, thảo luận tăng cỡ chữ
  - [x] `QuizModalOrView`: đáp án trắc nghiệm + giải thích chi tiết tăng lên `text-sm/base`
  - [x] `LessonRightPanel`: tóm tắt, tài liệu, chat AI Tutor tăng lên `text-sm`
  - [x] `EnglishSpeechPlayer`: câu hội thoại tiếng Anh tăng lên `text-sm/base`
  - [x] Typecheck `tsc --noEmit` PASS, test `extractCleanEnglish` với 8 mẫu câu lẫn lộn PASS

---

## Configuration Details
- **Supabase Project**: `https://gxnxmgmfuwdfhdfhzkxf.supabase.co` (Đã cấu hình)
- **Gemini API**: Hướng dẫn lấy tại `https://aistudio.google.com/app/apikey`

