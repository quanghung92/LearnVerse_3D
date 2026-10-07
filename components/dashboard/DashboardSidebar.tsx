"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sparkles,
  Home,
  BookOpen,
  Globe,
  Bot,
  Calendar,
  Trophy,
  BarChart3,
  Search,
  ChevronRight,
  LogOut,
  User,
} from "lucide-react";
import Image from "next/image";
import { useLearningStore } from "@/stores/useLearningStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Trang chủ", href: "/dashboard", icon: Home },
  { label: "Khóa học của tôi", href: "/dashboard/courses", icon: BookOpen },
  { label: "Thế giới 3D", href: "/dashboard/world-3d", icon: Globe, badge: "3D" },
  { label: "AI Studio", href: "/dashboard/ai-studio", icon: Bot, badge: "AI" },
  { label: "Lịch học", href: "/dashboard/schedule", icon: Calendar },
  { label: "Thành tích", href: "/dashboard/achievements", icon: Trophy },
  { label: "Phân tích tiến độ", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Tìm kiếm", href: "/dashboard/search", icon: Search },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const userProfile = useLearningStore((state) => state.userProfile);
  const isAuthenticated = useLearningStore((state) => state.isAuthenticated);
  const initFromSupabase = useLearningStore((state) => state.initFromSupabase);

  useEffect(() => {
    initFromSupabase();
  }, [initFromSupabase]);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      useLearningStore.setState({ isAuthenticated: false });
      router.push("/login");
    } catch (e) {
      console.error("Sign out error:", e);
      router.push("/login");
    }
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-40 select-none">
      {/* Brand Header */}
      <div>
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800/80">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-md shadow-indigo-500/25 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              LearnVerse
            </span>
          </Link>
          <button
            type="button"
            className="w-7 h-7 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-colors cursor-pointer"
            title="Thu gọn sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Widget (Bám sát thiết kế Screen 4 với Data thật) */}
      <div className="p-3 border-t border-slate-800/80">
        <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-slate-800 transition-colors cursor-pointer group">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/40 shrink-0 bg-slate-700 flex items-center justify-center">
            {userProfile.avatarUrl ? (
              <Image
                src={userProfile.avatarUrl}
                alt={userProfile.displayName}
                fill
                unoptimized
                className="object-cover"
              />
            ) : (
              <Image
                src="/images/student-companion.jpg"
                alt={userProfile.displayName}
                fill
                className="object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition-colors">
              {userProfile.displayName}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
              <span>Level {userProfile.level}</span>
              <span>•</span>
              <span>{userProfile.xp.toLocaleString()} XP</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-8 h-8 rounded-lg hover:bg-slate-700/60 flex items-center justify-center text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
            title={isAuthenticated ? "Đăng xuất" : "Đăng nhập"}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
