/**
 * Coming Soon Page
 * Temporary landing page until auth is implemented
 */
export default function ComingSoonPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl glass flex items-center justify-center">
          <span className="text-4xl">🎯</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold gradient-text">HobHob</h1>
          <p className="text-muted-foreground">Build better habits, one day at a time.</p>
        </div>

        <div className="glass-card p-6 space-y-4">
          <div className="text-sm text-muted-foreground space-y-2">
            <p>✨ Mobile-first habit tracker</p>
            <p>🔥 Track streaks and progress</p>
            <p>🌙 Beautiful dark glassmorphism UI</p>
            <p>🔒 Secure with Firebase</p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-muted-foreground">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
