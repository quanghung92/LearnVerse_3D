"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, Sparkles, BookOpen } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSocialLoading, setIsSocialLoading] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName || !email || !password) {
      toast.error("Vui lòng điền đầy đủ các thông tin");
      return;
    }

    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        toast.error("Đăng ký không thành công: " + error.message);
        return;
      }

      toast.success("Đăng ký tài khoản thành công! Bạn có thể bắt đầu ngay.");
      router.push("/onboarding");
      router.refresh();
    } catch {
      toast.error("Đã xảy ra lỗi không xác định");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: "google" | "github") => {
    try {
      setIsSocialLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) {
        toast.error(`Đăng ký qua ${provider} thất bại: ` + error.message);
      }
    } catch {
      toast.error("Lỗi kết nối xác thực");
    } finally {
      setIsSocialLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-100 font-sans">
      {/* Cột trái: Form Đăng Ký */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16 z-10 overflow-y-auto">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            LearnVerse
          </span>
        </div>

        {/* Nội dung chính Form */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Tạo tài khoản mới
            </h1>
            <p className="text-sm sm:text-base text-slate-400">
              Bắt đầu hành trình khám phá thế giới tri thức 3D tương tác
            </p>
          </div>

          {/* Social Sign up */}
          <div className="space-y-2.5 mb-5">
            <button
              type="button"
              onClick={() => handleSocialLogin("google")}
              disabled={isSocialLoading !== null || isLoading}
              className="w-full h-10 px-4 flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-slate-700 shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.87c2.27-2.09 3.675-5.17 3.675-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.87-3.05c-1.08.72-2.45 1.16-4.06 1.16-3.13 0-5.78-2.11-6.73-4.96H1.28v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.27 14.24c-.25-.72-.39-1.49-.39-2.24 0-.75.14-1.52.39-2.24V6.61H1.28C.46 8.23 0 10.06 0 12s.46 3.77 1.28 5.39l3.99-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.28 6.61l3.99 3.15c.95-2.85 3.6-4.96 6.73-4.96z"
                />
              </svg>
              <span>Đăng ký với Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin("github")}
              disabled={isSocialLoading !== null || isLoading}
              className="w-full h-10 px-4 flex items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 text-sm font-medium text-slate-200 transition-all duration-200 hover:border-slate-700 shadow-sm disabled:opacity-50"
            >
              <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>Đăng ký với GitHub</span>
            </button>
          </div>

          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <span className="relative bg-slate-950 px-4 text-xs uppercase tracking-wider text-slate-500">
              hoặc
            </span>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <label
                htmlFor="displayName"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Họ và tên
              </label>
              <input
                id="displayName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-xs font-medium text-slate-300 mb-1"
              >
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="w-full h-10 px-3.5 rounded-xl border border-slate-800 bg-slate-900/80 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-medium text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/45 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Đăng ký tài khoản</span>
            </button>
          </form>

          <p className="text-center text-xs sm:text-sm text-slate-400 mt-5">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline transition-colors"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>

        <div className="text-xs text-slate-600 flex items-center justify-between pt-3 border-t border-slate-900">
          <span>© 2026 LearnVerse 3D</span>
          <span>Bảo mật • Điều khoản</span>
        </div>
      </div>

      {/* Cột phải: 3D Visual Hero */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 overflow-hidden bg-slate-900">
        <Image
          src="/images/auth-hero.jpg"
          alt="LearnVerse 3D Learning Universe"
          fill
          priority
          className="object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-slate-950/40 pointer-events-none" />
        <div className="absolute inset-0 bg-indigo-950/20 mix-blend-overlay pointer-events-none" />

        <div className="absolute top-8 right-8 z-10 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Vũ trụ học tập không giới hạn</span>
        </div>

        <div className="absolute bottom-8 left-8 right-8 z-10">
          <div className="max-w-xl mx-auto rounded-2xl p-6 bg-slate-900/70 backdrop-blur-xl border border-white/10 shadow-2xl space-y-3">
            <p className="text-base sm:text-lg font-medium text-slate-100 leading-relaxed italic">
              “Đầu tư vào tri thức luôn mang lại lãi suất cao nhất.”
            </p>
            <p className="text-xs sm:text-sm font-medium text-indigo-300">
              — Benjamin Franklin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
