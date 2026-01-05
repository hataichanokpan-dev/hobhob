"use client";

export function AppFooter() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] bg-[var(--color-card)]">
      <div className="px-4 py-2">
        <div className="flex flex-col items-center gap-1">
          {/* Logo and tagline - minimal */}
          <div className="flex items-center gap-1.5">
            <img
              src="/icons/hobhob_v2.png"
              alt="HobHob"
              className="w-4 h-4 rounded-sm opacity-80"
            />
            <span className="text-xs text-muted-foreground">Small steps, big changes</span>
          </div>

          {/* Copyright - minimal */}
          <span className="text-[10px] text-muted-foreground/60">
            © {new Date().getFullYear()} HobHob
          </span>
        </div>
      </div>
    </footer>
  );
}
