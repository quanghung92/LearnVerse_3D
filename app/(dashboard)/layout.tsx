import type { Metadata } from "next";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

export const metadata: Metadata = {
  title: "Dashboard - LearnVerse 3D",
  description: "Bảng điều khiển học tập cá nhân hóa đa chiều LearnVerse",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col md:flex-row text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Left Sidebar */}
      <DashboardSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#090d16]">
        {children}
      </div>
    </div>
  );
}
