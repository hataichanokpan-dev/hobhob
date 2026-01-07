# 🎯 HobHob

<div align="center">

**A beautiful mobile-first habit & goal tracker with dark glassmorphism UI**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Build better habits, achieve your goals, one day at a time.**

[Features](#-features) • [Quick Start](#-quick-start) • [Screenshots](#-screenshots) • [Deployment](#-deployment)

</div>

---

## ✨ Features

### 📋 Habit Tracking
- ✅ **Daily Check-ins** - One-tap habit tracking with optimistic UI updates
- 🎨 **Customization** - Personalize habits with custom icons and colors
- 📅 **Smart Scheduling** - Set frequency (daily, weekly, weekends, etc.)
- 🔥 **Streak Tracking** - Build and maintain consistency streaks
- 📊 **Progress Visualization** - See your journey at a glance

### 🎯 Goal Targets
- 🎯 **Time-Based Goals** - Set targets with flexible time windows (weekly, monthly, custom)
- 🔄 **Recurring Targets** - Create repeating goals that reset automatically
- 📝 **Success Criteria** - Define what completion looks like for each target
- 📈 **Progress Tracking** - Monitor your target completion over time
- 🏆 **Achievement System** - Celebrate when you reach your goals

### 👥 Social Circles
- 👥 **Habit Circles** - Join circles to track habits together with friends
- 🌍 **Public Circles** - Discover and join circles created by the community
- 🔗 **Easy Sharing** - Share your habit circles with anyone via unique codes
- 📊 **Group Progress** - See how many circle members completed habits today

### 📊 Statistics & Insights
- 📅 **30-Day Calendar** - Visual heatmap showing your consistency
- 📈 **Completion Rates** - Track your overall success percentage
- 📉 **Streak Analysis** - See your longest streaks and current runs
- 🎨 **Beautiful Charts** - Visualize your progress with stunning graphics

### ⚙️ User Experience
- 🌐 **Multi-Language** - Full support for English and Thai
- 🌍 **Timezone Aware** - Proper date handling across all time zones
- 📱 **Mobile-First** - Optimized for one-handed use on any device
- 🌙 **Dark Glassmorphism** - Beautiful blur.io-inspired interface
- 🔔 **Smart Notifications** - Circle completion notifications

### 🛠️ Technical
- ⚡ **Real-time Sync** - Firebase Realtime Database for instant updates across devices
- 💾 **PWA Support** - Install on home screen for native app experience
- 🔒 **Secure** - Comprehensive Firebase security with validation
- ♿ **Accessible** - WCAG compliant with keyboard navigation support
- 🎨 **Tailwind CSS v4** - Modern, performance-optimized styling

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** package manager
- **Firebase** account ([firebase.google.com](https://firebase.google.com))

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/hataichanokpan-dev/hobhob.git
cd hobhob

# Install dependencies
npm install
```

### 2. Environment Setup

Create a `.env.local` file with your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project_id.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Optional: Dev mode bypass for development
NEXT_PUBLIC_DEV_AUTH_BYPASS=true
```

### 3. Firebase Setup

1. **Create Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Add project"

2. **Enable Authentication**
   - Navigate to **Build** → **Authentication**
   - Enable **Google** sign-in

3. **Enable Realtime Database**
   - Navigate to **Build** → **Realtime Database**
   - Click "Create Database" in test mode

4. **Deploy Security Rules**
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only database:rules
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

---

## 📸 Screenshots

### Today Page
Track your daily habits and see active targets at a glance.

### Habits Management
Create, edit, and manage your habits with custom icons and colors.

### Goals/Targets
Set time-based goals with flexible windows and track your progress.

### Statistics Dashboard
Visualize your progress with beautiful charts and calendar heatmaps.

### Circles
Join circles and track habits together with friends and family.

---

## 🏗️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | [Next.js 15](https://nextjs.org/) | React framework with App Router |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| **Backend** | [Firebase Realtime DB](https://firebase.google.com/docs/database) | Real-time data sync |
| **Auth** | [Firebase Auth](https://firebase.google.com/docs/auth) | Google authentication |
| **Dates** | [date-fns](https://date-fns.org/) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) | Date & timezone handling |
| **Icons** | [Lucide](https://lucide.dev/) | Beautiful icon library |
| **Animations** | [Framer Motion](https://www.framer.com/motion/) | Smooth animations |

---

## 📁 Project Structure

```
hobhob/
├── app/                        # Next.js App Router
│   ├── (auth)/                # Authentication routes
│   │   └── sign-in/           # Sign-in page
│   ├── (app)/                 # Protected routes
│   │   ├── today/             # Main: Daily check-ins
│   │   ├── habits/            # Habit CRUD
│   │   ├── targets/           # Goal targets
│   │   ├── circles/           # Social circles
│   │   ├── stats/             # Statistics dashboard
│   │   ├── history/           # Calendar view
│   │   └── settings/          # User settings
│   └── globals.css            # Master CSS with design tokens
│
├── components/
│   ├── features/              # Feature-specific components
│   │   ├── habits/            # Habit form, cards, toggle
│   │   ├── targets/           # Target cards, forms, details
│   │   ├── circles/           # Circle management
│   │   ├── stats/             # Stats displays
│   │   └── settings/          # Settings components
│   ├── layout/                # Layout components
│   │   ├── app-sidebar.tsx    # Main navigation
│   │   └── bottom-nav.tsx     # Mobile bottom navigation
│   ├── providers/             # React context providers
│   └── ui/                    # Reusable UI components
│
├── lib/
│   ├── firebase/              # Firebase client initialization
│   ├── auth/                  # Authentication utilities
│   ├── db/                    # Database operations
│   │   ├── habits.ts          # Habit CRUD
│   │   ├── targets.ts         # Target CRUD
│   │   ├── circles.ts         # Circle operations
│   │   └── checkins.ts        # Check-in tracking
│   └── utils/                 # Helper functions
│       ├── date.ts            # Date utilities
│       └── habits.ts         # Habit filtering
│
├── store/
│   ├── use-user-store.ts      # User state
│   ├── use-habits-store.ts    # Habits state
│   ├── use-targets.store.ts   # Targets state
│   └── use-language-store.ts  # Language/i18n state
│
├── types/
│   └── index.ts               # TypeScript type definitions
│
├── public/
│   ├── manifest.json          # PWA manifest
│   └── icons/                 # App icons
│
├── database.rules.json        # Firebase security rules
├── tailwind.config.ts         # Tailwind configuration
└── next.config.js             # Next.js configuration
```

---

## 🎨 Design System

HobHob uses a custom dark glassmorphism design inspired by [blur.io](https://blur.io/) and [Bear.app](https://bear.app/).

### Color Palette

```css
--color-background: #0a0a0b      /* Deep black */
--color-surface: #111113          /* Card backgrounds */
--color-brand: #FF6600           /* Primary orange accent */
--color-border: rgba(255,255,255,0.1)
```

### Component Patterns

- **Glass Card** - `bg-white/5 backdrop-blur-xl border border-white/10`
- **Primary Button** - Orange gradient with glow effect
- **Check-in Toggle** - Circular with smooth color transitions
- **Navigation** - Fixed bottom nav with glassmorphic blur

---

## 🔐 Security

HobHob implements comprehensive security through Firebase Realtime Database rules:

- **User isolation** - Each user can only access their own data (`auth.uid == $uid`)
- **Circle separation** - Circle data properly isolated with validation
- **Input validation** - All data is validated before writing to database
- **Authentication required** - All protected routes require valid Firebase auth
- **Type safety** - TypeScript prevents type-related vulnerabilities

See [database.rules.json](database.rules.json) for the complete security rules.

---

## 🌐 Internationalization (i18n)

HobHob supports multiple languages:

- **English** (en) - Full translation
- **Thai** (th) - Full translation

Language is stored in user profile and persists across sessions.

---

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Build verification
npm run build

# Linting
npm run lint
```

---

## 📱 PWA Installation

HobHob can be installed as a Progressive Web App:

1. Open the app in Safari (iOS) or Chrome (Android)
2. Tap the **Share** button
3. Select **"Add to Home Screen"**
4. The app will launch in fullscreen like a native app

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel Dashboard](https://vercel.com/new)
3. Add environment variables
4. Deploy!

### Environment Variables

Make sure to add these in your Vercel project settings:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_DATABASE_URL
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

---

## 🛣️ Roadmap

### v1.0 (Current) ✅

- [x] Google Authentication
- [x] Habit CRUD with custom icons/colors
- [x] Daily check-ins with optimistic UI
- [x] Statistics dashboard
- [x] 30-day calendar heatmap
- [x] Time-based targets/goals
- [x] Social circles with sharing
- [x] Multi-language support (EN/TH)
- [x] PWA support
- [x] Timezone awareness

### v1.1 (Planned)

- [ ] Push notifications for reminders
- [ ] Offline-first with background sync
- [ ] Export data (CSV, PDF)
- [ ] Dark/light mode toggle
- [ ] Widget support (iOS, Android)
- [ ] Apple Watch companion

### v2.0 (Future)

- [ ] Advanced analytics and AI insights
- [ ] Habit templates and challenges
- [ ] Integration with health apps (Apple Health, Google Fit)
- [ ] Social features (follow users, activity feed)
- [ ] Gamification (achievements, leaderboards)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (see [CLAUDE.md](CLAUDE.md))
- Test on mobile viewport (375px width minimum)
- Ensure TypeScript compiles without errors (`npx tsc --noEmit`)
- Test on both English and Thai languages
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **UI Design** - Inspired by [blur.io](https://blur.io/) and [Bear.app](https://bear.app/)
- **Framework** - Built with [Next.js](https://nextjs.org/)
- **Backend** - Powered by [Firebase](https://firebase.google.com/)
- **Icons** - [Lucide Icons](https://lucide.dev/)
- **Design System** - Based on [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">

**Built with ❤️ by [hataichanokpan-dev](https://github.com/hataichanokpan-dev)**

[![GitHub followers](https://img.shields.io/github/followers/hataichanokpan-dev?style=social)](https://github.com/hataichanokpan-dev)

[⬆ Back to Top](#-hobhob)

</div>
