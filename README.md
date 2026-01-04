# HobHob

<div align="center">

# 🎯 HobHob

**A beautiful mobile-first habit tracker with dark glassmorphism UI**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Build better habits, one day at a time.**

[Features](#-features) • [Live Demo](#-live-demo) • [Quick Start](#-quick-start) • [Documentation](#-documentation)

</div>

---

## ✨ Features

### Core Functionality

- 🔐 **Google Authentication** - Secure sign-in with Firebase Auth
- ✅ **Habit Management** - Create, edit, and delete habits with custom icons and colors
- ☑️ **Daily Check-ins** - One-tap habit tracking with optimistic UI updates
- 📊 **Statistics Dashboard** - Track streaks, completion rates, and visualize progress
- 📅 **Calendar Heatmap** - Visual 30-day calendar showing habit consistency
- ⚙️ **User Settings** - Timezone selection, data export, account management
- 📱 **Mobile-First Design** - Optimized for one-handed use on any device
- 🌙 **Dark Glassmorphism UI** - Beautiful blur.io-inspired interface

### Technical Highlights

- ⚡ **Real-time Sync** - Firebase Realtime Database for instant updates
- 🎨 **Tailwind CSS v4** - Modern, performance-optimized styling
- 💾 **PWA Support** - Install on home screen for native app experience
- 🌍 **Timezone Aware** - Proper date handling across time zones
- 🔒 **Security Rules** - Comprehensive Firebase security with validation
- ♿ **Accessible** - WCAG compliant with keyboard navigation support

---

## 🎮 Live Demo

Coming soon to [hobhob.app](https://hobhob.app)

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ ([nodejs.org](https://nodejs.org))
- **npm** or **yarn** package manager
- **Firebase** account ([firebase.google.com](https://firebase.google.com))
- **GitHub** account (for Vercel deployment)

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/hataichanokpan-dev/hobhob.git
cd hobhob

# Install dependencies
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env.local
```

Edit `.env.local` with your Firebase configuration:

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
   - Click "Add project" and name it `hobhob`

2. **Enable Authentication**
   - Navigate to **Build** → **Authentication**
   - Click "Get Started" → "Add new provider"
   - Select **Google** and enable it

3. **Enable Realtime Database**
   - Navigate to **Build** → **Realtime Database**
   - Click "Create Database"
   - Start in **Test Mode** (we'll deploy proper rules next)

4. **Deploy Security Rules**

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy security rules
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

## 📚 Documentation

- **[Step-by-Step Implementation Guide](STEP_BY_STEP_GUIDE.md)** - Learn how this project was built from scratch
- **[Implementation Steps](IMPLEMENTATION_STEPS.md)** - Detailed breakdown of each development step
- **[Testing Checklist](TESTING_CHECKLIST.md)** - Comprehensive testing guide before deployment
- **[CLAUDE.md](CLAUDE.md)** - Project guidance for AI assistants

---

## 🏗️ Tech Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | [Next.js 16](https://nextjs.org/) | React framework with App Router |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe development |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) | Lightweight state management |
| **Backend** | [Firebase Realtime DB](https://firebase.google.com/docs/database) | Real-time data sync |
| **Auth** | [Firebase Auth](https://firebase.google.com/docs/auth) | Google authentication |
| **Dates** | [date-fns](https://date-fns.org/) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) | Date & timezone handling |
| **Icons** | [Lucide](https://lucide.dev/) | Beautiful icon library |
| **Deployment** | [Vercel](https://vercel.com/) | Frontend hosting |

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
│   │   ├── stats/             # Statistics dashboard
│   │   └── settings/          # User settings
│   ├── globals.css            # Master CSS with design tokens
│   └── layout.tsx             # Root layout with providers
│
├── components/
│   ├── features/              # Feature-specific components
│   │   ├── habits/            # Habit form, list, toggle
│   │   ├── stats/             # Stats displays
│   │   └── settings/          # Settings components
│   ├── providers/             # React context providers
│   └── ui/                    # Reusable UI components
│
├── lib/
│   ├── firebase/              # Firebase client initialization
│   ├── auth/                  # Authentication utilities
│   ├── db/                    # Database operations
│   └── utils/                 # Helper functions
│
├── store/
│   └── use-user-store.ts      # Zustand user state
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

### Colors

```css
--color-background: #0a0a0b
--color-primary: #8b5cf6      /* Purple */
--color-accent: #ec4899       /* Pink */
```

### Components

- **Glass Card** - `bg-white/5 backdrop-blur-xl border-white/10`
- **Primary Button** - Gradient purple to pink
- **Check-in Toggle** - Circular with glow effect
- **Bottom Navigation** - Fixed, glassmorphic

---

## 🔐 Security

HobHob implements comprehensive security through Firebase Realtime Database rules:

- **User isolation** - Each user can only access their own data (`auth.uid == $uid`)
- **Input validation** - All data is validated before writing
- **Authentication required** - All routes require valid Firebase auth
- **Type safety** - TypeScript prevents type-related vulnerabilities

See [database.rules.json](database.rules.json) for the complete rules.

---

## 🧪 Testing

Run the full test suite:

```bash
# Type checking
npx tsc --noEmit

# Build verification
npm run build

# Linting
npm run lint
```

For manual testing, follow the [Testing Checklist](TESTING_CHECKLIST.md).

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
3. Add environment variables from `.env.local`
4. Deploy!

### Manual Deployment

```bash
# Build the project
npm run build

# Deploy the .next folder to your hosting provider
```

---

## 🛣️ Roadmap

### v1.0 (Current) ✅

- [x] Google Authentication
- [x] Habit CRUD
- [x] Daily check-ins
- [x] Statistics dashboard
- [x] Settings page
- [x] PWA support

### v1.1 (Planned)

- [ ] Push notifications for reminders
- [ ] Offline-first with background sync
- [ ] Dark/light mode toggle
- [ ] Widget support
- [ ] Apple Watch companion

### v2.0 (Future)

- [ ] Social features (share habits, groups)
- [ ] Advanced analytics and insights
- [ ] Habit templates and challenges
- [ ] Integration with health apps (Apple Health, Google Fit)
- [ ] AI-powered habit suggestions

---

## 🤝 Contributing

Contributions are welcome! Please follow our guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style (see [CLAUDE.md](CLAUDE.md))
- Test on mobile viewport (375px width minimum)
- Ensure TypeScript compiles without errors
- Add tests for new features
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

## 📞 Support

- 📧 Email: support@hobhob.app
- 🐛 [Report a Bug](https://github.com/hataichanokpan-dev/hobhob/issues)
- 💡 [Feature Request](https://github.com/hataichanokpan-dev/hobhob/issues)
- 📖 [Documentation](STEP_BY_STEP_GUIDE.md)

---

<div align="center">

**Built with ❤️ by the HobHob team**

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white)](https://twitter.com/hobhobapp)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/hataichanokpan-dev/hobhob)

[⬆ Back to Top](#-hobhob)

</div>
