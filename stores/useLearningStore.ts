"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Course, DomainId, OnboardingData, UserGoal, UserProfile } from "@/types/learning";
import { DOMAIN_CURRICULA } from "@/lib/data/curriculumCatalog";
import { getCourseDetail } from "@/lib/data/lessonCatalog";
import { createClient } from "@/lib/supabase/client";

interface LearningState {
  // State
  userProfile: UserProfile;
  isAuthenticated: boolean;
  activeGoal: UserGoal;
  courses: Course[];
  completedLessons: string[]; // Danh sách ID bài học thực tế đã hoàn thành
  onboarding: OnboardingData | null;
  isLoading: boolean;

  // Multi-subject Goals State
  goals: UserGoal[];
  activeGoalId: string;
  coursesByGoal: Record<string, Course[]>;

  customCourseDetails: Record<string, any>;

  // Actions
  initFromSupabase: () => Promise<void>;
  saveOnboarding: (data: OnboardingData) => Promise<void>;
  updateGoal: (goalData: Partial<UserGoal>) => Promise<void>;
  switchGoal: (goalId: string) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  completeLesson: (courseId: string, lessonId: string, xpEarned?: number) => Promise<void>;
  applyAiRoadmap: (roadmapData: any, domainId: DomainId, commitmentStr: string) => Promise<void>;
  addCustomCourse: (courseDetail: any, courseMeta: Course) => Promise<void>;
  updateLessonContent: (courseId: string, lessonId: string, lessonData: any) => void;
  setDomain: (domainId: DomainId) => void;
  setUserProfile: (profile: Partial<UserProfile>) => void;
  resetToFresh: () => void;
}

const DEFAULT_DOMAIN: DomainId = "it_dev";
const defaultCurriculum = DOMAIN_CURRICULA[DEFAULT_DOMAIN];

export const useLearningStore = create<LearningState>()(
  persist(
    (set, get) => ({
      userProfile: {
        id: "guest",
        displayName: "Học viên LearnVerse",
        avatarUrl: null,
        level: 1,
        xp: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null,
        domainId: DEFAULT_DOMAIN,
      },
      isAuthenticated: false,
      activeGoal: defaultCurriculum.defaultGoal,
      courses: defaultCurriculum.courses,
      completedLessons: [],
      onboarding: null,
      isLoading: false,
      customCourseDetails: {},

      // Khởi tạo đa môn học sẵn sàng
      goals: [
        defaultCurriculum.defaultGoal,
        DOMAIN_CURRICULA.k12_school.defaultGoal,
        DOMAIN_CURRICULA.stem_kids.defaultGoal,
      ],
      activeGoalId: defaultCurriculum.defaultGoal.id,
      coursesByGoal: {
        [defaultCurriculum.defaultGoal.id]: defaultCurriculum.courses,
        [DOMAIN_CURRICULA.k12_school.defaultGoal.id]: DOMAIN_CURRICULA.k12_school.courses,
        [DOMAIN_CURRICULA.stem_kids.defaultGoal.id]: DOMAIN_CURRICULA.stem_kids.courses,
      },

      // Đồng bộ từ Supabase Auth & Supabase Database
      initFromSupabase: async () => {
        try {
          set({ isLoading: true });
          const supabase = createClient();
          const { data: authData, error: authError } = await supabase.auth.getUser();

          if (authError || !authData?.user) {
            set({ isAuthenticated: false, isLoading: false });
            return;
          }

          const user = authData.user;
          const userMeta = user.user_metadata || {};

          // Lấy profile từ bảng `profiles` trong Supabase
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          const domainId: DomainId = (userMeta.learning_domain as DomainId) || get().userProfile.domainId || "it_dev";
          const curriculum = DOMAIN_CURRICULA[domainId] || defaultCurriculum;

          // Display Name ưu tiên: profiles -> user_metadata -> email prefix
          const displayName = 
            profileData?.display_name || 
            userMeta.full_name || 
            userMeta.display_name || 
            user.email?.split("@")[0] || 
            "Học viên LearnVerse";

          const avatarUrl = profileData?.avatar_url || userMeta.avatar_url || null;
          const xp = profileData?.xp != null ? Number(profileData.xp) : (get().userProfile.xp || 0);
          const level = profileData?.level != null ? Number(profileData.level) : Math.max(1, Math.floor(xp / 250) + 1);
          const currentStreak = profileData?.current_streak != null ? Number(profileData.current_streak) : 0;
          const longestStreak = profileData?.longest_streak != null ? Number(profileData.longest_streak) : 0;

          const syncedProfile: UserProfile = {
            id: user.id,
            email: user.email,
            displayName,
            avatarUrl,
            level,
            xp,
            currentStreak,
            longestStreak,
            lastStudyDate: profileData?.last_study_date || null,
            domainId,
          };

          // Lấy danh sách bài học đã hoàn thành thực tế
          const completedLessons: string[] = userMeta.completed_lessons || get().completedLessons || [];

          // Danh sách môn học: Ưu tiên Supabase -> local store -> danh mục mẫu
          let goals: UserGoal[] = userMeta.goals || get().goals || [
            defaultCurriculum.defaultGoal,
            DOMAIN_CURRICULA.k12_school.defaultGoal,
            DOMAIN_CURRICULA.stem_kids.defaultGoal,
          ];
          let activeGoalId: string = userMeta.active_goal_id || get().activeGoalId || goals[0]?.id;
          let activeGoal: UserGoal = (userMeta.active_goal as UserGoal) || goals.find((g) => g.id === activeGoalId) || goals[0] || curriculum.defaultGoal;
          let coursesByGoal: Record<string, Course[]> = userMeta.courses_by_goal || get().coursesByGoal || {
            [defaultCurriculum.defaultGoal.id]: defaultCurriculum.courses,
            [DOMAIN_CURRICULA.k12_school.defaultGoal.id]: DOMAIN_CURRICULA.k12_school.courses,
            [DOMAIN_CURRICULA.stem_kids.defaultGoal.id]: DOMAIN_CURRICULA.stem_kids.courses,
          };
          let courses: Course[] = (userMeta.courses as Course[]) || coursesByGoal[activeGoal.id] || get().courses || curriculum.courses;

          // Nếu là học viên mới (0 XP) và chưa có bài học nào, đảm bảo hiển thị đúng 0% nhưng GIỮ NGUYÊN lộ trình người dùng đã tạo
          if (xp === 0 && completedLessons.length === 0) {
            courses = courses.map((c, idx) => ({
              ...c,
              completedLessons: 0,
              progress: 0,
              status: idx === 0 ? ("learning" as const) : ("not_started" as const),
              statusText: idx === 0 ? "Đang học" : "Chưa bắt đầu",
              lessonCount: `0/${c.totalLessons} bài`,
            }));

            activeGoal = {
              ...activeGoal,
              currentMilestone: 0,
              progressPercent: 0,
              milestones: (activeGoal.milestones || []).map((m, idx) => ({
                ...m,
                status: idx === 0 ? ("in_progress" as const) : ("locked" as const),
              })),
            };
          }

          set({
            userProfile: syncedProfile,
            isAuthenticated: true,
            goals,
            activeGoalId,
            coursesByGoal,
            activeGoal,
            courses,
            completedLessons,
            isLoading: false,
          });
        } catch (err) {
          console.error("Lỗi khi đồng bộ dữ liệu từ Supabase:", err);
          set({ isLoading: false });
        }
      },

      // Lưu kết quả khảo sát Onboarding
      saveOnboarding: async (data: OnboardingData) => {
        const curriculum = DOMAIN_CURRICULA[data.domainId] || defaultCurriculum;
        const currentProfile = get().userProfile;
        
        // Thưởng 50 XP khi hoàn thành khảo sát ban đầu
        const newXp = currentProfile.xp + 50;
        const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);

        const updatedProfile: UserProfile = {
          ...currentProfile,
          domainId: data.domainId,
          xp: newXp,
          level: newLevel,
          currentStreak: Math.max(1, currentProfile.currentStreak),
        };

        const updatedGoal: UserGoal = {
          ...curriculum.defaultGoal,
          commitment: `${data.targetDailyMinutes} phút / ngày`,
          currentMilestone: 0,
          progressPercent: 0,
        };

        // Khóa học đầu tiên bắt đầu trạng thái "learning", các khóa còn lại "not_started"
        const freshCourses: Course[] = curriculum.courses.map((c, idx) => ({
          ...c,
          completedLessons: 0,
          progress: 0,
          status: idx === 0 ? ("learning" as const) : ("not_started" as const),
          statusText: idx === 0 ? "Đang học" : "Chưa bắt đầu",
          lessonCount: `0/${c.totalLessons} bài`,
        }));

        set({
          onboarding: data,
          userProfile: updatedProfile,
          activeGoal: updatedGoal,
          courses: freshCourses,
          completedLessons: [],
        });

        // Nếu đã đăng nhập Supabase, đồng bộ lên Cloud
        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();

          if (authData?.user) {
            await supabase.auth.updateUser({
              data: {
                onboarding: data,
                learning_domain: data.domainId,
                active_goal: updatedGoal,
                courses: freshCourses,
                completed_lessons: [],
              },
            });

            await supabase
              .from("profiles")
              .update({
                xp: newXp,
                level: newLevel,
                current_streak: Math.max(1, currentProfile.currentStreak),
                updated_at: new Date().toISOString(),
              })
              .eq("id", authData.user.id);
          }
        } catch (err) {
          console.warn("Chưa đồng bộ Supabase Cloud (chế độ local/guest):", err);
        }
      },

      // Đổi mục tiêu học tập (Screen 5)
      updateGoal: async (goalData: Partial<UserGoal>) => {
        const currentGoal = get().activeGoal;
        const updatedGoal = { ...currentGoal, ...goalData };

        set({ activeGoal: updatedGoal });

        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            await supabase.auth.updateUser({
              data: { active_goal: updatedGoal },
            });
          }
        } catch (err) {
          console.warn("Lỗi khi lưu mục tiêu lên cloud:", err);
        }
      },

      // Hoàn thành 1 bài học thật -> tính toán % thật và cộng XP thật
      completeLesson: async (courseId: string, lessonId: string, xpEarned = 25) => {
        const currentCompleted = get().completedLessons;
        if (currentCompleted.includes(lessonId)) return; // Tránh hoàn thành trùng

        const newCompleted = [...currentCompleted, lessonId];
        const currentCourses = get().courses;

        const updatedCourses = currentCourses.map((c) => {
          if (c.id === courseId) {
            const newCount = Math.min(c.totalLessons, c.completedLessons + 1);
            const newProgress = Math.round((newCount / c.totalLessons) * 100);
            const isDone = newCount >= c.totalLessons;
            return {
              ...c,
              completedLessons: newCount,
              progress: newProgress,
              status: isDone ? ("completed" as const) : ("learning" as const),
              statusText: isDone ? "Đã xong" : "Đang học",
              lessonCount: `${newCount}/${c.totalLessons} bài`,
            };
          }
          return c;
        });

        // Tính lại milestone cho goal
        const totalCompletedLessons = newCompleted.length;
        const currentGoal = get().activeGoal;
        const calculatedMilestone = Math.min(
          currentGoal.totalMilestones,
          Math.floor(totalCompletedLessons / 4)
        );
        const calculatedGoalProgress = Math.round(
          (calculatedMilestone / currentGoal.totalMilestones) * 100
        );

        const updatedGoal: UserGoal = {
          ...currentGoal,
          currentMilestone: calculatedMilestone,
          progressPercent: calculatedGoalProgress,
          milestones: currentGoal.milestones.map((m, idx) => ({
            ...m,
            status:
              idx < calculatedMilestone
                ? ("completed" as const)
                : idx === calculatedMilestone
                ? ("in_progress" as const)
                : ("locked" as const),
          })),
        };

        // Cộng XP và tính Level thật
        const currentProfile = get().userProfile;
        const newXp = currentProfile.xp + xpEarned;
        const newLevel = Math.max(1, Math.floor(newXp / 250) + 1);
        const todayStr = new Date().toISOString().split("T")[0];

        const updatedProfile: UserProfile = {
          ...currentProfile,
          xp: newXp,
          level: newLevel,
          currentStreak: Math.max(1, currentProfile.currentStreak),
          lastStudyDate: todayStr,
        };

        set({
          completedLessons: newCompleted,
          courses: updatedCourses,
          activeGoal: updatedGoal,
          userProfile: updatedProfile,
        });

        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            await supabase.auth.updateUser({
              data: {
                completed_lessons: newCompleted,
                courses: updatedCourses,
                active_goal: updatedGoal,
              },
            });

            await supabase
              .from("profiles")
              .update({
                xp: newXp,
                level: newLevel,
                current_streak: updatedProfile.currentStreak,
                last_study_date: todayStr,
                updated_at: new Date().toISOString(),
              })
              .eq("id", authData.user.id);
          }
        } catch (err) {
          console.warn("Lỗi khi đồng bộ tiến độ bài học:", err);
        }
      },

      // Chuyển đổi môn học đang hoạt động trên Dashboard
      switchGoal: async (goalId: string) => {
        const goals = get().goals || [];
        const targetGoal = goals.find((g) => g.id === goalId);
        if (!targetGoal) return;

        const coursesByGoal = get().coursesByGoal || {};
        let targetCourses = coursesByGoal[goalId];

        // Nếu chưa có khóa học lưu riêng, nạp từ danh mục mẫu
        if (!targetCourses || targetCourses.length === 0) {
          const curriculum = DOMAIN_CURRICULA[targetGoal.domainId] || defaultCurriculum;
          targetCourses = curriculum.courses;
        }

        const currentProfile = get().userProfile;
        set({
          activeGoalId: goalId,
          activeGoal: targetGoal,
          courses: targetCourses,
          userProfile: { ...currentProfile, domainId: targetGoal.domainId },
        });

        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            await supabase.auth.updateUser({
              data: {
                active_goal_id: goalId,
                active_goal: targetGoal,
                courses: targetCourses,
                learning_domain: targetGoal.domainId,
              },
            });
          }
        } catch (err) {
          console.warn("Lỗi khi chuyển đổi môn học trên cloud:", err);
        }
      },

      // Xóa hoặc rời môn học (giữ ít nhất 1 môn)
      deleteGoal: async (goalId: string) => {
        const goals = get().goals || [];
        if (goals.length <= 1) return;

        const updatedGoals = goals.filter((g) => g.id !== goalId);
        const nextGoal = updatedGoals[0];
        const coursesByGoal = { ...(get().coursesByGoal || {}) };
        delete coursesByGoal[goalId];

        const nextCourses = coursesByGoal[nextGoal.id] || DOMAIN_CURRICULA[nextGoal.domainId]?.courses || defaultCurriculum.courses;

        set({
          goals: updatedGoals,
          activeGoalId: nextGoal.id,
          activeGoal: nextGoal,
          courses: nextCourses,
          coursesByGoal,
          userProfile: { ...get().userProfile, domainId: nextGoal.domainId },
        });

        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            await supabase.auth.updateUser({
              data: {
                goals: updatedGoals,
                active_goal_id: nextGoal.id,
                active_goal: nextGoal,
                courses: nextCourses,
                courses_by_goal: coursesByGoal,
                learning_domain: nextGoal.domainId,
              },
            });
          }
        } catch (err) {
          console.warn("Lỗi khi xóa môn học trên cloud:", err);
        }
      },

      applyAiRoadmap: async (roadmapData: any, domainId: DomainId, commitmentStr: string) => {
        const milestones = Array.isArray(roadmapData.milestones) ? roadmapData.milestones : [];
        const isK12 = domainId === "k12_school" || domainId === "stem_kids";
        
        const newGoal: UserGoal = {
          id: `goal_${Date.now()}`,
          domainId,
          title: roadmapData.title || (isK12 ? "Môn học K-12" : "Lộ trình AI cá nhân hóa"),
          targetRole: roadmapData.targetRole || (isK12 ? "Học sinh giỏi" : "Chuyên viên Kỹ thuật"),
          commitment: commitmentStr || "30 phút / ngày",
          currentMilestone: 0,
          totalMilestones: Math.max(1, milestones.length),
          progressPercent: 0,
          category: isK12 ? "k12" : "career",
          gradeLevel: roadmapData.gradeLevel || (isK12 ? "Lớp 2" : "Đại học / Đi làm"),
          iconEmoji: 
            domainId === "k12_school" ? "📘" :
            domainId === "stem_kids" ? "📐" :
            domainId === "it_dev" ? "💻" :
            domainId === "data_ai" ? "🤖" :
            domainId === "ui_ux" ? "🎨" :
            domainId === "languages" ? "🌍" : "🎯",
          milestones: milestones.map((m: any, idx: number) => ({
            id: m.id || `m_${idx + 1}`,
            title: m.title || `Chặng ${idx + 1}`,
            weeks: m.weeks || `Tuần ${idx * 2 + 1}-${idx * 2 + 2}`,
            status: idx === 0 ? ("in_progress" as const) : ("locked" as const),
            lessonsCount: Array.isArray(m.lessons) ? m.lessons.length : 6,
            quizzesCount: Array.isArray(m.quizzes) ? m.quizzes.length : 1,
          })),
          skills: Array.isArray(roadmapData.skills) ? roadmapData.skills : ["Kiến thức trọng tâm"],
        };

        const iconType = 
          domainId === "k12_school" ? "school" :
          domainId === "stem_kids" ? "math" :
          domainId === "data_ai" ? "ai" : 
          domainId === "ui_ux" ? "design" : 
          domainId === "languages" ? "english" : 
          domainId === "marketing" ? "marketing" : 
          domainId === "management" ? "management" : "react";

        const newCourses: Course[] = milestones.map((m: any, idx: number) => {
          const lessonList = Array.isArray(m.lessons) ? m.lessons : [];
          const totalDur = lessonList.reduce((acc: number, l: any) => acc + (l.durationMinutes || 30), 0);
          const totalHours = Math.max(2, Math.round(totalDur / 60));

          return {
            id: `course_${m.id || idx + 1}`,
            domainId,
            goalId: newGoal.id,
            title: m.title || `Khóa học Chặng ${idx + 1}`,
            iconBg: idx === 0 ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" : "bg-purple-500/10 border-purple-500/20 text-purple-400",
            iconColor: idx === 0 ? "#6366f1" : "#a855f7",
            iconType,
            totalLessons: Math.max(1, lessonList.length),
            completedLessons: 0,
            progress: 0,
            timeRemaining: `${totalHours} giờ học`,
            status: idx === 0 ? ("learning" as const) : ("not_started" as const),
            statusText: idx === 0 ? "Đang học" : "Chưa bắt đầu",
            lessonCount: `0/${Math.max(1, lessonList.length)} bài`,
            currentLesson: lessonList[0]?.title || "1.1 Bắt đầu bài học đầu tiên",
          };
        });

        // Tạo chi tiết khóa học thực tế cho từng Milestone từ AI Roadmap (không làm mất danh sách bài học)
        const currentDetails = get().customCourseDetails || {};
        const newDetails: Record<string, any> = { ...currentDetails };

        milestones.forEach((m: any, idx: number) => {
          const courseId = `course_${m.id || idx + 1}`;
          const lessonList = Array.isArray(m.lessons) ? m.lessons : [];
          const quizList = Array.isArray(m.quizzes) ? m.quizzes : [];

          newDetails[courseId] = {
            courseId,
            title: m.title || `Chặng ${idx + 1}`,
            progressPercent: 0,
            chapters: [
              {
                id: `ch_${m.id || idx + 1}_1`,
                title: m.title || `Chương ${idx + 1}: Kiến thức trọng tâm`,
                lessons: [
                  ...lessonList.map((l: any, lIdx: number) => ({
                    id: l.id || `l_${idx + 1}_${lIdx + 1}`,
                    chapterId: `ch_${m.id || idx + 1}_1`,
                    title: l.title || `Bài ${lIdx + 1}`,
                    duration: `${l.durationMinutes || 20}:00`,
                    videoDurationSeconds: (l.durationMinutes || 20) * 60,
                    type: l.type || "video",
                    completed: false,
                    summaryPoints: [
                      `Khái niệm trọng tâm: ${l.title}`,
                      "Nguyên lý và phương pháp vận dụng thực tế",
                      "Ví dụ minh họa và bài tập rèn luyện",
                    ],
                    resources: [
                      { name: `Tài liệu tóm tắt - ${l.title} (PDF)`, type: "pdf", size: "1.5 MB" },
                    ],
                    contentMarkdown: `### ${l.title}\n\nĐang tải bài giảng chi tiết từ AI... Bấm **"AI Biên soạn"** nếu bạn muốn tạo nội dung chuyên sâu ngay lập tức.`,
                    codeSnippet: null,
                    quizzes: [],
                  })),
                  // Bổ sung bài quiz chốt chặng nếu có
                  ...(quizList.length > 0
                    ? quizList.map((q: any, qIdx: number) => ({
                        id: q.id || `quiz_${idx + 1}_${qIdx + 1}`,
                        chapterId: `ch_${m.id || idx + 1}_1`,
                        title: q.title || `Bài kiểm tra Chặng ${idx + 1}`,
                        duration: "15:00",
                        videoDurationSeconds: 900,
                        type: "quiz",
                        completed: false,
                        summaryPoints: [
                          `Đánh giá mức độ nắm vững kiến thức chặng: ${m.title}`,
                          `Số lượng: ${q.questionCount || 5} câu hỏi trắc nghiệm`,
                        ],
                        resources: [],
                        contentMarkdown: `### ${q.title || "Bài kiểm tra đánh giá năng lực"}`,
                        quizzes: [],
                      }))
                    : []),
                ],
              },
            ],
          };
        });

        // Bổ sung môn mới vào danh sách các môn học
        const existingGoals = get().goals || [];
        const updatedGoals = [
          newGoal,
          ...existingGoals.filter((g) => g.id !== newGoal.id && g.title !== newGoal.title),
        ];

        const currentCoursesByGoal = get().coursesByGoal || {};
        const updatedCoursesByGoal = {
          ...currentCoursesByGoal,
          [newGoal.id]: newCourses,
        };

        const currentProfile = get().userProfile;
        set({
          userProfile: { ...currentProfile, domainId },
          goals: updatedGoals,
          activeGoalId: newGoal.id,
          activeGoal: newGoal,
          courses: newCourses,
          coursesByGoal: updatedCoursesByGoal,
          customCourseDetails: newDetails,
          completedLessons: [],
        });

        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            await supabase.auth.updateUser({
              data: {
                learning_domain: domainId,
                goals: updatedGoals,
                active_goal_id: newGoal.id,
                active_goal: newGoal,
                courses: newCourses,
                courses_by_goal: updatedCoursesByGoal,
                custom_course_details: newDetails,
                completed_lessons: [],
              },
            });
          }
        } catch (err) {
          console.warn("Lỗi khi lưu lộ trình AI lên cloud:", err);
        }
      },

      addCustomCourse: async (courseDetail: any, courseMeta: Course) => {
        const currentDetails = get().customCourseDetails || {};
        const updatedDetails = {
          ...currentDetails,
          [courseDetail.courseId]: courseDetail,
        };

        const currentCourses = get().courses || [];
        const existingIdx = currentCourses.findIndex((c) => c.id === courseMeta.id);
        let updatedCourses = [...currentCourses];
        if (existingIdx >= 0) {
          updatedCourses[existingIdx] = courseMeta;
        } else {
          updatedCourses = [courseMeta, ...updatedCourses];
        }

        const activeGoal = get().activeGoal;
        const currentCoursesByGoal = get().coursesByGoal || {};
        const updatedCoursesByGoal = {
          ...currentCoursesByGoal,
          [activeGoal.id]: updatedCourses,
        };

        set({
          customCourseDetails: updatedDetails,
          courses: updatedCourses,
          coursesByGoal: updatedCoursesByGoal,
        });

        try {
          const supabase = createClient();
          const { data: authData } = await supabase.auth.getUser();
          if (authData?.user) {
            await supabase.auth.updateUser({
              data: {
                custom_course_details: updatedDetails,
                courses: updatedCourses,
                courses_by_goal: updatedCoursesByGoal,
              },
            });
          }
        } catch (err) {
          console.warn("Lỗi khi đồng bộ custom course lên cloud:", err);
        }
      },

      updateLessonContent: (courseId: string, lessonId: string, lessonData: any) => {
        const currentDetails = get().customCourseDetails || {};
        const existingCourse = currentDetails[courseId] || getCourseDetail(courseId);
        if (!existingCourse) return;

        const updatedChapters = (existingCourse.chapters || []).map((ch: any) => ({
          ...ch,
          lessons: (ch.lessons || []).map((l: any) => {
            if (l.id === lessonId) {
              return { ...l, ...lessonData };
            }
            return l;
          }),
        }));

        const updatedCourse = {
          ...existingCourse,
          chapters: updatedChapters,
        };

        set({
          customCourseDetails: {
            ...currentDetails,
            [courseId]: updatedCourse,
          },
        });
      },

      setDomain: (domainId: DomainId) => {
        const curriculum = DOMAIN_CURRICULA[domainId] || defaultCurriculum;
        const currentProfile = get().userProfile;
        set({
          userProfile: { ...currentProfile, domainId },
          activeGoal: curriculum.defaultGoal,
          courses: curriculum.courses,
        });
      },

      setUserProfile: (profile: Partial<UserProfile>) => {
        set((state) => ({
          userProfile: { ...state.userProfile, ...profile },
        }));
      },

      resetToFresh: () => {
        const curriculum = DOMAIN_CURRICULA[get().userProfile.domainId] || defaultCurriculum;
        set({
          courses: curriculum.courses,
          activeGoal: curriculum.defaultGoal,
          completedLessons: [],
        });
      },
    }),
    {
      name: "learnverse_storage_v2", // V2 để xóa sạch toàn bộ cache hardcode cũ trong localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        userProfile: state.userProfile,
        goals: state.goals,
        activeGoalId: state.activeGoalId,
        coursesByGoal: state.coursesByGoal,
        activeGoal: state.activeGoal,
        courses: state.courses,
        completedLessons: state.completedLessons,
        customCourseDetails: state.customCourseDetails,
        onboarding: state.onboarding,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
