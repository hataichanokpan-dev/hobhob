# HobHob

<div align="center">

A mobile-first Habit Tracker with a stunning blur.io-inspired dark glassmorphism UI.

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=for-the-badge&logo=firebase)](https://firebase.google.com/)

**Build better habits, one day at a time.**

[Features](#-features) • [Demo](#-demo) • [Getting Started](#-getting-started) • [Tech Stack](#-tech-stack)

</div>

---

## Features

### MVP (v1.0)

- **Google Authentication** - Secure sign-in with Firebase Auth
- **Habit Management** - Create, edit, and delete habits with custom icons and colors
- **Daily Check-ins** - One-tap habit tracking with optimistic UI
- **Statistics Dashboard** - Track streaks, completion rates, and visualize progress
- **Mobile-First Design** - Optimized for one-handed use on any device
- **PWA Support** - Install on your home screen for app-like experience
- **Dark Glassmorphism UI** - Beautiful blur.io-inspired interface

### Roadmap (Phase 2)

- Push notifications and smart reminders
- Offline-first with background sync
- Social features (share habits, groups)
- Advanced analytics and insights

---

## Demo

> Screenshots coming soon...

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase account
- GitHub account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/hobhob.git
cd hobhob

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env.local
```

### Firebase Setup

1. [Create a Firebase project](https://console.firebase.google.com/)
2. Enable **Authentication** → **Google** sign-in provider
3. Enable **Realtime Database**
4. Configure OAuth consent screen with your authorized domains
5. Copy your Firebase config to `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_DATABASE_URL=https://your_project.firebaseio.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

6. Deploy security rules:

```bash
# Install Firebase CLI (if not installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules
firebase deploy --only database:rules
```

### Development

```bash
# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
# Create production build
npm run build

# Preview production build
npm start
```

---

## Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **UI Components** | [shadcn/ui](https://ui.shadcn.com/) |
| **State Management** | [Zustand](https://github.com/pmndrs/zustand) |
| **Backend** | [Firebase Realtime Database](https://firebase.google.com/docs/database) |
| **Authentication** | [Firebase Auth](https://firebase.google.com/docs/auth) |
| **Date Handling** | [date-fns](https://date-fns.org/) + [date-fns-tz](https://github.com/marnusw/date-fns-tz) |
| **Icons** | [Lucide](https://lucide.dev/) |
| **Deployment** | [Vercel](https://vercel.com/) |

---

## Project Structure

```
hobhob/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (app)/             # Protected routes
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── features/         # Feature-specific components
│   └── layout/           # Layout components
├── lib/                   # Core utilities
│   ├── firebase/         # Firebase client
│   ├── auth/             # Auth helpers
│   ├── db/               # Database operations
│   └── utils/            # Utilities
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── public/                # Static assets (PWA)
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure mobile responsiveness (test on 375px viewport)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- UI design inspired by [blur.io](https://blur.io/)
- Built with [Next.js](https://nextjs.org/) and [Firebase](https://firebase.google.com/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">

Made with purpose by [Your Name]

[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=flat&logo=twitter&logoColor=white)](https://twitter.com/yourusername)
[![GitHub](https://img.shields.io/badge/GitHub-181717?style=flat&logo=github&logoColor=white)](https://github.com/yourusername)

</div>
