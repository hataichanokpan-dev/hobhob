"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Calendar, List, BarChart3, Settings, LogOut, Sun, Moon, Monitor, Languages, ChevronDown, Globe, Clock, Trophy, Users, Target, User, Sparkles, Star, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore } from "@/store/use-user-store";
import { useTheme } from "@/components/providers/theme-provider";
import { useLanguageStore } from "@/store/use-language-store";
import { useTranslation } from "@/hooks/use-translation";
import { signOut } from "@/lib/auth/session";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppSidebar({ isOpen, onClose }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile } = useUserStore();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguageStore();
  const { t } = useTranslation();
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  // Close sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  const handleNavigate = (path: string) => {
    router.push(path);
    onClose();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const navItems = [
    {
      icon: Calendar,
      labelKey: "nav.today",
      path: "/today",
      descriptionKey: "navDescriptions.today",
      emoji: "📅",
    },
    {
      icon: List,
      labelKey: "nav.habits",
      path: "/habits",
      descriptionKey: "navDescriptions.habits",
      emoji: "✅",
    },
    {
      icon: Target,
      labelKey: "nav.targets",
      path: "/targets",
      descriptionKey: "navDescriptions.targets",
      emoji: "🎯",
    },
    {
      icon: Users,
      labelKey: "nav.circles",
      path: "/circles",
      descriptionKey: "navDescriptions.circles",
      emoji: "👥",
    },
    {
      icon: Clock,
      labelKey: "nav.history",
      path: "/history",
      descriptionKey: "navDescriptions.history",
      emoji: "📜",
    },
    {
      icon: Trophy,
      labelKey: "nav.leaderboard",
      path: "/leaderboard",
      descriptionKey: "navDescriptions.leaderboard",
      emoji: "🏆",
    },
    {
      icon: BarChart3,
      labelKey: "nav.stats",
      path: "/stats",
      descriptionKey: "navDescriptions.stats",
      emoji: "📊",
    },
    {
      icon: BookOpen,
      labelKey: "nav.doc",
      path: "/doc",
      descriptionKey: "navDescriptions.doc",
      emoji: "📖",
    },
    {
      icon: Settings,
      labelKey: "nav.settings",
      path: "/settings",
      descriptionKey: "navDescriptions.settings",
      emoji: "⚙️",
    },
  ];

  const isActive = (path: string) => pathname === path;

  const languages = [
    { code: "en" as const, name: "English", nativeName: "English", flag: "EN" },
    { code: "th" as const, name: "Thai", nativeName: "ไทย", flag: "🇹🇭" },
  ];

  const currentLanguage = languages.find((lang) => lang.code === language);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-[var(--color-card)] border-r border-[var(--color-border)] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)] relative overflow-hidden">
            {/* Decorative gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/10 via-purple-500/5 to-transparent pointer-events-none" />

            <div className="flex items-center gap-2 relative">
              <div className="relative">
                <img
                  src="/icons/hobhob_v2.png"
                  alt="HobHob"
                  className="w-12 h-12 rounded-lg"
                />
                 
              </div>
              <div>
                <h2 className="font-semibold flex items-center gap-1">
                  {t("nav.menu")}
                   
                </h2>
                <span className="text-xs text-muted-foreground">{t("nav.navigateYourApp")}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="icon-btn relative"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section - Clickable */}
          {user && userProfile && (
            <button
              onClick={() => handleNavigate("/profile")}
              className="p-4 border-b border-[var(--color-border)] w-full text-left hover:bg-[var(--color-muted)]/50 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  {userProfile.photoURL ? (
                    <img
                      src={userProfile.photoURL}
                      alt={userProfile.displayName || "User"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-brand)] shadow-lg shadow-[var(--color-brand)]/20 group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-brand)] via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-lg shadow-[var(--color-brand)]/30 border-2 border-white/20 group-hover:scale-105 transition-transform">
                      {userProfile.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                  )}
                 
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate flex items-center gap-1">
                    {userProfile.displayName}
                     
                  </p>
                  <span className="text-xs text-muted-foreground truncate">{userProfile.email}</span>
                </div>
                <User className="w-5 h-5 text-[var(--color-brand)] group-hover:scale-110 transition-transform" />
              </div>
            </button>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <li key={item.path}>
                    <button
                      onClick={() => handleNavigate(item.path)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative overflow-hidden group ${
                        active
                          ? "bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand)]/80 text-white shadow-lg shadow-[var(--color-brand)]/20"
                          : "hover:bg-[var(--color-muted)] hover:scale-[1.02]"
                      }`}
                    >
                      {active && (
                        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/20 to-transparent animate-pulse" />
                      )}
                      {/* <span className="text-lg relative z-10">{item.emoji}</span> */}
                      <Icon className={`w-5 h-5 relative z-10 ${active ? "text-white" : "text-[var(--color-brand)]"}`} />
                      <div className="flex-1 text-left relative z-10">
                        <p className={`font-semibold ${active ? "text-white" : ""}`}>{t(item.labelKey)}</p>
                        <p className={`text-xs ${active ? "text-white/80" : "text-muted-foreground"}`}>
                          {t(item.descriptionKey)}
                        </p>
                      </div>
                      
                    </button>
                  </li>
                );
              })}
            </ul>

            {/* Theme Switcher */}
            <div className="mt-6">
              <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Sun className="w-3 h-3" />
                {t("theme.theme")}
              </p>
              <div className="flex gap-2 px-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all relative overflow-hidden group ${
                    theme === "light"
                      ? "bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-lg"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 hover:scale-105"
                  }`}
                >
                  {theme === "light" && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  <Sun className={`w-4 h-4 relative z-10 ${theme === "light" ? "text-white" : ""}`} />
                  <span className="text-sm relative z-10">{t("theme.light")}</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all relative overflow-hidden group ${
                    theme === "dark"
                      ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 hover:scale-105"
                  }`}
                >
                  {theme === "dark" && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  <Moon className={`w-4 h-4 relative z-10 ${theme === "dark" ? "text-white" : ""}`} />
                  <span className="text-sm relative z-10">{t("theme.dark")}</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all relative overflow-hidden group ${
                    theme === "system"
                      ? "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 hover:scale-105"
                  }`}
                >
                  {theme === "system" && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                  <Monitor className={`w-4 h-4 relative z-10 ${theme === "system" ? "text-white" : ""}`} />
                  <span className="text-sm relative z-10">{t("theme.auto")}</span>
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="mt-6">
              <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <Globe className="w-3 h-3 text-[var(--color-brand)] animate-pulse" />
                {t("language.title")}
              </p>
              <div className="px-4 relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-all hover:scale-[1.02] border border-transparent hover:border-[var(--color-brand)]/30"
                >
                  <span className="text-lg mr-2">{currentLanguage?.flag}</span>
                  <span className="text-sm font-medium">{currentLanguage?.nativeName}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isLangDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {isLangDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute z-10 w-full mt-2 surface shadow-xl overflow-hidden rounded-xl"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${
                            language === lang.code
                              ? "bg-gradient-to-r from-[var(--color-brand)] to-[var(--color-brand)]/80 text-white"
                              : "hover:bg-[var(--color-muted)]"
                          }`}
                        >
                          <span className="text-lg">{lang.flag}</span>
                          <Languages className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{lang.nativeName}</p>
                            <p className="text-xs text-muted-foreground">{lang.name}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </nav>

          {/* Footer - Sign Out */}
          <div className="p-4 border-t border-[var(--color-border)]">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all hover:scale-[1.02]"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">{t("nav.signOut")}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}