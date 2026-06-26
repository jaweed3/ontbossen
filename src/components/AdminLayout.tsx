import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  LayoutDashboard, BarChart3, FlaskConical,
  BookOpen, LineChart, LogOut, HelpCircle,
  Plus, Menu, X
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "#", icon: BarChart3, label: "Student Progress" },
  { href: "#", icon: FlaskConical, label: "Diagnostics" },
  { href: "#", icon: BookOpen, label: "Curriculum" },
  { href: "#", icon: LineChart, label: "Analytics" },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-void flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64
        bg-surface-container-lowest/95 backdrop-blur-xl border-r border-white/5
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Brand */}
        <div className="px-6 py-6">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-on-primary" />
            </div>
            <h1 className="text-[20px]/[28px] font-bold text-primary">DiagnosaKelas</h1>
          </div>
          <p className="text-xs text-on-surface-variant/60">Mission Control</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all ${
                  isActive
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-white/10"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-4 py-4 space-y-3">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="w-full bg-primary text-on-primary font-bold py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="h-4 w-4" />
            Start Diagnosis
          </Link>
          <div className="pt-3 border-t border-white/5 space-y-1">
            <a href="#" className="flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-lg text-sm transition-all">
              <HelpCircle className="h-5 w-5" />
              <span>Help Center</span>
            </a>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-on-surface-variant hover:text-on-surface rounded-lg text-sm transition-all">
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-4 h-14 border-b border-white/5 bg-surface-container-lowest/80 backdrop-blur-md">
          <button onClick={() => setSidebarOpen(true)} className="text-on-surface-variant">
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
              <FlaskConical className="h-3.5 w-3.5 text-on-primary" />
            </div>
            <span className="text-sm font-bold text-primary">DiagnosaKelas</span>
          </div>
          <div className="w-6" />
        </div>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 lg:p-12 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
