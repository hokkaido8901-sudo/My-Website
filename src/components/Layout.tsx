import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Trophy,
  Medal,
  Shield,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  ChevronRight,
  Zap,
  UserCircle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { href: "/dashboard", label: "Хяналтын самбар", icon: LayoutDashboard },
  { href: "/competitions", label: "Тэмцээнүүд", icon: Trophy },
  { href: "/leaderboard", label: "Рейтинг", icon: Medal },
  { href: "/profile", label: "Миний профайл", icon: UserCircle },
];

const adminItems = [
  { href: "/admin", label: "Админ панел", icon: Shield },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, profile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const allItems = profile?.role === "admin"
    ? [...navItems, ...adminItems]
    : navItems;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">ҮУПК</h1>
          <p className="text-xs text-muted-foreground">Арга Хэмжээ</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {allItems.map((item) => {
          const Icon = item.icon;
          const active = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                  active
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                data-testid={`nav-${item.href.slice(1)}`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
                {active && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent">
          <Avatar className="w-9 h-9">
            <AvatarImage src={profile?.photoURL} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
              {profile?.displayName?.[0] || "У"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {profile?.displayName || "Хэрэглэгч"}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile?.role === "admin" ? "Админ" : "Суралцагч"} • {profile?.points || 0} оноо
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={logout}
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4" />
          Гарах
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-sidebar border-r border-sidebar-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-sidebar border-r border-sidebar-border z-50 md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top navbar */}
        <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card/50 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              data-testid="button-menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="hidden md:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">Онлайн</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            <Badge variant="outline" className="hidden sm:flex gap-1 font-semibold">
              <Zap className="w-3 h-3 text-primary" />
              {profile?.points || 0} оноо
            </Badge>
            <Link href="/profile">
              <Avatar className="w-9 h-9 cursor-pointer ring-2 ring-transparent hover:ring-primary transition-all duration-200" data-testid="nav-avatar-profile">
                <AvatarImage src={profile?.photoURL} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-sm font-bold">
                  {profile?.displayName?.[0] || "У"}
                </AvatarFallback>
              </Avatar>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto gradient-bg">
          {children}
        </main>
      </div>
    </div>
  );
}
