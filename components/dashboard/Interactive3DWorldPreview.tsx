"use client";

import Link from "next/link";
import Image from "next/image";
import { Compass, ArrowRight, Sparkles } from "lucide-react";

export default function Interactive3DWorldPreview() {
  return (
    <Link
      href="/dashboard/world-3d"
      className="group relative block w-full h-[280px] sm:h-[320px] rounded-3xl overflow-hidden border border-indigo-500/30 hover:border-indigo-400/60 shadow-2xl transition-all duration-300 hover:shadow-indigo-500/20 cursor-pointer"
    >
      {/* 1. Crystal Clear 3D Floating Island Artwork (Không bị che khuất) */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/floating-island-3d.jpg"
          alt="Đảo Tri Thức LearnVerse 3D"
          fill
          priority
          className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* Subtle cinematic vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40 pointer-events-none" />
      </div>

      {/* 2. Top Minimal Badge (Gọn gàng ở góc) */}
      <div className="relative z-10 p-4 flex items-center justify-between pointer-events-none">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/15 text-xs font-bold text-white shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Đảo Tri Thức 3D</span>
        </div>
      </div>

      {/* 3. Bottom Minimal Bar (Trong suốt, tinh tế) */}
      <div className="absolute bottom-0 inset-x-0 z-10 p-4 flex items-center justify-between text-white pointer-events-none">
        <div>
          <h4 className="text-sm font-bold text-white drop-shadow-md">
            Học viện Đảo Tri Thức
          </h4>
          <p className="text-[11px] text-slate-300 drop-shadow-sm">
            Nhấn để vào khám phá toàn cảnh 3D
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/90 group-hover:bg-indigo-500 backdrop-blur-md text-xs font-bold shadow-lg transition-all group-hover:translate-x-1">
          <Compass className="w-4 h-4" />
          <span>Vào xem 3D</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </Link>
  );
}
