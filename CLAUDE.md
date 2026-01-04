# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: HobHob - Habit Tracker Web App

A mobile-first Habit Tracker with blur.io-inspired dark glassmorphism UI, built with Next.js 15 and Firebase Realtime Database.

---

## Quick Start Commands

```bash
# Development
npm run dev

# Build production
npm run build

# Run production build
npm start

# Lint
npm run lint

# Deploy Firebase security rules
firebase deploy --only database:rules

# Type checking
npx tsc --noEmit
```

---

## Architecture Overview

### Directory Structure (Key Patterns)

```
app/
├── (auth)/           # Unauthenticated routes (sign-in)
│   └── layout.tsx    # Centered layout, no bottom nav
├── (app)/            # Protected routes (requires auth)
│   ├── today/        # Main page: check-in habits
│   ├── habits/       # Habit CRUD
│   ├── stats/        # Statistics dashboard
│   ├── settings/     # User settings
│   └── layout.tsx    # Bottom nav layout
└── page.tsx          # Root: redirect based on auth state

lib/
├── firebase/         # Firebase client init
├── auth/             # Session helpers, middleware
├── db/               # Realtime DB operations
└── utils/            # Date, streak calculations

store/
└── use-*.store.ts    # Zustand stores (user, habits)
```

### Route Groups Pattern
- `(auth)` - Public routes for authentication
- `(app)` - Protected routes requiring valid Firebase session
- Middleware checks auth and redirects accordingly

---

## Firebase Integration

### Data Model Structure

```
/users/{uid}
  /profile           # User metadata
  /habits/{habitId}  # Habit definitions
  /checkins/{date}   # Daily checkin records: {habitId: boolean}
  /stats/{habitId}   # Cached streak calculations
```

### Key Design Decisions
1. **Denormalized per-user**: Each user's data is self-contained for security and query speed
2. **Checkins by date**: `/checkins/2025-01-03/` enables single-path read for "Today" view
3. **Stats cache**: Pre-calculated streaks avoid expensive client recomputation
4. **Security rules**: All data under `/users/{uid}/` for easy `auth.uid == $uid` validation

### Firebase Auth Flow
- Client-side Firebase Auth with Google provider
- ID token verified server-side for sensitive operations (Server Actions)
- Session state managed via Zustand store
- Middleware protects routes

---

## UI Design System (blur.io Style)

### Core Design Tokens
```typescript
colors: {
  background: '#0a0a0b',      // Deep black
  surface: '#111113',          // Card backgrounds
  accent: gradient(purple to pink)
}
```

### Glassmorphism Pattern
```tsx
// Standard card/surface
className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl"
```

### Component Conventions
- **HabitCard**: Glass surface, subtle hover lift
- **CheckinToggle**: Animated circle, color transition on state change
- **BottomNav**: Fixed bottom, glass with blur, icons with active glow
- **Modal/Drawer**: Use shadcn Dialog for consistency

---

## State Management

### Zustand Stores
```typescript
// use-user-store.ts - Auth state
interface UserStore {
  user: User | null
  habits: Habit[]
  isLoading: boolean
  // Actions: setUser, setHabits, logout
}

// Usage in components
const { user, habits } = useUserStore()
```

### Data Flow Patterns
1. **Auth state**: Firebase listener → Zustand store → Components
2. **Habits**: RTDB listener → Zustand store → Components
3. **Checkins**: Optimistic UI → Firebase update → Error handling with rollback

---

## Optimistic UI Pattern

For check-ins and habit updates, use this pattern:

```typescript
// 1. Save previous state
const previousState = get(store)

// 2. Update UI immediately (optimistic)
setOptimisticState(newValue)

try {
  // 3. Sync to Firebase
  await firebase.update(path, newValue)
  // 4. Update dependent stats
  await updateStats()
} catch {
  // 5. Rollback on failure
  set(store, previousState)
  toast.error('Failed to save')
}
```

---

## Date Handling

- **Storage format**: UTC as `yyyy-mm-dd` strings
- **Display format**: User's timezone (stored in profile)
- **"Today" determination**: Based on user's timezone, not UTC
- **Libraries**: `date-fns` + `date-fns-tz`

Example:
```typescript
// Get today's date string in user's timezone
const today = formatInTimeZone(new Date(), userTimezone, 'yyyy-MM-dd')
```

---

## PWA Configuration

This is a Progressive Web App:
- Manifest in `public/manifest.json`
- Service worker configured in `next.config.js` with `next-pwa`
- Install prompt handled on mobile devices
- Icons in `public/icons/`

---

## Common Tasks

### Adding a new Firebase DB operation
1. Add function to `lib/db/` (e.g., `habits.ts`, `checkins.ts`)
2. Use Firebase SDK methods: `set()`, `update()`, `remove()`, `onValue()`
3. Handle errors appropriately
4. Update security rules if needed

### Adding a new page/route
1. Create in appropriate route group: `app/(auth)/` or `app/(app)/`
2. Use correct layout (auth layouts don't have bottom nav)
3. Add middleware protection if in `(app)` group

### Adding a new UI component
1. For reusable components: `components/ui/` (often shadcn/ui)
2. For feature components: `components/features/{feature}/`
3. Follow glassmorphism pattern: `bg-white/5 backdrop-blur-xl`
4. Use Tailwind utilities for styling

### Updating security rules
1. Edit `firestore.rules`
2. Test with Firebase emulator: `firebase emulators:start`
3. Deploy: `firebase deploy --only database:rules`

---

## File Naming Conventions

- React components: `kebab-case.tsx` (e.g., `habit-card.tsx`)
- Utilities: `kebab-case.ts` (e.g., `date-helpers.ts`)
- Stores: `use-kebab-case.store.ts` (e.g., `use-user-store.ts`)
- Types: `index.ts` in `types/` directory

---

## Testing Checklist Before Commit

- [ ] Works on mobile viewport (375px width)
- [ ] Auth flow works (login/logout)
- [ ] Optimistic UI updates correctly
- [ ] Errors display toast messages
- [ ] No console errors
- [ ] TypeScript compiles without errors

---

## Deployment

### Frontend (Vercel)
1. Push to main branch
2. Vercel auto-deploys
3. Environment variables configured in Vercel dashboard

### Firebase
1. Security rules: `firebase deploy --only database:rules`
2. Auth configuration: Done in Firebase Console
3. Database indexes: Created via Firebase Console if needed

---

## Important Notes

- **Never use `allow read/write: true`** in security rules
- **All user data is scoped to `/users/{uid}/`**
- **Optimistic UI is required for check-ins** (instant feedback)
- **Mobile-first design**: Test on small screens first
- **Dark mode only**: No light mode variant needed
