"use client";

import { ArrowLeft, Sparkles, Star, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/use-translation";
import { BookOpen, Calendar, List, Target, Users, Clock, Trophy, BarChart3, User, Lightbulb } from "lucide-react";
import { translations } from "@/lib/i18n/translations";
import { useLanguageStore } from "@/store/use-language-store";

export default function DocPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const sectionIcons: Record<string, React.ElementType> = {
    today: Calendar,
    habits: List,
    targets: Target,
    circles: Users,
    history: Clock,
    leaderboard: Trophy,
    stats: BarChart3,
    profile: User,
  };

  const sections: Array<{ key: string; icon: React.ElementType }> = [
    { key: "today", icon: Calendar },
    { key: "habits", icon: List },
    { key: "targets", icon: Target },
    { key: "circles", icon: Users },
    { key: "history", icon: Clock },
    { key: "leaderboard", icon: Trophy },
    { key: "stats", icon: BarChart3 },
    { key: "profile", icon: User },
  ];

  // Get the doc translations object directly
  const docTranslations = translations[language].doc;

  return (
    <div className="min-h-screen pb-24 bg-gradient-to-b from-[var(--color-background)] via-[var(--color-muted)]/10 to-[var(--color-muted)]/20">
      {/* Header */}
      <div className="px-4 pt-4 pb-2 sticky top-0 z-10 bg-[var(--color-background)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="icon-btn"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[var(--color-brand)]" />
            <h1 className="text-xl font-semibold">{docTranslations.title}</h1>
            <Sparkles className="w-4 h-4 text-yellow-400" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-1 ml-8">
          {docTranslations.subtitle}
        </p>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-2xl mx-auto">
        {/* Welcome Section */}
        <div className="surface p-6 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[var(--color-brand)]/20 to-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-4xl animate-bounce">🎉</span>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[var(--color-brand)] to-purple-500 bg-clip-text text-transparent">
                {docTranslations.welcome.title}
              </h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              {docTranslations.welcome.description}
            </p>
          </div>
        </div>

        {/* How to Use Sections */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            {docTranslations.title}
          </h3>
          <div className="space-y-4">
            {sections.map((section) => {
              const Icon = section.icon;
              const sectionData = docTranslations.sections[section.key as keyof typeof docTranslations.sections];

              return (
                <div
                  key={section.key}
                  className="surface p-5 rounded-3xl hover:scale-[1.01] hover:shadow-xl transition-all duration-300 group relative overflow-hidden"
                >
                  {/* Decorative gradient */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-brand)]/5 via-purple-500/5 to-[var(--color-brand)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Sparkle decorations */}
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Star className="w-3 h-3 text-yellow-400/50" />
                  </div>

                  <div className="relative">
                    {/* Section Header */}
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--color-brand)]/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                        <span className="text-2xl">{sectionData.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-base mb-1 flex items-center gap-2">
                          {sectionData.title}
                          <Icon className="w-4 h-4 text-[var(--color-brand)] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {sectionData.description}
                        </p>
                      </div>
                    </div>

                    {/* How to Use List */}
                    <div className="space-y-2 mt-4">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                        <Check className="w-3 h-3" />
                        How to use:
                      </p>
                      {sectionData.howToUse.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 text-sm p-2 rounded-lg bg-[var(--color-muted)]/30 hover:bg-[var(--color-muted)]/50 transition-colors"
                        >
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-brand)]/20 text-[var(--color-brand)] flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="flex-1 leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips Section */}
        <div className="surface p-6 rounded-3xl relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-yellow-500/20 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400" />
              {docTranslations.tips.title}
            </h3>
            <div className="space-y-3">
              {docTranslations.tips.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-lg flex-shrink-0">✨</span>
                  <p className="text-sm leading-relaxed flex-1">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="text-center p-6">
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4 text-[var(--color-brand)]" />
            <span>Ready to start? Small steps lead to big changes! 🚀</span>
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
