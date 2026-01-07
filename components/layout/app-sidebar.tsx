"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { X, Calendar, List, BarChart3, Settings, LogOut, Sun, Moon, Monitor, Languages, ChevronDown, Globe, Clock, Trophy, Users, Target } from "lucide-react";
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
    },
    {
      icon: List,
      labelKey: "nav.habits",
      path: "/habits",
      descriptionKey: "navDescriptions.habits",
    },
    {
      icon: Target,
      labelKey: "nav.targets",
      path: "/targets",
      descriptionKey: "navDescriptions.targets",
    },
    {
      icon: Users,
      labelKey: "nav.circles",
      path: "/circles",
      descriptionKey: "navDescriptions.circles",
    },
    {
      icon: Clock,
      labelKey: "nav.history",
      path: "/history",
      descriptionKey: "navDescriptions.history",
    },
    {
      icon: Trophy,
      labelKey: "nav.leaderboard",
      path: "/leaderboard",
      descriptionKey: "navDescriptions.leaderboard",
    },
    {
      icon: BarChart3,
      labelKey: "nav.stats",
      path: "/stats",
      descriptionKey: "navDescriptions.stats",
    },
    {
      icon: Settings,
      labelKey: "nav.settings",
      path: "/settings",
      descriptionKey: "navDescriptions.settings",
    },
  ];

  const isActive = (path: string) => pathname === path;

  const languages = [
    { code: "en" as const, name: "English", nativeName: "English" },
    { code: "th" as const, name: "Thai", nativeName: "ไทย" },
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
          <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <img
                src="/icons/hobhob_v2.png"
                alt="HobHob"
                className="w-12 h-12 rounded-lg"
              />
              <div>
                <h2 className="font-semibold">{t("nav.menu")}</h2>
                <p className="text-xs text-muted-foreground">{t("nav.navigateYourApp")}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="icon-btn"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Section */}
          {user && userProfile && (
            <div className="p-4 border-b border-[var(--color-border)]">
              <div className="flex items-center gap-3">
                {userProfile.photoURL ? (
                  <img
                    src={userProfile.photoURL}
                    alt={userProfile.displayName || "User"}
                    className="w-16 h-16 rounded-full object-cover border-2 border-[var(--color-border)]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#ff6a00] to-[#ff9533] flex items-center justify-center text-white font-semibold">
                    {userProfile.displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{userProfile.displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userProfile.email}</p>
                </div>
              </div>
            </div>
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        active
                          ? "bg-[var(--color-brand)] text-white"
                          : "hover:bg-[var(--color-muted)]"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${active ? "text-white" : "text-[var(--color-brand)]"}`} />
                      <div className="flex-1 text-left">
                        <p className={`font-medium ${active ? "text-white" : ""}`}>{t(item.labelKey)}</p>
                        <p className={`text-xs ${active ? "text-white/70" : "text-muted-foreground"}`}>
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
              <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("theme.theme")}
              </p>
              <div className="flex gap-2 px-4">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    theme === "light"
                      ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span className="text-sm">{t("theme.light")}</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    theme === "dark"
                      ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span className="text-sm">{t("theme.dark")}</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all ${
                    theme === "system"
                      ? "bg-[var(--color-foreground)] text-[var(--color-background)]"
                      : "bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span className="text-sm">{t("theme.auto")}</span>
                </button>
              </div>
            </div>

            {/* Language Selector */}
            <div className="mt-6">
              <p className="px-4 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <Globe className="w-3 h-3 inline mr-1" />
                {t("language.title")}
              </p>
              <div className="px-4 relative">
                <button
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-[var(--color-muted)] hover:bg-[var(--color-muted)]/80 transition-all"
                >
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
                      className="absolute z-10 w-full mt-2 surface shadow-xl overflow-hidden"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            setLanguage(lang.code);
                            setIsLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                            language === lang.code
                              ? "bg-[var(--color-brand)] text-white"
                              : "hover:bg-[var(--color-muted)]"
                          }`}
                        >
                          <Languages className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{lang.nativeName}</p>                          
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
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
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