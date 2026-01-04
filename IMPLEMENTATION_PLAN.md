# HobHob - Habit Tracker Implementation Plan

## Project Overview
A mobile-first Habit Tracker web app with blur.io-inspired dark glassmorphism UI, built with Next.js and Firebase Realtime Database.

---

## MVP Definition

### Core Features (v1.0)
- Google Authentication (Login/Logout)
- Habit CRUD (Create, Read, Update, Delete)
  - Fields: name, icon, color, frequency (daily/weekly), isActive
- Daily Check-in (One-tap Done/Not done)
- Statistics Dashboard
  - Current streak / Best streak
  - 7-day & 30-day completion rates
  - Calendar/heatmap view (30 days)
- Mobile-first UI with dark blur gradient theme

### Phase 2 Features (Future)
- Push notifications / reminders
- Offline-first with sync
- Social features (share habits, groups)
- Advanced insights (trends, detailed analytics)

---

## Architecture Overview

```
hobhob/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group (sign-in page)
│   │   └── sign-in/
│   │       └── page.tsx
│   │       └── layout.tsx        # Auth layout (centered, no nav)
│   ├── (app)/                    # Main app group (protected routes)
│   │   ├── today/                # Home: Today's habits + check-in
│   │   ├── habits/               # Manage habits (CRUD)
│   │   ├── stats/                # Statistics dashboard
│   │   ├── settings/             # User settings
│   │   └── layout.tsx            # App layout (bottom nav)
│   ├── layout.tsx                # Root layout (theme provider)
│   └── page.tsx                  # Root redirect to sign-in or app
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── features/
│   │   ├── auth/
│   │   │   └── google-sign-in-button.tsx
│   │   ├── habits/
│   │   │   ├── habit-card.tsx
│   │   │   ├── habit-form.tsx
│   │   │   ├── habit-list.tsx
│   │   │   └── checkin-toggle.tsx
│   │   └── stats/
│   │       ├── streak-display.tsx
│   │       ├── completion-rate.tsx
│   │       └── calendar-heatmap.tsx
│   └── layout/
│       ├── bottom-nav.tsx
│       └── header.tsx
├── lib/
│   ├── firebase/
│   │   ├── client.ts             # Firebase client initialization
│   │   ├── admin.ts              # Firebase admin (server-side)
│   │   └── config.ts             # Firebase config
│   ├── auth/
│   │   ├── session.ts            # Session helpers
│   │   └── middleware.ts         # Auth middleware
│   ├── db/
│   │   ├── habits.ts             # Habit CRUD operations
│   │   ├── checkins.ts           # Check-in operations
│   │   └── stats.ts              # Stats calculations
│   └── utils/
│       ├── date.ts               # Date helpers (timezone aware)
│       └── streak.ts             # Streak calculation logic
├── store/
│   └── use-user-store.ts         # Zustand store (user, habits state)
├── types/
│   └── index.ts                  # TypeScript types
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── icons/                    # App icons
│   └── sw.js                     # Service worker (Phase 2)
├── firebase.json                 # Firebase config
├── firestore.rules               # RTDB security rules
├── next.config.js                # Next.js config (PWA)
├── tailwind.config.ts            # Tailwind + design tokens
└── .env.local                    # Environment variables (gitignored)
```

---

## Data Model (Firebase Realtime Database)

```
{
  "users": {
    "{uid}": {
      "profile": {
        "email": string,
        "displayName": string,
        "photoURL": string,
        "timezone": string,
        "createdAt": timestamp,
        "lastLoginAt": timestamp
      },
      "habits": {
        "{habitId}": {
          "name": string,
          "icon": string,           // emoji or icon name
          "color": string,          // hex or tailwind class
          "frequency": "daily" | "weekly",
          "targetDays": number[],   // for weekly: [1,2,3,4,5,6,7] (Mon=0)
          "isActive": boolean,
          "createdAt": timestamp,
          "updatedAt": timestamp
        }
      },
      "checkins": {
        "{yyyy-mm-dd}": {          // e.g., "2025-01-03"
          "{habitId}": true | false,
          "{habitId}": true | false
        }
      },
      "stats": {
        "{habitId}": {
          "currentStreak": number,
          "bestStreak": number,
          "totalCheckins": number,
          "lastUpdated": timestamp
        }
      }
    }
  }
}
```

### Why This Structure?
- **Denormalized for fast queries**: Each user's data is self-contained
- **Checkins by date**: Efficient for "Today" view (single path read)
- **Stats cache**: Pre-calculated streaks avoid expensive client calculations
- **User isolation**: All data under `/users/{uid}/` for security rules

---

## Firebase Security Rules

```javascript
// firestore.rules
{
  "rules": {
    "users": {
      "$uid": {
        // Users can read/write their own data if authenticated
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid",

        "profile": {
          // Validate profile structure
          ".validate": "newData.hasChildren(['email', 'displayName'])",
          "email": { ".validate": "newData.isString()" },
          "displayName": { ".validate": "newData.isString() && newData.val().length > 0" },
          "timezone": { ".validate": "newData.isString()" }
        },

        "habits": {
          "$habitId": {
            ".validate": "newData.hasChildren(['name', 'frequency', 'isActive'])",
            "name": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 50" },
            "frequency": { ".validate": "newData.val() == 'daily' || newData.val() == 'weekly'" },
            "color": { ".validate": "newData.isString()" },
            "isActive": { ".validate": "newData.isBoolean()" }
          }
        },

        "checkins": {
          "$date": {
            "$habitId": {
              ".validate": "newData.isBoolean() || newData.isNull()"
            }
          }
        },

        "stats": {
          "$habitId": {
            "currentStreak": { ".validate": "newData.isNumber() && newData.val() >= 0" },
            "bestStreak": { ".validate": "newData.isNumber() && newData.val() >= 0" }
          }
        }
      }
    }
  }
}
```

---

## Design System (blur.io Inspired)

### Design Tokens (Tailwind Config)

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0b',        // Deep black
          surface: '#111113',          // Slightly lighter
          elevated: '#18181b',         // Card background
        },
        border: {
          DEFAULT: 'rgba(255, 255, 255, 0.08)',
          hover: 'rgba(255, 255, 255, 0.12)',
        },
        accent: {
          purple: '#8b5cf6',
          blue: '#3b82f6',
          pink: '#ec4899',
          gradient: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'glass': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
      },
      backdropBlur: {
        glass: '20px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease-out',
      }
    }
  }
}
```

### Component Styles

| Component | Style |
|-----------|-------|
| **Page Background** | Dark gradient + ambient glow orbs |
| **Card/Surface** | `bg-white/5 backdrop-blur-xl border border-white/10` |
| **Primary Button** | Gradient accent + subtle glow |
| **Habit Card** | Glass + hover lift effect |
| **Check-in Toggle** | Animated circle with color transition |
| **Bottom Nav** | Glass with blur, icons with active glow |

---

## Implementation Steps

### Step 1: Bootstrap Project
- [ ] Initialize Next.js with TypeScript, Tailwind, ESLint
- [ ] Install dependencies: firebase, zustand, date-fns, lucide-react
- [ ] Setup shadcn/ui (init + add: button, card, dialog, toast, bottom-sheet)
- [ ] Configure Tailwind with design tokens
- [ ] Create base layouts (root, auth, app)
- [ ] Setup PWA manifest and config

### Step 2: Firebase Setup
- [ ] Create Firebase project
- [ ] Enable Authentication (Google provider)
- [ ] Enable Realtime Database
- [ ] Configure OAuth consent screen & allowed domains
- [ ] Add Firebase SDK config to `.env.local`
- [ ] Setup Firebase client initialization
- [ ] Write and deploy security rules
- [ ] Test auth flow locally

### Step 3: Google Authentication
- [ ] Create sign-in page with Google button
- [ ] Implement Firebase Auth hooks
- [ ] Create user session store (Zustand)
- [ ] Add auth middleware/redirect logic
- [ ] Handle auth state changes
- [ ] Add logout functionality

### Step 4: Habit CRUD
- [ ] Create habit type definitions
- [ ] Implement DB functions (create, read, update, delete)
- [ ] Build HabitForm component (modal/drawer)
- [ ] Create HabitList component
- [ ] Add optimistic UI for updates
- [ ] Add validation and error handling
- [ ] Test CRUD operations with Firebase

### Step 5: Today Page + Check-ins
- [ ] Query active habits for today
- [ ] Load today's checkins
- [ ] Build HabitCard with check-in toggle
- [ ] Implement optimistic check-in (instant UI, then sync)
- [ ] Handle sync failures with rollback
- [ ] Add toast notifications
- [ ] Calculate and display daily progress

### Step 6: Stats & Streaks
- [ ] Implement streak calculation logic
- [ ] Create stats computation functions
- [ ] Build Stats page layout
- [ ] Add StreakDisplay component (current/best)
- [ ] Add CompletionRate component (7/30 day)
- [ ] Create CalendarHeatmap component
- [ ] Cache stats in DB on check-in
- [ ] Add animations for stat updates

### Step 7: Settings Page
- [ ] Display user profile info
- [ ] Add timezone selector
- [ ] Implement export data function
- [ ] Add account deletion
- [ ] Add logout button
- [ ] Link to privacy/terms

### Step 8: Polish & PWA
- [ ] Add micro-interactions (hover, press, transitions)
- [ ] Optimize for mobile (touch targets, spacing)
- [ ] Complete PWA setup (manifest, icons, install prompt)
- [ ] Add loading states
- [ ] Improve error messages
- [ ] Add empty states
- [ ] Performance optimization

### Step 9: Testing & Deployment
- [ ] Test on actual mobile devices
- [ ] Test auth flows thoroughly
- [ ] Verify security rules (test with different users)
- [ ] Deploy frontend to Vercel
- [ ] Verify environment variables
- [ ] Test production build
- [ ] Setup Firebase Analytics (optional)

---

## Technology Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Radix UI + Tailwind) |
| State Management | Zustand |
| Backend | Firebase Realtime Database |
| Authentication | Firebase Auth (Google) |
| Date Handling | date-fns + date-fns-tz |
| Icons | Lucide React |
| Deployment | Vercel |
| PWA | next-pwa |

---

## Key Implementation Notes

### Optimistic UI Pattern
```typescript
// Check-in with optimistic update
const handleCheckIn = async (habitId: string, date: string) => {
  const previousState = get(habitState); // Save current state

  // 1. Update UI immediately
  setOptimisticState(habitId, true);

  try {
    // 2. Sync to Firebase
    await updateCheckin(uid, habitId, date, true);
    // 3. Update stats
    await updateStreakStats(uid, habitId);
  } catch (error) {
    // 4. Rollback on failure
    set(habitState, previousState);
    toast.error('Failed to save. Please try again.');
  }
};
```

### Date Handling Strategy
- Always store dates in UTC as `yyyy-mm-dd` format
- Convert to user's timezone for display
- Use `date-fns-tz` for timezone-aware operations
- "Today" is determined by user's timezone setting

### Auth Flow
1. Unauthenticated users redirected to `/sign-in`
2. Google Sign-In with Firebase Auth
3. On success, create user profile in DB if not exists
4. Redirect to `/today`
5. Listen to auth state changes for auto-logout

### Performance Considerations
- Listen to specific paths only (`/users/{uid}/habits`, not entire DB)
- Cache frequently accessed data (habits, today's checkins)
- Use pagination for stats (load 30 days initially)
- Debounce habit updates (prevent excessive DB writes)
- Lazy load stats calendar

---

## MVP Done Checklist

- [ ] Mobile-first UI works with one-handed use
- [ ] Google login/logout functional
- [ ] Create/Edit/Delete habits working
- [ ] Daily check-in smooth with optimistic UI
- [ ] Stats display: streak, completion rate, heatmap
- [ ] Security rules properly restrict data by uid
- [ ] PWA installable on mobile
- [ ] No console errors in production
- [ ] Tested on iOS Safari and Chrome Android

---

## Firebase Project Setup Commands

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in project
firebase init

# Deploy security rules
firebase deploy --only database:rules

# Open Firebase console
firebase open
```

---

## Environment Variables (.env.local)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```
