export type DomainId = 
  | "k12_school"
  | "stem_kids"
  | "it_dev" 
  | "data_ai" 
  | "ui_ux" 
  | "marketing" 
  | "languages" 
  | "management";

export interface UserProfile {
  id: string;
  email?: string;
  displayName: string;
  avatarUrl?: string | null;
  level: number;
  xp: number;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string | null;
  domainId: DomainId;
}

export interface Milestone {
  id: string;
  title: string;
  weeks: string;
  status: "completed" | "in_progress" | "locked";
  lessonsCount: number;
  quizzesCount: number;
}

export interface UserGoal {
  id: string;
  domainId: DomainId;
  title: string;
  targetRole: string; // e.g. "Học sinh giỏi Toán lớp 2" hoặc "Frontend Developer"
  commitment: string; // e.g. "30 phút / ngày"
  currentMilestone: number;
  totalMilestones: number;
  progressPercent: number;
  milestones: Milestone[];
  skills: string[];
  category?: "k12" | "career" | "skills";
  gradeLevel?: string; // e.g. "Lớp 2", "Lớp 5", "Đại học / Đi làm"
  iconEmoji?: string; // e.g. "📘", "📐", "💻", "🎨"
}

export interface Course {
  id: string;
  domainId: DomainId;
  goalId?: string; // Liên kết với mục tiêu/môn học cụ thể
  title: string;
  iconBg: string;
  iconColor: string;
  iconType: "react" | "typescript" | "english" | "database" | "python" | "design" | "ai" | "marketing" | "management" | "math" | "science" | "kids_code" | "school";
  totalLessons: number;
  completedLessons: number;
  progress: number; // 0 - 100
  timeRemaining: string;
  status: "not_started" | "learning" | "completed" | "favorite";
  statusText: string;
  lessonCount: string;
  currentLesson: string;
}

export interface OnboardingData {
  domainId: DomainId;
  selectedSubTopics: string[];
  testScore: number;
  totalQuestions: number;
  proficiencyLevel: "Mới bắt đầu" | "Cơ bản" | "Trung cấp" | "Nâng cao";
  learningObjective: string;
  targetDailyMinutes: number;
  completedAt: string;
}
