export interface LessonResource {
  name: string;
  type: "pdf" | "zip" | "link";
  size?: string;
  url?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonItem {
  id: string;
  title: string;
  chapterId: string;
  duration: string; // e.g. "12:36"
  type: "video" | "theory" | "practice" | "quiz";
  completed?: boolean;
  videoDurationSeconds: number;
  summaryPoints: string[];
  resources: LessonResource[];
  contentMarkdown: string;
  codeSnippet?: {
    language: string;
    code: string;
    filename: string;
  };
  quizzes?: QuizQuestion[];
  /** Danh sách câu/từ tiếng Anh thuần túy để gắn nút loa phát âm (do AI sinh, không lẫn tiếng Việt) */
  audioExamples?: AudioExample[];
}

export interface AudioExample {
  label: string;
  /** Chỉ chứa tiếng Anh thuần túy — nội dung máy sẽ đọc */
  english: string;
  /** Nghĩa tiếng Việt — chỉ hiển thị, không đọc */
  vietnamese: string;
}

export interface ChapterItem {
  id: string;
  title: string;
  lessons: LessonItem[];
}

export interface CourseDetail {
  courseId: string;
  title: string;
  progressPercent: number;
  chapters: ChapterItem[];
}

export const COURSE_LESSONS_CATALOG: Record<string, CourseDetail> = {
  "react-core": {
    courseId: "react-core",
    title: "React cơ bản đến nâng cao",
    progressPercent: 72,
    chapters: [
      {
        id: "c1",
        title: "Chương 1: Giới thiệu",
        lessons: [
          {
            id: "react-1-1",
            chapterId: "c1",
            title: "1.1 React là gì?",
            duration: "08:15",
            type: "video",
            videoDurationSeconds: 495,
            completed: true,
            summaryPoints: [
              "Lịch sử phát triển của React bởi Facebook",
              "Khái niệm Thư viện UI vs Framework",
              "Virtual DOM và cơ chế Reconciliation",
              "Lý do React trở thành tiêu chuẩn công nghiệp hiện nay",
            ],
            resources: [
              { name: "Slide bài học - React Overview (PDF)", type: "pdf", size: "2.4 MB" },
              { name: "Sơ đồ kiến trúc Virtual DOM (PNG)", type: "link" },
            ],
            contentMarkdown: `### 1. Giới thiệu tổng quan về React
React là thư viện JavaScript mã nguồn mở được phát triển bởi Facebook (nay là Meta) vào năm 2013, chuyên dùng để xây dựng giao diện người dùng (UI), đặc biệt là các ứng dụng web đơn trang (Single Page Application - SPA).

#### Điểm cốt lõi tạo nên sự đột phá của React:
1. **Component-Based Architecture**: Chia nhỏ giao diện thành các khối độc lập, dễ kiểm thử và tái sử dụng.
2. **Declarative UI**: Khai báo giao diện dựa trên State, React sẽ tự động cập nhật DOM tương ứng.
3. **Virtual DOM**: Tạo bản sao DOM trong bộ nhớ để tính toán sự sai khác (Diffing algorithm) và chỉ render lại những phần tử bị thay đổi.`,
          },
          {
            id: "react-1-2",
            chapterId: "c1",
            title: "1.2 Lợi ích của React",
            duration: "10:40",
            type: "video",
            videoDurationSeconds: 640,
            completed: true,
            summaryPoints: [
              "Tái sử dụng Component tối đa giữa các dự án",
              "Hệ sinh thái phong phú: Next.js, Redux, Tailwind, Vite",
              "Hỗ trợ SEO và Server-Side Rendering xuất sắc",
              "Cơ hội việc làm rộng mở hàng đầu thị trường Tech",
            ],
            resources: [
              { name: "Bảng so sánh React vs Vue vs Angular (PDF)", type: "pdf", size: "1.8 MB" },
            ],
            contentMarkdown: `### Lợi ích khi làm chủ React trong năm 2026
- **Hiệu năng vượt trội**: Nhờ cơ chế React 19 Compiler và Server Components.
- **Dễ bảo trì**: Mã nguồn có tổ chức, luồng dữ liệu 1 chiều (One-way data binding) giúp debug dễ dàng.
- **Cộng đồng khổng lồ**: Bất kỳ vấn đề nào cũng có sẵn giải pháp từ hàng triệu lập trình viên trên toàn cầu.`,
          },
          {
            id: "react-1-3",
            chapterId: "c1",
            title: "1.3 Cài đặt môi trường phát triển",
            duration: "12:36",
            type: "video",
            videoDurationSeconds: 756,
            completed: false,
            summaryPoints: [
              "Yêu cầu hệ thống và cài đặt Node.js LTS (v20+)",
              "Khởi tạo dự án siêu tốc với Vite 6 / React 19",
              "Cấu trúc thư mục chuẩn: src, assets, components",
              "Chạy ứng dụng đầu tiên trên localhost:5173",
              "Cài đặt VS Code Extensions (ESLint, Tailwind, Prettier)",
              "Xử lý các lỗi thường gặp khi cài đặt gói npm",
            ],
            resources: [
              { name: "Slide bài học (PDF)", type: "pdf", size: "3.2 MB" },
              { name: "Source code mẫu (ZIP)", type: "zip", size: "1.5 MB" },
              { name: "Cheat Sheet phím tắt VS Code (PDF)", type: "pdf", size: "1.1 MB" },
            ],
            contentMarkdown: `### Hướng dẫn cài đặt môi trường React với Vite

Để bắt đầu một dự án React hiện đại và nhanh nhất, chúng ta sử dụng **Vite** thay vì Create-React-App đã lỗi thời.

#### Bước 1: Kiểm tra phiên bản Node.js
Mở terminal và gõ:
\`\`\`bash
node -v # Yêu cầu phiên bản >= 18.0.0 (Khuyên dùng v20.x hoặc v22.x LTS)
npm -v
\`\`\`

#### Bước 2: Tạo dự án React với Vite
\`\`\`bash
npm create vite@latest my-react-app -- --template react-ts
cd my-react-app
npm install
npm run dev
\`\`\`

#### Bước 3: Cấu trúc thư mục khuyên dùng
\`\`\`txt
my-react-app/
├── src/
│   ├── components/   # Các UI Component tái sử dụng
│   ├── hooks/        # Custom Hooks
│   ├── App.tsx       # Root Component
│   └── main.tsx      # Entry point
├── public/           # Tài nguyên tĩnh
└── vite.config.ts    # Cấu hình Vite
\`\`\``,
            codeSnippet: {
              language: "tsx",
              filename: "src/App.tsx",
              code: `import { useState } from 'react';

export default function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white">
      <h1 className="text-3xl font-black text-indigo-400">Chào mừng đến với React 19!</h1>
      <p className="mt-2 text-slate-400">Môi trường phát triển đã sẵn sàng.</p>
      <button 
        onClick={() => setCount((c) => c + 1)}
        className="mt-4 px-4 py-2 bg-indigo-600 rounded-lg hover:bg-indigo-500 font-bold"
      >
        Số lần bấm: {count}
      </button>
    </div>
  );
}`,
            },
            quizzes: [
              {
                id: "q-1-3-1",
                question: "Công cụ nào hiện nay được khuyến nghị hàng đầu để khởi tạo dự án React SPA siêu tốc?",
                options: ["Create-React-App", "Vite", "Webpack CLI từ số 0", "Babel CLI"],
                correctIndex: 1,
                explanation: "Vite sử dụng native ES modules trên trình duyệt và esbuild viết bằng Go giúp khởi động dev server trong tích tắc.",
              },
              {
                id: "q-1-3-2",
                question: "Tập tin nào là điểm vào (entry point) chính kết nối React DOM với file index.html?",
                options: ["src/App.tsx", "src/main.tsx", "package.json", "vite.config.ts"],
                correctIndex: 1,
                explanation: "main.tsx (hoặc index.tsx) gọi ReactDOM.createRoot để gắn toàn bộ cây Component vào thẻ #root trong HTML.",
              },
            ],
          },
          {
            id: "react-1-4",
            chapterId: "c1",
            title: "1.4 JSX cơ bản",
            duration: "14:15",
            type: "video",
            videoDurationSeconds: 855,
            completed: false,
            summaryPoints: [
              "Cú pháp JSX: Kết hợp HTML bên trong JavaScript",
              "Quy tắc đóng thẻ và thẻ Fragment (<> ... </React.Fragment>)",
              "Nhúng biểu thức JavaScript với dấu ngoặc nhọn { }",
              "Sự khác biệt: className thay cho class, htmlFor thay cho for",
            ],
            resources: [
              { name: "JSX Cheat Sheet (PDF)", type: "pdf", size: "1.2 MB" },
            ],
            contentMarkdown: `### Tìm hiểu về cú pháp JSX trong React
JSX là viết tắt của **JavaScript XML**, cho phép lập trình viên viết các cấu trúc giống HTML trực tiếp bên trong mã JavaScript. Trình biên dịch sẽ chuyển đổi JSX thành các lời gọi hàm \`React.createElement\`.`,
          },
          {
            id: "react-1-5",
            chapterId: "c1",
            title: "1.5 Bài tập thực hành",
            duration: "20:00",
            type: "practice",
            videoDurationSeconds: 1200,
            completed: false,
            summaryPoints: [
              "Tự xây dựng một Thẻ Hồ Sơ Cá Nhân (User Profile Card)",
              "Áp dụng Tailwind CSS để căn chỉnh màu sắc và layout",
              "Hiển thị động dữ liệu người dùng qua biến JavaScript",
            ],
            resources: [
              { name: "Đề bài thực hành & Starter Code (ZIP)", type: "zip", size: "850 KB" },
            ],
            contentMarkdown: `### Bài tập thực hành: Thiết kế Profile Card
**Nhiệm vụ**: Tạo một component hiển thị Avatar, Tên, Chức danh công việc và nút "Theo dõi".`,
          },
        ],
      },
      {
        id: "c2",
        title: "Chương 2: Components & Props",
        lessons: [
          {
            id: "react-2-1",
            chapterId: "c2",
            title: "2.1 Functional Components & Props",
            duration: "15:20",
            type: "video",
            videoDurationSeconds: 920,
            completed: false,
            summaryPoints: [
              "Khái niệm Functional Component thuần túy",
              "Cách định nghĩa Props trong TypeScript (interface Props)",
              "Destructuring Props và giá trị mặc định (Default Props)",
              "Truyền dữ liệu một chiều từ component cha xuống component con",
            ],
            resources: [
              { name: "Slide Components & Props (PDF)", type: "pdf", size: "2.8 MB" },
              { name: "Source code Demo (ZIP)", type: "zip", size: "1.2 MB" },
            ],
            contentMarkdown: `### Functional Components & Props
Props (viết tắt của Properties) là cơ chế để truyền dữ liệu từ component cha xuống component con. Props là **Read-Only** (bất biến), component con tuyệt đối không được phép chỉnh sửa giá trị trực tiếp của Props.`,
          },
          {
            id: "react-2-2",
            chapterId: "c2",
            title: "2.2 Tái sử dụng Component & Children",
            duration: "11:50",
            type: "video",
            videoDurationSeconds: 710,
            completed: false,
            summaryPoints: [
              "Sử dụng prop đặc biệt `children` để tạo Modal/Card linh hoạt",
              "Tách nhỏ UI phức tạp thành các Sub-components",
              "Compound Component pattern cơ bản",
            ],
            resources: [
              { name: "Mẫu Card Container đa năng (ZIP)", type: "zip", size: "780 KB" },
            ],
            contentMarkdown: `### Tái sử dụng giao diện với prop \`children\`
Prop \`children\` cho phép bạn lồng bất kỳ nội dung nào (text, JSX, component khác) vào bên trong thẻ mở và đóng của một component.`,
          },
          {
            id: "react-2-quiz",
            chapterId: "c2",
            title: "2.3 Làm bài trắc nghiệm Chương 2",
            duration: "15:00",
            type: "quiz",
            videoDurationSeconds: 900,
            completed: false,
            summaryPoints: [
              "Kiểm tra 10 câu hỏi cốt lõi về Components & Props",
              "Thời gian làm bài: 15 phút",
              "Điểm đạt: 80% trở lên để nhận +150 XP và mở khóa Chương 3",
            ],
            resources: [
              { name: "Tài liệu ôn tập tổng hợp Chương 2 (PDF)", type: "pdf", size: "1.9 MB" },
            ],
            contentMarkdown: `### Bài kiểm tra đánh giá năng lực Chương 2
Hãy vận dụng những kiến thức đã học về Functional Component, Props, luồng dữ liệu 1 chiều để hoàn thành xuất sắc 10 câu trắc nghiệm!`,
            quizzes: [
              {
                id: "q-c2-1",
                question: "Props trong React được sử dụng để làm gì?",
                options: [
                  "Quản lý state nội tại của component",
                  "Truyền dữ liệu từ component cha xuống component con",
                  "Xử lý các side effects như gọi API, subscription",
                  "Tạo ra một component hoàn toàn mới",
                ],
                correctIndex: 1,
                explanation: "Props (Properties) là cơ chế truyền dữ liệu một chiều từ component cha xuống component con, giúp các component con tái sử dụng linh hoạt.",
              },
              {
                id: "q-c2-2",
                question: "Component con có được phép chỉnh sửa trực tiếp giá trị của Props nhận vào hay không?",
                options: [
                  "Có, component con có toàn quyền thay đổi props",
                  "Không, Props trong React là bất biến (Read-only)",
                  "Chỉ được sửa khi dùng TypeScript",
                  "Được sửa nếu là kiểu dữ liệu Object",
                ],
                correctIndex: 1,
                explanation: "Nguyên tắc bất biến trong React quy định: Tất cả các hàm component phải hoạt động như pure functions đối với props của chúng.",
              },
              {
                id: "q-c2-3",
                question: "Để truyền nội dung lồng bên trong cặp thẻ <Modal>...</Modal>, ta sử dụng prop đặc biệt nào?",
                options: ["props.content", "props.children", "props.innerHtml", "props.body"],
                correctIndex: 1,
                explanation: "React tự động đưa nội dung nằm giữa thẻ đóng/mở của component vào prop `props.children`.",
              },
              {
                id: "q-c2-4",
                question: "Cú pháp Destructuring props nào sau đây là chuẩn trong React TypeScript?",
                options: [
                  "function Button(props: string) {}",
                  "function Button({ title, onClick }: ButtonProps) {}",
                  "function Button(this.props) {}",
                  "function Button(args = props) {}",
                ],
                correctIndex: 1,
                explanation: "Cú pháp destructuring `{ title, onClick }: ButtonProps` giúp code ngắn gọn, tường minh và được type-check đầy đủ.",
              },
              {
                id: "q-c2-5",
                question: "Khi render một danh sách các phần tử bằng hàm `.map()`, thuộc tính bắt buộc cần có ở mỗi thẻ là gì?",
                options: ["id", "key", "index", "ref"],
                correctIndex: 1,
                explanation: "Thuộc tính `key` duy nhất giúp thuật toán Virtual DOM của React định danh chính xác phần tử nào đã thay đổi, thêm mới hoặc bị xóa.",
              },
            ],
          },
        ],
      },
      {
        id: "c3",
        title: "Chương 3: State & Props",
        lessons: [
          {
            id: "react-3-1",
            chapterId: "c3",
            title: "3.1 useState Hook căn bản",
            duration: "16:45",
            type: "video",
            videoDurationSeconds: 1005,
            completed: false,
            summaryPoints: [
              "Khái niệm State: Dữ liệu biến đổi theo thời gian",
              "Cú pháp: const [state, setState] = useState(initialValue)",
              "Cơ chế re-render khi State thay đổi",
              "Nguyên tắc không mutate state trực tiếp (immutability)",
            ],
            resources: [{ name: "Slide useState Guide (PDF)", type: "pdf", size: "2.1 MB" }],
            contentMarkdown: `### Làm chủ useState Hook trong React 19
State là trái tim của ứng dụng React, lưu trữ trạng thái có thể biến đổi theo tương tác của người dùng.`,
          },
          {
            id: "react-3-2",
            chapterId: "c3",
            title: "3.2 State Uplifting & Form Input",
            duration: "13:20",
            type: "video",
            videoDurationSeconds: 800,
            completed: false,
            summaryPoints: [
              "Controlled Components với thẻ input, textarea, select",
              "Nâng state lên cha (Lifting State Up)",
              "Truyền hàm callback xử lý sự kiện ngược lên trên",
            ],
            resources: [{ name: "Form handling Code (ZIP)", type: "zip", size: "900 KB" }],
            contentMarkdown: `### Kỹ thuật Lifting State Up
Khi hai hoặc nhiều component cần truy cập cùng một trạng thái, ta nâng state lên component cha chung gần nhất.`,
          },
        ],
      },
      {
        id: "c4",
        title: "Chương 4: Hooks & Hiệu ứng",
        lessons: [
          {
            id: "react-4-1",
            chapterId: "c4",
            title: "4.1 useEffect & Vòng đời Component",
            duration: "18:30",
            type: "video",
            videoDurationSeconds: 1110,
            completed: false,
            summaryPoints: [
              "Hiểu về Side Effects: Gọi API, Timer, Event Listener",
              "Mảng phụ thuộc (Dependency Array): [], [dep1], không truyền",
              "Hàm Cleanup function để tránh rò rỉ bộ nhớ (Memory Leak)",
            ],
            resources: [{ name: "useEffect Best Practices (PDF)", type: "pdf", size: "2.5 MB" }],
            contentMarkdown: `### useEffect Hook chuyên sâu
useEffect cho phép bạn đồng bộ component với các hệ thống bên ngoài như REST API hoặc DOM events.`,
          },
          {
            id: "react-4-2",
            chapterId: "c4",
            title: "4.2 Custom Hooks & Tối ưu hóa",
            duration: "14:10",
            type: "video",
            videoDurationSeconds: 850,
            completed: false,
            summaryPoints: [
              "Tự viết Custom Hook tái sử dụng logic (useFetch, useDebounce)",
              "Giữ component sạch sẽ chỉ tập trung vào UI",
              "Quy tắc đặt tên bắt đầu bằng tiền tố 'use'",
            ],
            resources: [{ name: "Bộ 10 Custom Hooks thông dụng (ZIP)", type: "zip", size: "1.4 MB" }],
            contentMarkdown: `### Sáng tạo Custom Hooks
Custom Hook cho phép bạn đóng gói logic trạng thái phức tạp thành một hàm độc lập, có thể dùng lại ở mọi component.`,
          },
        ],
      },
    ],
  },

  // Khóa học Tiếng Anh lớp 2 K-12
  "eng-g2-unit1": {
    courseId: "eng-g2-unit1",
    title: "Tiếng Anh 2: Gia đình & Số đếm",
    progressPercent: 25,
    chapters: [
      {
        id: "k12-c1",
        title: "Chương 1: Chào hỏi, Làm quen & Số đếm (1-10)",
        lessons: [
          {
            id: "k12-e1-1",
            chapterId: "k12-c1",
            title: "Unit 1.1: Hello & What is your name?",
            duration: "06:30",
            type: "video",
            videoDurationSeconds: 390,
            completed: true,
            summaryPoints: [
              "Từ vựng chào hỏi: Hello, Hi, Good morning",
              "Mẫu câu: What is your name? - My name is...",
              "Luyện phát âm chuẩn âm đuôi /s/ và ngữ điệu câu hỏi",
            ],
            resources: [
              { name: "Thẻ từ vựng Flashcard Chào hỏi (PDF)", type: "pdf", size: "1.5 MB" },
              { name: "File âm thanh phát âm bản xứ (MP3)", type: "link" },
            ],
            contentMarkdown: `# Unit 1.1: Chào hỏi & Làm quen (Hello & What is your name?)

Chào mừng các bạn nhỏ đến với bài học tiếng Anh đầu tiên! Hôm nay chúng mình sẽ cùng học cách chào hỏi và tự giới thiệu bản thân nhé.

---

### 1. Từ vựng chào hỏi cơ bản (Vocabulary)
- **Hello** (/həˈləʊ/): Xin chào (lịch sự)
- **Hi** (/haɪ/): Chào bạn (thân mật)
- **Good morning** (/ɡʊd ˈmɔː.nɪŋ/): Chào buổi sáng
- **Name** (/neɪm/): Tên

---

### 2. Mẫu câu giao tiếp (Sentence Patterns)
Khi muốn hỏi tên bạn mới:
> ❓ **What is your name?** *(Bạn tên là gì?)*
> 💡 **My name is Linh.** *(Tên mình là Linh.)*

---

### 3. Thực hành đàm thoại:
- Bạn A: *Hello! What is your name?*
- Bạn B: *Hi! My name is Ben. Nice to meet you!*`,
            quizzes: [
              {
                id: "k12-q1-1",
                question: "Để hỏi 'Bạn tên là gì?' bằng tiếng Anh, ta nói câu nào?",
                options: ["What is your name?", "How old are you?", "Where are you?", "Good morning!"],
                correctIndex: 0,
                explanation: "'What is your name?' là câu hỏi tên chính xác.",
              },
            ],
          },
          {
            id: "k12-e1-2",
            chapterId: "k12-c1",
            title: "Unit 1.2: Numbers 1 to 10 (Số đếm 1 đến 10)",
            duration: "08:00",
            type: "video",
            videoDurationSeconds: 480,
            completed: false,
            summaryPoints: [
              "Đếm số từ 1 đến 10: One, Two, Three, Four, Five, Six, Seven, Eight, Nine, Ten",
              "Mẫu câu hỏi tuổi: How old are you? - I am seven years old",
              "Trò chơi đếm đồ vật trong lớp học và phát âm âm gió",
            ],
            resources: [
              { name: "Phiếu bài tập nối số và tô màu 1-10 (PDF)", type: "pdf", size: "2.1 MB" },
              { name: "Audio bài hát Ten Little Fingers (MP3)", type: "link" },
            ],
            contentMarkdown: `# Unit 1.2: Numbers 1 to 10 (Số đếm từ 1 đến 10)

Hôm nay các bạn nhỏ sẽ cùng khám phá cách đếm các con số vui nhộn từ 1 đến 10 bằng tiếng Anh nhé!

---

### 1. Bảng số đếm 1 đến 10 (Vocabulary & Pronunciation)

| Số | Tiếng Anh | Phiên âm | Nghĩa tiếng Việt |
|:---:|:---:|:---:|:---|
| **1** | **One** | /wʌn/ | Số một |
| **2** | **Two** | /tuː/ | Số hai |
| **3** | **Three** | /θriː/ | Số ba (chú ý âm /θ/) |
| **4** | **Four** | /fɔːr/ | Số bốn |
| **5** | **Five** | /faɪv/ | Số năm (âm đuôi /v/) |
| **6** | **Six** | /sɪks/ | Số sáu (âm đuôi /ks/) |
| **7** | **Seven** | /ˈsev.ən/ | Số bảy |
| **8** | **Eight** | /eɪt/ | Số tám (âm đuôi /t/) |
| **9** | **Nine** | /naɪn/ | Số chín |
| **10** | **Ten** | /ten/ | Số mười |

---

### 2. Mẫu câu hỏi tuổi & số lượng (Sentence Patterns)

> **Hỏi tuổi:**
> - ❓ **How old are you?** *(Bạn bao nhiêu tuổi?)*
> - 💡 **I am seven years old.** *(Mình 7 tuổi.)*

> **Đếm số lượng đồ vật:**
> - ❓ **How many apples?** *(Có bao nhiêu quả táo?)*
> - 💡 **Five apples!** *(Năm quả táo!)*

---

### 3. Mẹo phát âm chuẩn người bản xứ:
- Số **Three** (/θriː/): Đặt nhẹ đầu lưỡi ở giữa 2 hàm răng rồi thổi hơi nhẹ, không đọc thành "sờ-ri" hay "tờ-ri".
- Số **Five** (/faɪv/): Khép nhẹ răng cửa trên vào môi dưới để phát âm âm /v/.
- Số **Six** (/sɪks/): Nhớ bật âm /ks/ gió ở đuôi.`,
            quizzes: [
              {
                id: "k12-e1-2-q1",
                question: "Số 7 trong Tiếng Anh viết là gì?",
                options: ["Six", "Seven", "Eight", "Nine"],
                correctIndex: 1,
                explanation: "Số 7 trong tiếng Anh là 'Seven'.",
              },
              {
                id: "k12-e1-2-q2",
                question: "Để trả lời câu hỏi 'How old are you?' khi bé 8 tuổi, bé chọn đáp án nào?",
                options: ["I am eight years old.", "My name is Eight.", "I have eight apples.", "Good morning!"],
                correctIndex: 0,
                explanation: "'I am eight years old' nghĩa là 'Mình 8 tuổi'.",
              },
            ],
          },
          {
            id: "k12-e1-3",
            chapterId: "k12-c1",
            title: "Unit 1.3: How old are you? (Hỏi đáp tuổi)",
            duration: "07:30",
            type: "video",
            videoDurationSeconds: 450,
            completed: false,
            summaryPoints: [
              "Hỏi và trả lời tuổi tự tin với bạn bè",
              "Phân biệt cấu trúc: I am seven vs She is seven",
              "Hát bài hát Happy Birthday tiếng Anh",
            ],
            resources: [
              { name: "Phiếu luyện tập viết số tuổi (PDF)", type: "pdf", size: "1.2 MB" },
            ],
            contentMarkdown: `# Unit 1.3: How old are you? (Hỏi đáp về tuổi)

Trong bài học này, chúng ta sẽ luyện tập thành thạo cách hỏi và trả lời tuổi của mình và các bạn nhé!

### Mẫu câu:
- ❓ **How old are you?** *(Bạn bao nhiêu tuổi?)*
- 💡 **I am seven years old.** *(Tớ 7 tuổi.)*
- 💡 **I am eight years old.** *(Tớ 8 tuổi.)*`,
            quizzes: [
              {
                id: "k12-e1-3-q1",
                question: "Điền vào chỗ trống: 'How _____ are you? - I am seven.'",
                options: ["old", "many", "name", "are"],
                correctIndex: 0,
                explanation: "Câu hỏi tuổi đúng cấu trúc là 'How old are you?'.",
              },
            ],
          },
          {
            id: "k12-e1-4",
            chapterId: "k12-c1",
            title: "Unit 1.4: Luyện tập & Đếm đồ vật trong lớp học",
            duration: "09:00",
            type: "practice",
            videoDurationSeconds: 540,
            completed: false,
            summaryPoints: [
              "Đếm số lượng bút chì, thước kẻ, sách vở trong lớp",
              "Cấu trúc: How many pencils? - One, two, three...",
              "Rèn phản xạ nghe và đếm số nhanh",
            ],
            resources: [
              { name: "Trò chơi tìm số và đếm đồ vật (PDF)", type: "pdf", size: "1.8 MB" },
            ],
            contentMarkdown: `# Unit 1.4: Luyện tập đếm đồ vật trong lớp học

Cùng thực hành đếm các đồ dùng học tập quen thuộc xung quanh chúng mình nào!

- 1 book (Một quyển sách)
- 2 pencils (Hai chiếc bút chì)
- 3 rulers (Ba chiếc thước kẻ)
- 4 erasers (Bốn cục tẩy)`,
            quizzes: [
              {
                id: "k12-e1-4-q1",
                question: "Có 4 chiếc bút chì, ta nói tiếng Anh như thế nào?",
                options: ["Four pencils", "Five pencils", "Three pencils", "Four books"],
                correctIndex: 0,
                explanation: "Số 4 là 'Four', bút chì là 'pencils' -> 'Four pencils'.",
              },
            ],
          },
        ],
      },
      {
        id: "k12-c2",
        title: "Chương 2: Gia đình & Ngôi nhà yêu thương (My Family & Home)",
        lessons: [
          {
            id: "k12-e2-1",
            chapterId: "k12-c2",
            title: "Unit 2.1: Family Members (Thành viên gia đình)",
            duration: "08:15",
            type: "video",
            videoDurationSeconds: 495,
            completed: false,
            summaryPoints: [
              "Từ vựng gia đình: Father, Mother, Brother, Sister",
              "Mẫu câu: This is my mother. - She is kind.",
              "Vẽ cây gia đình (Family Tree)",
            ],
            resources: [
              { name: "Sơ đồ cây gia đình tô màu (PDF)", type: "pdf", size: "2.3 MB" },
            ],
            contentMarkdown: `# Unit 2.1: Family Members (Các thành viên trong gia đình)

Gia đình là nơi ấm áp nhất. Hãy cùng học từ vựng về những người thân yêu nhé!

### 1. Từ vựng:
- **Father** (/ˈfɑː.ðər/): Bố
- **Mother** (/ˈmʌð.ər/): Mẹ
- **Brother** (/ˈbrʌð.ər/): Anh / Em trai
- **Sister** (/ˈsɪs.tər/): Chị / Em gái

### 2. Mẫu câu giới thiệu:
- 💡 **This is my father.** *(Đây là bố của tớ.)*
- 💡 **This is my mother.** *(Đây là mẹ của tớ.)*`,
            quizzes: [
              {
                id: "k12-e2-1-q1",
                question: "'Mẹ' trong Tiếng Anh là từ nào?",
                options: ["Mother", "Father", "Sister", "Brother"],
                correctIndex: 0,
                explanation: "'Mother' nghĩa là mẹ.",
              },
            ],
          },
          {
            id: "k12-e2-2",
            chapterId: "k12-c2",
            title: "Unit 2.2: Grandfather & Grandmother (Ông bà yêu quý)",
            duration: "08:45",
            type: "video",
            videoDurationSeconds: 525,
            completed: false,
            summaryPoints: [
              "Từ vựng: Grandfather (Ông), Grandmother (Bà)",
              "Mẫu câu hỏi: Who is this? - This is my grandfather.",
              "Thực hành kể chuyện về ông bà",
            ],
            resources: [
              { name: "Flashcard Ông Bà (PDF)", type: "pdf", size: "1.4 MB" },
            ],
            contentMarkdown: `# Unit 2.2: Grandfather & Grandmother

Cùng học cách giới thiệu ông bà thân yêu:
- **Grandfather**: Ông
- **Grandmother**: Bà

### Mẫu câu:
- ❓ **Who is this?** *(Đây là ai?)*
- 💡 **This is my grandfather.** *(Đây là ông của tớ.)*`,
            quizzes: [
              {
                id: "k12-e2-2-q1",
                question: "'Grandfather' có nghĩa là gì?",
                options: ["Ông", "Bà", "Bố", "Mẹ"],
                correctIndex: 0,
                explanation: "'Grandfather' nghĩa là Ông.",
              },
            ],
          },
          {
            id: "k12-e2-3",
            chapterId: "k12-c2",
            title: "Unit 2.3: Colors and Shapes in my house (Sắc màu & Hình khối)",
            duration: "09:30",
            type: "video",
            videoDurationSeconds: 570,
            completed: false,
            summaryPoints: [
              "Màu sắc: Red, Blue, Yellow, Green, Pink",
              "Hình khối: Circle (Hình tròn), Square (Hình vuông)",
              "Miêu tả đồ vật trong nhà",
            ],
            resources: [
              { name: "Bảng sắc màu và hình khối (PDF)", type: "pdf", size: "1.9 MB" },
            ],
            contentMarkdown: `# Unit 2.3: Colors and Shapes in my house

Khám phá thế giới sắc màu rực rỡ trong ngôi nhà thân yêu!

### Từ vựng:
- **Red**: Màu đỏ
- **Blue**: Màu xanh dương
- **Yellow**: Màu vàng
- **Green**: Màu xanh lá cây`,
            quizzes: [
              {
                id: "k12-e2-3-q1",
                question: "Quả chuối chín có màu gì trong tiếng Anh?",
                options: ["Yellow", "Red", "Blue", "Black"],
                correctIndex: 0,
                explanation: "Quả chuối chín màu vàng ('Yellow').",
              },
            ],
          },
          {
            id: "k12-e2-quiz",
            chapterId: "k12-c2",
            title: "Unit 2.4: Bài kiểm tra Trắc nghiệm Chặng 1: Gia đình & Số đếm",
            duration: "15:00",
            type: "quiz",
            videoDurationSeconds: 900,
            completed: false,
            summaryPoints: [
              "10 câu trắc nghiệm tổng hợp toàn bộ từ vựng và mẫu câu Chặng 1",
              "Nhận ngay +150 XP và huy hiệu 'Ngôi Sao Tiếng Anh Nhí'",
            ],
            resources: [],
            contentMarkdown: `### Bài kiểm tra đánh giá năng lực Tiếng Anh 2 - Chặng 1: Gia đình & Số đếm`,
            quizzes: [
              {
                id: "k12-q-final-1",
                question: "Khi gặp bạn mới vào buổi sáng, bé nên nói câu chào nào?",
                options: ["Good morning!", "Good night!", "Goodbye!", "Thank you!"],
                correctIndex: 0,
                explanation: "Good morning nghĩa là 'Chào buổi sáng'.",
              },
              {
                id: "k12-q-final-2",
                question: "Số 5 trong Tiếng Anh đọc và viết là gì?",
                options: ["Four", "Five", "Six", "Seven"],
                correctIndex: 1,
                explanation: "Số 5 là 'Five' (/faɪv/).",
              },
              {
                id: "k12-q-final-3",
                question: "Để hỏi 'Bạn tên là gì?', chúng ta dùng câu nào?",
                options: ["How are you?", "What is your name?", "How old are you?", "Where are you?"],
                correctIndex: 1,
                explanation: "'What is your name?' nghĩa là 'Tên bạn là gì?'.",
              },
              {
                id: "k12-q-final-4",
                question: "'This is my father' có nghĩa là gì?",
                options: ["Đây là bố của tớ.", "Đây là mẹ của tớ.", "Đây là anh trai tớ.", "Tớ tên là Father."],
                correctIndex: 0,
                explanation: "'This is my father' nghĩa là 'Đây là bố của tớ'.",
              },
            ],
          },
        ],
      },
    ],
  },
};

/**
 * Hàm lấy chi tiết khóa học. Nếu chưa có sẵn trong Catalog,
 * tự động nhận diện lĩnh vực (Toán học, Tiếng Anh, Data/AI, IT...)
 * để sinh cấu trúc chương trình thực tế và chuyên sâu 100%.
 */
export function getCourseDetail(courseId: string, fallbackTitle?: string): CourseDetail {
  if (COURSE_LESSONS_CATALOG[courseId]) {
    return COURSE_LESSONS_CATALOG[courseId];
  }

  const cleanTitle = fallbackTitle || (courseId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
  const lowerTitle = cleanTitle.toLowerCase();

  // 1. Nếu là Môn Toán K-12 (Toán 2, Phép tính, Cộng trừ, Kangaroo...)
  if (
    lowerTitle.includes("toán") || 
    lowerTitle.includes("math") || 
    lowerTitle.includes("cộng") || 
    lowerTitle.includes("trừ") || 
    lowerTitle.includes("nhân") || 
    lowerTitle.includes("chia") ||
    lowerTitle.includes("phép tính")
  ) {
    return {
      courseId,
      title: cleanTitle,
      progressPercent: 20,
      chapters: [
        {
          id: "math-ch-1",
          title: "Chương 1: Phép cộng có nhớ trong phạm vi 100",
          lessons: [
            {
              id: `${courseId}-m1-1`,
              chapterId: "math-ch-1",
              title: "1.1 Kỹ thuật tách gộp số cho đủ chục (9 + 5, 8 + 5, 7 + 4)",
              duration: "10:30",
              type: "video",
              videoDurationSeconds: 630,
              completed: true,
              summaryPoints: [
                "Bản chất phép cộng có nhớ: Tách một số thành hai phần để gộp với số kia thành tròn chục",
                "Ví dụ trực quan: 9 + 5 = 9 + (1 + 4) = (9 + 1) + 4 = 10 + 4 = 14",
                "Quy tắc vàng: 'Gộp cho đủ chục rồi cộng với số còn lại'",
                "Luyện tập bảng cộng 9, bảng cộng 8 với que tính ảo",
              ],
              resources: [
                { name: "Phiếu bài tập tính nhẩm tách gộp (PDF)", type: "pdf", size: "1.2 MB" },
                { name: "Sơ đồ tia số và bảng cộng 20 (PNG)", type: "link" },
              ],
              contentMarkdown: `### 1. Kỹ thuật tách gộp số cho đủ chục

Để tính nhanh các phép cộng có nhớ trong phạm vi 20, các em áp dụng quy tắc: **Gộp cho đủ chục rồi cộng với số còn lại**.

#### Ví dụ 1: Tính 9 + 5
- Ta thấy: $9$ thiếu $1$ để thành $10$.
- Tách $5$ thành $1$ và $4$.
- Gộp: $9 + 1 = 10$.
- Cộng tiếp: $10 + 4 = 14$.
- Vậy: $9 + 5 = 14$.

#### Ví dụ 2: Tính 8 + 6
- Ta thấy: $8$ thiếu $2$ để thành $10$.
- Tách $6$ thành $2$ và $4$.
- Gộp: $8 + 2 = 10$.
- Cộng tiếp: $10 + 4 = 14$.
- Vậy: $8 + 6 = 14$.`,
              quizzes: [
                {
                  id: "qm-1",
                  question: "Để tính nhanh 9 + 6 theo phương pháp tách gộp cho đủ chục, ta tách số 6 như thế nào?",
                  options: [
                    "Tách 6 thành 1 và 5 (vì 9 + 1 = 10, rồi 10 + 5 = 15)",
                    "Tách 6 thành 2 và 4",
                    "Tách 6 thành 3 và 3",
                    "Không cần tách",
                  ],
                  correctIndex: 0,
                  explanation: "Vì 9 cần thêm 1 để tròn chục (10), nên ta tách 6 thành 1 và 5. Sau đó 9 + 1 = 10, rồi 10 + 5 = 15.",
                },
                {
                  id: "qm-2",
                  question: "Kết quả của phép tính 8 + 7 là bao nhiêu?",
                  options: ["13", "14", "15", "16"],
                  correctIndex: 2,
                  explanation: "8 + 7 = 8 + (2 + 5) = 10 + 5 = 15.",
                },
              ],
            },
            {
              id: `${courseId}-m1-2`,
              chapterId: "math-ch-1",
              title: "1.2 Phép cộng có nhớ dạng 26 + 4, 36 + 7",
              duration: "12:00",
              type: "video",
              videoDurationSeconds: 720,
              completed: false,
              summaryPoints: [
                "Đặt tính rồi tính theo cột dọc: Thẳng hàng đơn vị, thẳng hàng chục",
                "Thực hiện cộng từ phải sang trái (cộng hàng đơn vị trước)",
                "Nếu hàng đơn vị lớn hơn hoặc bằng 10, nhớ 1 sang hàng chục",
                "Cách tránh quên số nhớ 1 sang hàng chục",
              ],
              resources: [
                { name: "Vở bài tập đặt tính cộng có nhớ (PDF)", type: "pdf", size: "1.8 MB" },
              ],
              contentMarkdown: `### 2. Phép cộng có nhớ dạng 36 + 7

#### Quy tắc đặt tính rồi tính:
1. Viết số $36$ trước, viết số $7$ ở dưới sao cho chữ số $7$ thẳng cột với chữ số $6$ (hàng đơn vị).
2. Viết dấu $+$ và kẻ gạch ngang.
3. Cộng từ phải sang trái:
   - $6 + 7 = 13$, viết $3$, **nhớ 1**.
   - $3$ thêm $1$ bằng $4$, viết $4$.
   - Kết quả: $36 + 7 = 43$.`,
              quizzes: [
                {
                  id: "qm-3",
                  question: "Khi thực hiện phép cộng 48 + 5, kết quả đúng là bao nhiêu?",
                  options: ["51", "52", "53", "54"],
                  correctIndex: 2,
                  explanation: "8 + 5 = 13, viết 3 nhớ 1. 4 thêm 1 bằng 5. Kết quả là 53.",
                },
              ],
            },
            {
              id: `${courseId}-m1-3`,
              chapterId: "math-ch-1",
              title: "1.3 Phép cộng hai chữ số có nhớ: 47 + 25",
              duration: "14:15",
              type: "video",
              videoDurationSeconds: 855,
              completed: false,
              summaryPoints: [
                "Cộng số có 2 chữ số với số có 2 chữ số có nhớ",
                "Các bước nhớ sang hàng chục và cộng dồn",
                "Bài toán đố vui thực tế: Bó hoa, quả táo, con tem",
              ],
              resources: [
                { name: "Đề luyện tập cộng 2 chữ số có nhớ (PDF)", type: "pdf", size: "1.5 MB" },
              ],
              contentMarkdown: `### 3. Phép cộng hai chữ số có nhớ: 47 + 25
- $7 + 5 = 12$, viết $2$ nhớ $1$.
- $4 + 2 = 6$, thêm $1$ bằng $7$, viết $7$.
- Kết quả: $47 + 25 = 72$.`,
            },
            {
              id: `${courseId}-m1-quiz`,
              chapterId: "math-ch-1",
              title: "1.4 Bài kiểm tra Trắc nghiệm Toán 2: Phép cộng có nhớ",
              duration: "15:00",
              type: "quiz",
              videoDurationSeconds: 900,
              completed: false,
              summaryPoints: [
                "10 câu trắc nghiệm tính nhẩm nhanh và giải toán đố",
                "Nhận ngay +150 XP và huy hiệu 'Thần đồng Toán học'",
              ],
              resources: [],
              contentMarkdown: `### Bài kiểm tra đánh giá năng lực Phép cộng có nhớ`,
              quizzes: [
                {
                  id: "qm-q1",
                  question: "Phép tính nào dưới đây có kết quả bằng 50?",
                  options: ["42 + 8", "35 + 14", "41 + 8", "43 + 6"],
                  correctIndex: 0,
                  explanation: "42 + 8 = 50 (2 + 8 = 10, viết 0 nhớ 1, 4 thêm 1 bằng 5).",
                },
                {
                  id: "qm-q2",
                  question: "Lớp 2A có 18 bạn nam và 17 bạn nữ. Hỏi lớp 2A có tất cả bao nhiêu học sinh?",
                  options: ["34 học sinh", "35 học sinh", "36 học sinh", "37 học sinh"],
                  correctIndex: 1,
                  explanation: "Số học sinh cả lớp là: 18 + 17 = 35 học sinh.",
                },
              ],
            },
          ],
        },
        {
          id: "math-ch-2",
          title: "Chương 2: Phép trừ có nhớ trong phạm vi 100",
          lessons: [
            {
              id: `${courseId}-m2-1`,
              chapterId: "math-ch-2",
              title: "2.1 Kỹ thuật trừ qua 10 (11 - 5, 12 - 7, 13 - 8)",
              duration: "11:00",
              type: "video",
              videoDurationSeconds: 660,
              completed: false,
              summaryPoints: [
                "Bản chất trừ qua 10: 'Trừ để được 10 rồi trừ số còn lại'",
                "Ví dụ: 12 - 7 = 12 - 2 - 5 = 10 - 5 = 5",
                "Luyện tập bảng trừ trong phạm vi 20",
              ],
              resources: [{ name: "Bảng trừ trong phạm vi 20 (PDF)", type: "pdf", size: "1.1 MB" }],
              contentMarkdown: `### Kỹ thuật trừ qua 10 trong phạm vi 20`,
            },
            {
              id: `${courseId}-m2-2`,
              chapterId: "math-ch-2",
              title: "2.2 Phép trừ có nhớ dạng 52 - 28, 60 - 24",
              duration: "13:30",
              type: "video",
              videoDurationSeconds: 810,
              completed: false,
              summaryPoints: [
                "Kỹ thuật mượn 1 chục ở hàng chục khi số bị trừ nhỏ hơn số trừ",
                "Thực hiện trả 1 vào số trừ hoặc bớt 1 ở số bị trừ",
                "Bài toán có lời văn: Tìm phần còn lại, so sánh nhiều hơn ít hơn",
              ],
              resources: [{ name: "Bài tập trừ có nhớ nâng cao (PDF)", type: "pdf", size: "1.4 MB" }],
              contentMarkdown: `### Phép trừ số có 2 chữ số có nhớ`,
            },
          ],
        },
      ],
    };
  }

  // 2. Nếu là Môn Ngoại ngữ / Tiếng Anh K-12
  if (lowerTitle.includes("tiếng anh") || lowerTitle.includes("english") || lowerTitle.includes("ielts")) {
    return {
      courseId,
      title: cleanTitle,
      progressPercent: 25,
      chapters: [
        {
          id: "eng-ch-1",
          title: "Chương 1: Từ vựng & Phát âm Phonics",
          lessons: [
            {
              id: `${courseId}-e1-1`,
              chapterId: "eng-ch-1",
              title: "1.1 Chào hỏi, Giới thiệu bản thân & Bạn bè",
              duration: "08:30",
              type: "video",
              videoDurationSeconds: 510,
              completed: true,
              summaryPoints: [
                "Từ vựng: Hello, Hi, Name, Friend, Family",
                "Mẫu câu: What is your name? - My name is...",
                "Phát âm chuẩn âm đuôi và ngữ điệu tự nhiên",
              ],
              resources: [{ name: "Flashcard từ vựng (PDF)", type: "pdf", size: "1.5 MB" }],
              contentMarkdown: `### Lesson 1.1: Greetings & Introduction`,
            },
            {
              id: `${courseId}-e1-2`,
              chapterId: "eng-ch-1",
              title: "1.2 Số đếm, Màu sắc & Đồ dùng học tập",
              duration: "10:15",
              type: "video",
              videoDurationSeconds: 615,
              completed: false,
              summaryPoints: [
                "Numbers 1-20, Colors (Red, Blue, Green, Yellow)",
                "School items: Pen, Book, Bag, Ruler",
              ],
              resources: [],
              contentMarkdown: `### Lesson 1.2: Numbers and Colors`,
            },
          ],
        },
      ],
    };
  }

  // 3. Nếu là Dữ liệu & AI / Python
  if (lowerTitle.includes("data") || lowerTitle.includes("ai") || lowerTitle.includes("python") || lowerTitle.includes("dữ liệu")) {
    return {
      courseId,
      title: cleanTitle,
      progressPercent: 20,
      chapters: [
        {
          id: "ai-ch-1",
          title: "Chương 1: Python Nền tảng cho Dữ liệu",
          lessons: [
            {
              id: `${courseId}-ai-1`,
              chapterId: "ai-ch-1",
              title: "1.1 Cú pháp Python cốt lõi & Cấu trúc Dữ liệu",
              duration: "12:00",
              type: "video",
              videoDurationSeconds: 720,
              completed: true,
              summaryPoints: [
                "Biến, List, Dictionary, Tuple trong Python",
                "Vòng lặp và List Comprehension",
                "Hàm và xử lý dữ liệu cơ bản",
              ],
              resources: [{ name: "Python Cheat Sheet (PDF)", type: "pdf", size: "2.1 MB" }],
              contentMarkdown: `### Python Nền tảng cho Data Science`,
            },
            {
              id: `${courseId}-ai-2`,
              chapterId: "ai-ch-1",
              title: "1.2 Thư viện Pandas & Phân tích Dữ liệu Bảng",
              duration: "16:00",
              type: "practice",
              videoDurationSeconds: 960,
              completed: false,
              summaryPoints: [
                "DataFrame và Series trong Pandas",
                "Lọc, sắp xếp và nhóm dữ liệu với groupby",
                "Xử lý dữ liệu khuyết thiếu (Missing values)",
              ],
              resources: [{ name: "Pandas Notebook (ZIP)", type: "zip", size: "1.9 MB" }],
              contentMarkdown: `### Pandas Thực chiến`,
            },
          ],
        },
      ],
    };
  }

  // 4. Mặc định dành cho Lập trình & CNTT
  return {
    courseId,
    title: cleanTitle,
    progressPercent: 15,
    chapters: [
      {
        id: "ch-1",
        title: "Chương 1: Kiến thức Cốt lõi & Kiến trúc",
        lessons: [
          {
            id: `${courseId}-1-1`,
            chapterId: "ch-1",
            title: `1.1 Tổng quan & Bản chất của ${cleanTitle}`,
            duration: "09:30",
            type: "video",
            videoDurationSeconds: 570,
            completed: true,
            summaryPoints: [
              `Mục tiêu đầu ra của môn ${cleanTitle}`,
              "Kiến trúc tổng quan và các nguyên lý then chốt",
              "Chiến lược học tập hiệu quả cùng AI Tutor",
            ],
            resources: [
              { name: "Slide tổng quan bài học (PDF)", type: "pdf", size: "2.1 MB" },
            ],
            contentMarkdown: `### Chào mừng bạn đến với ${cleanTitle}
Trong bài học mở đầu này, chúng ta sẽ cùng nắm rõ bức tranh toàn cảnh và các kỹ năng cốt lõi sẽ đạt được.`,
          },
          {
            id: `${courseId}-1-2`,
            chapterId: "ch-1",
            title: "1.2 Cấu hình môi trường & Thao tác đầu tiên",
            duration: "13:45",
            type: "video",
            videoDurationSeconds: 825,
            completed: false,
            summaryPoints: [
              "Cài đặt các công cụ và thư viện cần thiết",
              "Cấu hình dự án và kiểm tra kết nối",
              "Chạy ví dụ thực hành đầu tiên",
            ],
            resources: [
              { name: "Hướng dẫn chi tiết (PDF)", type: "pdf", size: "1.8 MB" },
            ],
            contentMarkdown: `### Bắt đầu thực hành với ${cleanTitle}`,
          },
        ],
      },
    ],
  };
}
