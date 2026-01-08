export const translations = {
  en: {
    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      close: "Close",
      confirm: "Confirm",
      back: "Back",
      next: "Next",
      done: "Done",
      yes: "Yes",
      no: "No",
      or: "or",
      and: "and",
    },

    // App
    app: {
      name: "HobHob",
      tagline: "Build better habits",
      footerTagline: "Small steps, big changes",
    },

    // Navigation
    nav: {
      today: "Today",
      habits: "Habits",
      targets: "Targets",
      circles: "Circles",
      stats: "Statistics",
      history: "History",
      leaderboard: "Leaderboard",
      settings: "Settings",
      doc: "Manual",
      menu: "Menu",
      navigateYourApp: "Navigate your app",
      signOut: "Sign Out",
    },

    navDescriptions: {
      today: "Check in your habits",
      habits: "Manage your habits",
      targets: "Time-window goals",
      circles: "Join habit circles",
      stats: "View your progress",
      history: "View your history",
      leaderboard: "See top habit builders",
      settings: "App preferences",
      doc: "How to use the app",
    },

    // Theme
    theme: {
      light: "Light",
      dark: "Dark",
      auto: "Auto",
      theme: "Theme",
    },

    // Language
    language: {
      title: "Language",
      english: "English",
      thai: "ไทย",
    },

    // Loading Messages
    loading: {
      checkingAuth: "Checking Authentication",
      preparingSpace: "Preparing your space",
      loadingSpace: "Loading your space",
      oneMoment: "One moment ✨",
      pleaseWait: "Please wait...",
      signingIn: "Signing in...",
      loadingHabits: "Loading habits...",
      loadingStats: "Loading statistics...",
      joiningCircle: "Joining circle...",
      creatingHabit: "Creating habit...",
      savingChanges: "Saving changes...",
      loadingProfile: "Loading profile...",
    },

    // Auth
    auth: {
      signIn: "Sign In",
      signInWithGoogle: "Sign in with Google",
      signInError: "Sign in error",
      loading: "Signing in...",
      footer: {
        prefix: "Created to see you better",
        suffix: "every day.",
      },
    },

    // Today Page
    today: {
      title: "Today",
      newHabit: "New Habit",
      completedCount: "{completed} of {total} completed",
      stats: {
        today: "Today",
        done: "Done",
        left: "Left",
      },
      noHabitsScheduled: "No habits scheduled for today. Enjoy your rest! 🎉",
      emptyState: {
        title: "Start Your Journey",
        description:
          "Create your first habit and start building better habits today. Small steps lead to big changes!",
        button: "Create Your First Habit",
      },
    },

    // Habits Page
    habits: {
      title: "Habits",
      description: "Manage and track your habits",
      stats: {
        total: "Total",
        active: "Active",
        paused: "Paused",
      },
      emptyState: {
        title: "No habits yet",
        description:
          "Create your first habit and start building better habits today. Small steps lead to big changes!",
        button: "Create Your First Habit",
      },
      noResults: "No habits found for this filter.",
      frequency: {
        daily: "Daily",
        weekly: "Weekly",
        monthly: "Monthly",
        paused: "Paused",
      },
    },

    // Habit Filter
    habitFilter: {
      all: "All",
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    },

    // Habit Form
    habitForm: {
      createTitle: "Create New Habit",
      editTitle: "Edit Habit",
      nameLabel: "Habit Name",
      namePlaceholder: "e.g., Morning Exercise",
      descriptionLabel: "Description (optional)",
      descriptionPlaceholder: "What's this habit about?",
      iconLabel: "Icon",
      colorLabel: "Color",
      frequencyLabel: "Frequency",
      targetDaysLabel: "Target Days",
      create: "Create Habit",
      update: "Update Habit",
      cancel: "Cancel",
    },

    // Frequency
    frequency: {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
    },

    // Stats Page
    stats: {
      title: "Statistics",
      description: "Track your progress",
      loading: "Loading statistics...",
      currentStreak: "Current Streak",
      bestStreak: "Best Streak",
      last7Days: "Last 7 days",
      last30Days: "Last 30 days",
      ofDays: "of {total} days",
      emptyState: {
        title: "No stats yet",
        description:
          "Complete some check-ins to see your progress. Start tracking your habits today!",
      },
    },

    // History Page
    history: {
      title: "History",
      export: "Export",
      filters: {
        dateRange: "Date Range",
        preset: {
          week: "Week",
          month: "Month",
          "3months": "3M",
          year: "Year",
          all: "All",
        },
        startDate: "From",
        endDate: "To",
        habit: "Filter by Habit",
        allHabits: "All Habits",
      },
      stats: {
        completion: "Completion Rate",
        currentStreak: "Current Streak",
        bestStreak: "Best Streak",
        total: "Total Check-ins",
      },
      heatmap: {
        title: "Activity Heatmap",
        empty: "No activity data for the selected period",
        legend: {
          less: "Less",
          more: "More",
        },
      },
      checkins: {
        title: "Recent Check-ins",
        empty: "No check-ins found for the selected period",
      },
    },

    // Leaderboard Page
    leaderboard: {
      title: "Leaderboard",
      description: "See the top habit builders",
      searchPlaceholder: "Search by name...",
      totalCount: "{count} habit builders",
      resultsCount: "{count} result(s)",
      empty: "No users on the leaderboard yet",
      noResults: "No users found matching your search",
      follow: "Follow",
      unfollow: "Unfollow",
      following: "Following",
      you: "You",
    },

    // Circles Page
    circles: {
      title: "Circles",
      create: "Create",
      inviteCode: {
        cta: "Have an invite code?",
        description: "Join a private circle",
        join: "Join →",
      },
      search: "Search circles...",
      noCircles: "No circles available yet",
      noResults: "No circles found",
    },

    // Circle Form
    circleForm: {
      createTitle: "Create Circle",
      editTitle: "Edit Circle",
      circleName: "Circle Name",
      circleNamePlaceholder: "e.g., Morning Warriors",
      circleDescription: "Circle Description (optional)",
      circleDescriptionPlaceholder: "What's this circle about?",
      habitName: "Habit Name",
      habitNamePlaceholder: "e.g., Morning Exercise",
      habitDescription: "Habit Description (optional)",
      habitDescriptionPlaceholder: "What's this habit about?",
      type: {
        label: "Circle Type",
        open: "Open Circle",
        private: "Private Circle",
        openDescription: "Anyone can join",
        privateDescription: "Invite only (2-6 members)",
      },
      icon: "Icon",
      color: "Color",
      habitIcon: "Habit Icon",
      habitColor: "Habit Color",
      frequency: "Frequency",
      targetDays: "Target Days",
      create: "Create Circle",
      update: "Update Circle",
      cancel: "Cancel",
    },

    // Circle Detail
    circleDetail: {
      join: "Join Circle",
      joined: "You're a member",
      leave: "Leave Circle",
      members: "members",
      completed: "completed today",
      inviteCode: "Invite Code",
      copyCode: "Copy Code",
      regenerate: "Regenerate",
      copied: "Copied!",
      share: "Share this code with friends to invite them",
      memberList: "Members",
      creator: "Creator",
      delete: "Delete Circle",
      deleteConfirm: "Delete Circle?",
      deleteWarning:
        'This will permanently delete "{name}". Members will lose access to this circle, but their habits will remain.',
    },

    // Circle Invite
    circleInvite: {
      title: "Join Circle",
      enterCode: "Enter the invite code to join",
      codePlaceholder: "ABC123",
      invalidCode: "Enter a 6-character code",
      continue: "Continue",
      checking: "Checking...",
      privateCircle: "Private Circle",
      privateInfo:
        "• 2-6 members only\n• See who's in the circle\n• Encourage each other",
      trackingHabit: 'You\'ll track "{name}"',
      join: "Join Circle",
      joining: "Joining...",
      differentCode: "Enter different code",
      joinedTitle: "You're in!",
      redirecting: "Redirecting to your habits...",
    },

    // Settings Page
    settings: {
      title: "Settings",
      description: "Manage your account",
      timezone: {
        label: "Timezone",
      },
      export: {
        label: "Export Data",
        description: "Download all your data as JSON",
        button: "Export",
        exporting: "Exporting...",
        noData: "No data to export",
        failed: "Failed to export data",
      },
      privacy: {
        label: "Privacy Policy",
        description: "Read our privacy policy",
      },
      terms: {
        label: "Terms of Service",
        description: "Read our terms of service",
      },
      signOut: {
        label: "Sign Out",
        button: "Sign Out",
      },
      dangerZone: "DANGER ZONE",
      deleteAccount: {
        label: "Delete Account",
        confirmation:
          "Are you sure you want to delete your account? This will permanently delete all your habits, check-ins, and stats. This action cannot be undone.",
        failed: "Failed to delete account. Please try again.",
      },
      builtWith: "Built with Next.js and Firebase",
    },

    // Streak Display
    streak: {
      current: "Current",
      best: "Best",
      days: "days",
    },

    // Check-in
    checkin: {
      checked: "Checked",
      unchecked: "Not checked",
      note: "Note",
      addNote: "Add a note...",
    },

    // Calendar Heatmap
    calendar: {
      weekOf: "Week of",
    },

    // Empty States
    empty: {
      title: "Nothing here yet",
      description: "Get started by creating your first habit!",
    },

    // Errors
    error: {
      somethingWentWrong: "Something went wrong",
      tryAgain: "Please try again",
      notLoggedIn: "You need to be logged in",
      habitNotFound: "Habit not found",
    },

    // Success
    success: {
      habitCreated: "Habit created successfully",
      habitUpdated: "Habit updated successfully",
      habitDeleted: "Habit deleted successfully",
      checkinSaved: "Check-in saved",
    },

    // Circle Notification
    circleNotification: {
      completedWithYou: "{count} {people} completed with you!",
      person: "person",
      people: "people",
    },

    // Targets
    targets: {
      title: "Targets",
      create: "New",
      description: "Time-window goals for your habits",
      viewAll: "View all",
      activeThisWindow: "Active now",
      allTargets: "All Targets",
      noActiveTargets: "No targets yet. Create one to get started!",
      noActiveThisWindow: "No active targets for this time window",
    },
    targetForm: {
      createTitle: "New Target",
      editTitle: "Edit Target",
      titleLabel: "Title",
      titlePlaceholder: "e.g., Read 2 books",
      descriptionLabel: "Description (optional)",
      descriptionPlaceholder: "What's this target about?",
      successCriteriaLabel: "Success Criteria (optional)",
      successCriteriaPlaceholder: "What counts as completing this target?",
      successCriteriaHelp:
        "Describe what needs to be done to mark this target as complete",
      iconLabel: "Icon",
      colorLabel: "Color",
      windowTypeLabel: "Time Window",
      isRecurringLabel: "Recurring target",
      create: "Create",
      update: "Save",
      windowTypes: {
        WEEK: "Weekly",
        "2_WEEKS": "2 Weeks",
        MONTH: "Monthly",
        "2_MONTHS": "2 Months",
        "6_MONTHS": "6 Months",
        YEAR: "Yearly",
        CUSTOM: "Custom",
      },
      windowDescriptions: {
        WEEK: "This week",
        "2_WEEKS": "Every 2 weeks",
        MONTH: "This month",
        "2_MONTHS": "Every 2 months",
        "6_MONTHS": "Half year",
        YEAR: "This year",
        CUSTOM: "Set your own duration",
      },
      customWindow: {
        label: "Custom Duration",
        daysLabel: "Number of days",
        daysPlaceholder: "e.g., 14",
        weeksLabel: "Number of weeks",
        weeksPlaceholder: "e.g., 3",
        monthsLabel: "Number of months",
        monthsPlaceholder: "e.g., 2",
        unitLabel: "Unit",
        unitDays: "Days",
        unitWeeks: "Weeks",
        unitMonths: "Months",
      },
    },
    targetDetail: {
      descriptionLabel: "Description",
      successCriteriaLabel: "Success Criteria",
      windowInfoLabel: "Time Window",
      timeRemaining: "Time remaining",
      windowType: "Window type",
      recurring: "Recurring",
      markDone: "Mark Done",
      edit: "Edit",
      archive: "Archive",
      archiveConfirm:
        "Archive this target? It will no longer create new instances.",
    },

    // PWA Install Prompt
    pwaInstall: {
      title: "Install HobHob",
      subtitle: "Add to home screen for best experience",
      gotIt: "Got it!",
      ios: {
        notSafari:
          "Please open this page in Safari to install HobHob on your device.",
        step1: "Tap the Share button",
        step2: "Scroll down and tap 'Add to Home Screen'",
      },
      android: {
        chrome:
          "Look for the 'Add to Home Screen' banner at the bottom or tap the menu (⋮) and select 'Install app' or 'Add to Home Screen'.",
        other:
          "Tap the menu (⋮) and look for 'Install app' or 'Add to Home Screen' option.",
      },
    },

    // Profile
    profile: {
      title: "Profile",
      activeHabits: "active",
      circles: "circles",
      myCircles: "My Circles",
      noCircles: "No circles joined yet",
      noDescription: "No description",
      members: "members",
      topHabits: "Top Habits by Streak",
      noHabits: "No habits yet",
      targetsSummary: "Targets Summary",
      noTargets: "No targets yet",
      totalTargets: "Total",
      completed: "Complete",
      rate: "Rate",
      recentlyCompleted: "Recently Completed",
      activeTargets: "Active Targets",
      targets: "targets",
    },

    // Doc Page
    doc: {
      title: "User Manual",
      subtitle: "Learn how to use HobHob",
      welcome: {
        title: "Welcome to HobHob! 🎉",
        description:
          "Your cute habit tracking companion. Small steps lead to big changes!",
      },
      sections: {
        today: {
          title: "Today Page",
          emoji: "📅",
          description: "Check in your daily habits and see active targets",
          howToUse: [
            "Tap the circle button to check in a habit",
            "See your completion rate and progress",
            "Complete targets by tapping the complete button",
            "Scroll down to see your active targets",
          ],
        },
        habits: {
          title: "Habits Page",
          emoji: "✅",
          description: "Create and manage your personal habits",
          howToUse: [
            "Tap '+' to create a new habit",
            "Choose a name, icon, and color for your habit",
            "Set frequency: daily, weekly, or monthly",
            "Edit or pause habits from the habit list",
            "Filter habits by frequency type",
          ],
        },
        targets: {
          title: "Targets Page",
          emoji: "🎯",
          description: "Set time-window goals to achieve",
          howToUse: [
            "Create targets with specific time windows (week, month, etc.)",
            "Set success criteria for completing the target",
            "Choose if target repeats or is one-time",
            "Mark targets as complete when done",
            "View all targets and their progress",
          ],
        },
        circles: {
          title: "Circles Page",
          emoji: "👥",
          description: "Join habit circles with friends",
          howToUse: [
            "Browse public circles to join",
            "Create your own circle and invite friends",
            "Use invite codes for private circles",
            "See who completed habits in your circle",
            "Encourage each other to stay on track",
          ],
        },
        history: {
          title: "History Page",
          emoji: "📜",
          description: "View your past check-ins and progress",
          howToUse: [
            "See a heatmap of your activity",
            "Filter by date range or habit",
            "View recent check-ins",
            "Track your completion rate over time",
          ],
        },
        leaderboard: {
          title: "Leaderboard Page",
          emoji: "🏆",
          description: "See top habit builders and follow friends",
          howToUse: [
            "Browse the leaderboard of active users",
            "Search for specific users",
            "Follow users to see their progress",
            "Compare completion rates",
          ],
        },
        stats: {
          title: "Statistics Page",
          emoji: "📊",
          description: "Analyze your habit performance",
          howToUse: [
            "View current and best streaks",
            "See completion rates for different periods",
            "Track progress for each habit",
            "Identify patterns in your behavior",
          ],
        },
        profile: {
          title: "Profile Page",
          emoji: "👤",
          description: "View your personal stats and circles",
          howToUse: [
            "See your active habits count",
            "View circles you've joined",
            "Check your top habits by streak",
            "See targets summary",
          ],
        },
      },
      tips: {
        title: "Tips for Success 💡",
        tips: [
          "Start with small, achievable habits",
          "Be consistent - even small progress counts",
          "Join circles to stay motivated with friends",
          "Set realistic targets and deadlines",
          "Track your streaks to maintain momentum",
          "Celebrate your progress, no matter how small!",
        ],
      },
    },
  },
  th: {
    // Common
    common: {
      loading: "กำลังโหลด...",
      save: "บันทึก",
      cancel: "ยกเลิก",
      delete: "ลบ",
      edit: "แก้ไข",
      close: "ปิด",
      confirm: "ยืนยัน",
      back: "ย้อนกลับ",
      next: "ถัดไป",
      done: "เสร็จสิ้น",
      yes: "ใช่",
      no: "ไม่",
      or: "หรือ",
      and: "และ",
    },

    // App
    app: {
      name: "HobHob",
      tagline: "สร้างนิสัยที่ดีขึ้น",
      footerTagline: "ก้าวเล็ก ๆ เปลี่ยนแปลงใหญ่",
    },

    // Navigation
    nav: {
      today: "วันนี้",
      habits: "นิสัย",
      targets: "เป้าหมาย",
      circles: "วงกลม",
      stats: "สถิติ",
      history: "ประวัติ",
      leaderboard: "ตารางผู้นำ",
      settings: "ตั้งค่า",
      doc: "คู่มือ",
      menu: "เมนู",
      navigateYourApp: "นำทางในแอป",
      signOut: "ออกจากระบบ",
    },

    navDescriptions: {
      today: "เช็คอินนิสัยของคุณ",
      habits: "จัดการนิสัยของคุณ",
      targets: "เป้าหมายตามช่วงเวลา",
      circles: "เข้าร่วมวงกลม",
      stats: "ดูความคืดหน้า",
      history: "ดูประวัติของคุณ",
      leaderboard: "ดูลำดับผู้สร้างนิสัย",
      settings: "การตั้งค่าแอป",
      doc: "วิธีใช้งานแอป",
    },

    // Theme
    theme: {
      light: "สว่าง",
      dark: "มืด",
      auto: "อัตโนมัติ",
      theme: "ธีม",
    },

    // Language
    language: {
      title: "ภาษา",
      english: "English",
      thai: "ไทย",
    },

    // Loading Messages
    loading: {
      checkingAuth: "กำลังตรวจสอบการยืนยันตัวตน",
      preparingSpace: "กำลังเตรียมพื้นที่ของคุณ",
      loadingSpace: "กำลังโหลดพื้นที่ของคุณ",
      oneMoment: "รอสักครู่ ✨",
      pleaseWait: "กรุณารอสักครู่...",
      signingIn: "กำลังเข้าสู่ระบบ...",
      loadingHabits: "กำลังโหลดนิสัย...",
      loadingStats: "กำลังโหลดสถิติ...",
      joiningCircle: "กำลังเข้าร่วมวงกลม...",
      creatingHabit: "กำลังสร้างนิสัย...",
      savingChanges: "กำลังบันทึกการเปลี่ยนแปลง...",
      loadingProfile: "กำลังโหลดโปรไฟล์...",
    },

    // Auth
    auth: {
      signIn: "เข้าสู่ระบบ",
      signInWithGoogle: "เข้าสู่ระบบด้วย Google",
      signInError: "เข้าสู่ระบบไม่สำเร็จ",
      loading: "กำลังเข้าสู่ระบบ...",
      footer: {
        prefix: "เราสร้างเพราะอยากเห็นคุณดีขึ้น",
        suffix: "ในทุกๆวัน",
      },
    },

    // Today Page
    today: {
      title: "วันนี้",
      newHabit: "สร้างนิสัยใหม่",
      completedCount: "เสร็จ {completed} จาก {total}",
      stats: {
        today: "วันนี้",
        done: "ทำแล้ว",
        left: "คงเหลือ",
      },
      noHabitsScheduled: "วันนี้ไม่มีนิสัยที่ต้องทำ สนุกวันว่างได้เลย! 🎉",
      emptyState: {
        title: "เริ่มต้นการเดินทาง",
        description:
          "สร้างนิสัยแรกของคุณและเริ่มสร้างนิสัยที่ดีขึ้นตั้งแต่วันนี้ ก้าวเล็ก ๆ นำไปสู่การเปลี่ยนแปลงครั้งใหญ่!",
        button: "สร้างนิสัยแรกของคุณ",
      },
    },

    // Habits Page
    habits: {
      title: "นิสัย",
      description: "จัดการและติดตามนิสัยของคุณ",
      stats: {
        total: "ทั้งหมด",
        active: "ใช้งาน",
        paused: "หยุดชั่วคราว",
      },
      emptyState: {
        title: "ยังไม่มีนิสัย",
        description:
          "สร้างนิสัยแรกของคุณและเริ่มสร้างนิสัยที่ดีขึ้นตั้งแต่วันนี้ ก้าวเล็ก ๆ นำไปสู่การเปลี่ยนแปลงครั้งใหญ่!",
        button: "สร้างนิสัยแรกของคุณ",
      },
      noResults: "ไม่พบนิสัยสำหรับตัวกรองนี้",
      frequency: {
        daily: "รายวัน",
        weekly: "รายสัปดาห์",
        monthly: "รายเดือน",
        paused: "หยุดชั่วคราว",
      },
    },

    // Habit Filter
    habitFilter: {
      all: "ทั้งหมด",
      daily: "รายวัน",
      weekly: "รายสัปดาห์",
      monthly: "รายเดือน",
    },

    // Habit Form
    habitForm: {
      createTitle: "สร้างนิสัยใหม่",
      editTitle: "แก้ไขนิสัย",
      nameLabel: "ชื่อนิสัย",
      namePlaceholder: "เช่น ออกกำลังกายเช้า",
      descriptionLabel: "คำอธิบาย (ไม่บังคับ)",
      descriptionPlaceholder: "นิสัยนี้เกี่ยวกับอะไร?",
      iconLabel: "ไอคอน",
      colorLabel: "สี",
      frequencyLabel: "ความถี่",
      targetDaysLabel: "วันเป้าหมาย",
      create: "สร้างนิสัย",
      update: "อัปเดตนิสัย",
      cancel: "ยกเลิก",
    },

    // Frequency
    frequency: {
      daily: "รายวัน",
      weekly: "รายสัปดาห์",
      monthly: "รายเดือน",
    },

    // Stats Page
    stats: {
      title: "สถิติ",
      description: "ติดตามความคืดหน้า",
      loading: "กำลังโหลดสถิติ...",
      currentStreak: "สตรีกปัจจุบัน",
      bestStreak: "สตรีกที่ดีที่สุด",
      last7Days: "7 วันล่าสุด",
      last30Days: "30 วันล่าสุด",
      ofDays: "จาก {total} วัน",
      emptyState: {
        title: "ยังไม่มีสถิติ",
        description:
          "ทำการเช็คอินเพื่อดูความคืดหน้าของคุณ เริ่มติดตามนิสัยของคุณตั้งแต่วันนี้!",
      },
    },

    // History Page
    history: {
      title: "ประวัติ",
      export: "ส่งออก",
      filters: {
        dateRange: "ช่วงวันที่",
        preset: {
          week: "สัปดาห์",
          month: "เดือน",
          "3months": "3 เดือน",
          year: "ปี",
          all: "ทั้งหมด",
        },
        startDate: "จาก",
        endDate: "ถึง",
        habit: "กรองตามนิสัย",
        allHabits: "นิสัยทั้งหมด",
      },
      stats: {
        completion: "อัตราการทำสำเร็จ",
        currentStreak: "สตรีกปัจจุบัน",
        bestStreak: "สตรีกที่ดีที่สุด",
        total: "เช็คอินทั้งหมด",
      },
      heatmap: {
        title: "แผนที่ความถี่",
        empty: "ไม่มีข้อมูลกิจกรรมสำหรับช่วงเวลาที่เลือก",
        legend: {
          less: "น้อย",
          more: "มาก",
        },
      },
      checkins: {
        title: "เช็คอินล่าสุด",
        empty: "ไม่พบเช็คอินสำหรับช่วงเวลาที่เลือก",
      },
    },

    // Leaderboard Page
    leaderboard: {
      title: "ตารางผู้นำ",
      description: "ดูผู้สร้างนิสัยระดับตำ",
      searchPlaceholder: "ค้นหาด้วยชื่อ...",
      totalCount: "{count} ผู้สร้างนิสัย",
      resultsCount: "{count} ผลลัพธ์",
      empty: "ยังไม่มีผู้ใช้ในตารางผู้นำ",
      noResults: "ไม่พบผู้ใช้ที่ตรงกับการค้นหา",
      follow: "ติดตาม",
      unfollow: "เลิกติดตาม",
      following: "กำลังติดตาม",
      you: "คุณ",
    },

    // Circles Page
    circles: {
      title: "วงกลม",
      create: "สร้าง",
      inviteCode: {
        cta: "มีรหัสเชิญหรือไม่?",
        description: "เข้าร่วมวงกลมส่วนตัว",
        join: "เข้าร่วม →",
      },
      search: "ค้นหาวงกลม...",
      noCircles: "ยังไม่มีวงกลม",
      noResults: "ไม่พบวงกลม",
    },

    // Circle Form
    circleForm: {
      createTitle: "สร้างวงกลม",
      editTitle: "แก้ไขวงกลม",
      circleName: "ชื่อวงกลม",
      circleNamePlaceholder: "เช่น นักรบมือเช้า",
      circleDescription: "คำอธิบายวงกลม (ไม่บังคับ)",
      circleDescriptionPlaceholder: "วงกลมนี้เกี่ยวกับอะไร?",
      habitName: "ชื่อนิสัย",
      habitNamePlaceholder: "เช่น ออกกำลังกายเช้า",
      habitDescription: "คำอธิบายนิสัย (ไม่บังคับ)",
      habitDescriptionPlaceholder: "นิสัยนี้เกี่ยวกับอะไร?",
      type: {
        label: "ประเภทวงกลม",
        open: "วงกลมเปิด",
        private: "วงกลมส่วนตัว",
        openDescription: "ทุกคนเข้าร่วมได้",
        privateDescription: "เฉพาะคนที่ได้รับเชิญ (2-6 คน)",
      },
      icon: "ไอคอน",
      color: "สี",
      habitIcon: "ไอคอนนิสัย",
      habitColor: "สีนิสัย",
      frequency: "ความถี่",
      targetDays: "วันเป้าหมาย",
      create: "สร้างวงกลม",
      update: "อัปเดตวงกลม",
      cancel: "ยกเลิก",
    },

    // Circle Detail
    circleDetail: {
      join: "เข้าร่วมวงกลม",
      joined: "คุณเป็นสมาชิกแล้ว",
      leave: "ออกจากวงกลม",
      members: "สมาชิก",
      completed: "ทำสำเร็จวันนี้",
      inviteCode: "รหัสเชิญ",
      copyCode: "คัดลอกรหัส",
      regenerate: "สร้างใหม่",
      copied: "คัดลอกแล้ว!",
      share: "แชร์รหัสนี้กับเพื่อนเพื่อเชิญเข้าร่วม",
      memberList: "สมาชิก",
      creator: "ผู้สร้าง",
      delete: "ลบวงกลม",
      deleteConfirm: "ลบวงกลม?",
      deleteWarning:
        'การดำเนินการนี้จะลบ "{name}" อย่างถาวร สมาชิกจะไม่สามารถเข้าถึงวงกลมนี้ได้อีก แต่นิสัยของพวกเขาจะยังคงอยู่',
    },

    // Circle Invite
    circleInvite: {
      title: "เข้าร่วมวงกลม",
      enterCode: "ป้อนรหัสเชิญเพื่อเข้าร่วม",
      codePlaceholder: "ABC123",
      invalidCode: "ป้อนรหัส 6 ตัวอักษร",
      continue: "ดำเนินการต่อ",
      checking: "กำลังตรวจสอบ...",
      privateCircle: "วงกลมส่วนตัว",
      privateInfo:
        "• 2-6 สมาชิกเท่านั้น\n• เห็นว่าใครอยู่ในวงกลม\n• ส่งเสริมซึ่งกันและกัน",
      trackingHabit: 'คุณจะติดตาม "{name}"',
      join: "เข้าร่วมวงกลม",
      joining: "กำลังเข้าร่วม...",
      differentCode: "ป้อนรหัสอื่น",
      joinedTitle: "เข้าร่วมแล้ว!",
      redirecting: "กำลังไปที่นิสัยของคุณ...",
    },

    // Settings Page
    settings: {
      title: "ตั้งค่า",
      description: "จัดการบัญชีของคุณ",
      timezone: {
        label: "โซนเวลา",
      },
      export: {
        label: "ส่งออกข้อมูล",
        description: "ดาวน์โหลดข้อมูลทั้งหมดของคุณเป็น JSON",
        button: "ส่งออก",
        exporting: "กำลังส่งออก...",
        noData: "ไม่มีข้อมูลที่จะส่งออก",
        failed: "การส่งออกข้อมูลล้มเหลว",
      },
      privacy: {
        label: "นโยบายความเป็นส่วนตัว",
        description: "อ่านนโยบายความเป็นส่วนตัวของเรา",
      },
      terms: {
        label: "เงื่อนไขการให้บริการ",
        description: "อ่านเงื่อนไขการให้บริการของเรา",
      },
      signOut: {
        label: "ออกจากระบบ",
        button: "ออกจากระบบ",
      },
      dangerZone: "โซนอันตราย",
      deleteAccount: {
        label: "ลบบัญชี",
        confirmation:
          "คุณแน่ใจหรือไม่ที่จะลบบัญชีของคุณ? การดำเนินการนี้จะลบนิสัย การเช็คอิน และสถิติทั้งหมดของคุณอย่างถาวร การดำเนินการนี้ไม่สามารถย้อนกลับได้",
        failed: "การลบบัญชีล้มเหลว กรุณาลองอีกครั้ง",
      },
      builtWith: "สร้างด้วย Next.js และ Firebase",
    },

    // Streak Display
    streak: {
      current: "ปัจจุบัน",
      best: "ดีที่สุด",
      days: "วัน",
    },

    // Check-in
    checkin: {
      checked: "เช็คแล้ว",
      unchecked: "ยังไม่ได้เช็ค",
      note: "โน้ต",
      addNote: "เพิ่มโน้ต...",
    },

    // Calendar Heatmap
    calendar: {
      weekOf: "สัปดาห์ของ",
    },

    // Empty States
    empty: {
      title: "ยังไม่มีข้อมูล",
      description: "เริ่มต้นด้วยการสร้างนิสัยแรกของคุณ!",
    },

    // Errors
    error: {
      somethingWentWrong: "เกิดข้อผิดพลาด",
      tryAgain: "กรุณาลองใหม่",
      notLoggedIn: "คุณต้องเข้าสู่ระบบก่อน",
      habitNotFound: "ไม่พบนิสัย",
    },

    // Success
    success: {
      habitCreated: "สร้างนิสัยสำเร็จ",
      habitUpdated: "อัปเดตนิสัยสำเร็จ",
      habitDeleted: "ลบนิสัยสำเร็จ",
      checkinSaved: "บันทึกการเช็คอินสำเร็จ",
    },

    // Circle Notification
    circleNotification: {
      completedWithYou: "{count} {people} ทำสำเร็จด้วยกัน!",
      person: "คน",
      people: "คน",
    },

    // Targets
    targets: {
      title: "เป้าหมาย",
      create: "สร้างใหม่",
      description: "เป้าหมายตามช่วงเวลาสำหรับนิสัยของคุณ",
      viewAll: "ดูทั้งหมด",
      activeThisWindow: "กำลังดำเนินการ",
      allTargets: "เป้าหมายทั้งหมด",
      noActiveTargets: "ยังไม่มีเป้าหมาย สร้างเป้าหมายเพื่อเริ่มต้น!",
      noActiveThisWindow: "ไม่มีเป้าหมายที่กำลังดำเนินการในช่วงเวลานี้",
    },
    targetForm: {
      createTitle: "สร้างเป้าหมายใหม่",
      editTitle: "แก้ไขเป้าหมาย",
      titleLabel: "ชื่อเป้าหมาย",
      titlePlaceholder: "เช่น อ่านหนังสือ 2 เล่ม",
      descriptionLabel: "คำอธิบาย (ไม่บังคับ)",
      descriptionPlaceholder: "เป้าหมายนี้เกี่ยวกับอะไร?",
      successCriteriaLabel: "เกณฑ์ความสำเร็จ (ไม่บังคับ)",
      successCriteriaPlaceholder: "อะไรคือการเสร็จสิ้นเป้าหมายนี้?",
      successCriteriaHelp:
        "อธิบายสิ่งที่ต้องทำเพื่อทำเครื่องหมายเป้าหมายนี้ว่าสำเร็จ",
      iconLabel: "ไอคอน",
      colorLabel: "สี",
      windowTypeLabel: "ช่วงเวลา",
      isRecurringLabel: "เป้าหมายที่เกิดซ้ำ",
      create: "สร้าง",
      update: "บันทึก",
      windowTypes: {
        WEEK: "รายสัปดาห์",
        "2_WEEKS": "2 สัปดาห์",
        MONTH: "รายเดือน",
        "2_MONTHS": "2 เดือน",
        "6_MONTHS": "6 เดือน",
        YEAR: "รายปี",
        CUSTOM: "กำหนดเอง",
      },
      windowDescriptions: {
        WEEK: "สัปดาห์นี้",
        "2_WEEKS": "ทุก 2 สัปดาห์",
        MONTH: "เดือนนี้",
        "2_MONTHS": "ทุก 2 เดือน",
        "6_MONTHS": "ครึ่งปี",
        YEAR: "ปีนี้",
        CUSTOM: "กำหนดระยะเวลาของคุณเอง",
      },
      customWindow: {
        label: "ระยะเวลากำหนดเอง",
        daysLabel: "จำนวนวัน",
        daysPlaceholder: "เช่น 14",
        weeksLabel: "จำนวนสัปดาห์",
        weeksPlaceholder: "เช่น 3",
        monthsLabel: "จำนวนเดือน",
        monthsPlaceholder: "เช่น 2",
        unitLabel: "หน่วย",
        unitDays: "วัน",
        unitWeeks: "สัปดาห์",
        unitMonths: "เดือน",
      },
    },
    targetDetail: {
      descriptionLabel: "คำอธิบาย",
      successCriteriaLabel: "เกณฑ์ความสำเร็จ",
      windowInfoLabel: "ช่วงเวลา",
      timeRemaining: "เวลาที่เหลือ",
      windowType: "ประเภทช่วงเวลา",
      recurring: "เกิดซ้ำ",
      markDone: "ทำเครื่องหมายว่าเสร็จ",
      edit: "แก้ไข",
      archive: "เก็บถาวร",
      archiveConfirm: "เก็บเป้าหมายนี้ถาวร? จะไม่สร้างอินสแตนซ์ใหม่อีก",
    },

    // PWA Install Prompt
    pwaInstall: {
      title: "ติดตั้ง HobHob",
      subtitle: "เพิ่มไปยังหน้าจอโฮมเพื่อประสบการณ์ที่ดีที่สุด",
      gotIt: "เข้าใจแล้ว!",
      ios: {
        notSafari:
          "กรุณาเปิดหน้านี้ใน Safari เพื่อติดตั้ง HobHob บนอุปกรณ์ของคุณ",
        step1: "แตะที่ปุ่มแชร์",
        step2: "เลื่อนลงและแตะ 'เพิ่มไปยังหน้าจอโฮม'",
      },
      android: {
        chrome:
          "มองหาแบนเนอร์ 'เพิ่มไปยังหน้าจอโฮม' ที่ด้านล่าง หรือแตะที่เมนู (⋮) และเลือก 'ติดตั้งแอป' หรือ 'เพิ่มไปยังหน้าจอโฮม'",
        other:
          "แตะที่เมนู (⋮) และมองหาตัวเลือก 'ติดตั้งแอป' หรือ 'เพิ่มไปยังหน้าจอโฮม'",
      },
    },

    // Profile
    profile: {
      title: "โปรไฟล์",
      activeHabits: "นิสัยที่ใช้งาน",
      circles: "วงกลม",
      myCircles: "วงกลมของฉัน",
      noCircles: "ยังไม่ได้เข้าร่วมวงกลม",
      noDescription: "ไม่มีคำอธิบาย",
      members: "สมาชิก",
      topHabits: "นิสัยยอดนิยม",
      noHabits: "ยังไม่มีนิสัย",
      targetsSummary: "สรุปเป้าหมาย",
      noTargets: "ยังไม่มีเป้าหมาย",
      totalTargets: "ทั้งหมด",
      completed: "สำเร็จ",
      rate: "อัตรา",
      recentlyCompleted: "สำเร็จล่าสุด",
      activeTargets: "เป้าหมายที่กำลังดำเนินการ",
      targets: "เป้าหมาย",
    },

    // Doc Page
    doc: {
      title: "คู่มือการใช้งาน",
      subtitle: "เรียนรู้วิธีใช้ HobHob",
      welcome: {
        title: "ยินดีต้อนรับสู่ HobHob! 🎉",
        description:
          "เพื่อนคู่ความนิสัยที่น่ารักของคุณ ก้าวเล็ก ๆ นำไปสู่การเปลี่ยนแปลงครั้งใหญ่!",
      },
      sections: {
        today: {
          title: "หน้าวันนี้",
          emoji: "📅",
          description: "เช็คอินนิสัยประจำวันและดูเป้าหมายที่กำลังดำเนินการ",
          howToUse: [
            "แตะที่ปุ่มวงกลมเพื่อเช็คอินนิสัย",
            "ดูอัตราการทำสำเร็จและความคืบหน้า",
            "ทำเครื่องหมายเป้าหมายว่าสำเร็จโดยแตะที่ปุ่มทำสำเร็จ",
            "เลื่อนลงเพื่อดูเป้าหมายที่กำลังดำเนินการ",
          ],
        },
        habits: {
          title: "หน้านิสัย",
          emoji: "✅",
          description: "สร้างและจัดการนิสัยส่วนตัวของคุณ",
          howToUse: [
            "แตะ '+' เพื่อสร้างนิสัยใหม่",
            "เลือกชื่อ ไอคอน และสีสำหรับนิสัยของคุณ",
            "ตั้งค่าความถี่: รายวัน รายสัปดาห์ หรือรายเดือน",
            "แก้ไขหรือหยุดนิสัยจากรายการนิสัย",
            "กรองนิสัยตามประเภทความถี่",
          ],
        },
        targets: {
          title: "หน้าเป้าหมาย",
          emoji: "🎯",
          description: "ตั้งเป้าหมายตามช่วงเวลาที่ต้องการบรรลุ",
          howToUse: [
            "สร้างเป้าหมายด้วยช่วงเวลาที่ระบุ (สัปดาห์ เดือน ฯลฯ)",
            "ตั้งเกณฑ์ความสำเร็จสำหรับการทำเป้าหมายให้เสร็จ",
            "เลือกว่าเป้าหมายซ้ำหรือเป็นครั้งเดียว",
            "ทำเครื่องหมายเป้าหมายว่าสำเร็จเมื่อเสร็จ",
            "ดูเป้าหมายทั้งหมดและความคืบหน้า",
          ],
        },
        circles: {
          title: "หน้าวงกลม",
          emoji: "👥",
          description: "เข้าร่วมวงกลมนิสัยกับเพื่อน",
          howToUse: [
            "เรียกดูวงกลมสาธารณะเพื่อเข้าร่วม",
            "สร้างวงกลมของคุณเองและเชิญเพื่อน",
            "ใช้รหัสเชิญสำหรับวงกลมส่วนตัว",
            "ดูว่าใครทำนิสัยสำเร็จในวงกลมของคุณ",
            "ส่งเสริมซึ่งกันและกันให้ยังอยู่ในเส้นทาง",
          ],
        },
        history: {
          title: "หน้าประวัติ",
          emoji: "📜",
          description: "ดูการเช็คอินในอดีตและความคืบหน้า",
          howToUse: [
            "ดูแผนที่ความถี่ของกิจกรรมของคุณ",
            "กรองตามช่วงวันที่หรือนิสัย",
            "ดูการเช็คอินล่าสุด",
            "ติดตามอัตราการทำสำเร็จตามเวลา",
          ],
        },
        leaderboard: {
          title: "หน้าตารางผู้นำ",
          emoji: "🏆",
          description: "ดูผู้สร้างนิสัยระดับตำและติดตามเพื่อน",
          howToUse: [
            "เรียกดูตารางผู้นำของผู้ใช้ที่ใช้งานอยู่",
            "ค้นหาผู้ใช้ที่ต้องการ",
            "ติดตามผู้ใช้เพื่อดูความคืบหน้าของพวกเขา",
            "เปรียบเทียบอัตราการทำสำเร็จ",
          ],
        },
        stats: {
          title: "หน้าสถิติ",
          emoji: "📊",
          description: "วิเคราะห์ประสิทธิภาพนิสัยของคุณ",
          howToUse: [
            "ดูสตรีกปัจจุบันและที่ดีที่สุด",
            "ดูอัตราการทำสำเร็จสำหรับช่วงเวลาต่างๆ",
            "ติดตามความคืบหน้าสำหรับแต่ละนิสัย",
            "ระบุรูปแบบในพฤติกรรมของคุณ",
          ],
        },
        profile: {
          title: "หน้าโปรไฟล์",
          emoji: "👤",
          description: "ดูสถิติส่วนบุคคลและวงกลมของคุณ",
          howToUse: [
            "ดูจำนวนนิสัยที่ใช้งานอยู่",
            "ดูวงกลมที่คุณเข้าร่วม",
            "ตรวจสอบนิสัยยอดนิยมโดยสตรีก",
            "ดูสรุปเป้าหมาย",
          ],
        },
      },
      tips: {
        title: "เคล็ดลับความสำเร็จ 💡",
        tips: [
          "เริ่มต้นด้วยนิสัยเล็ก ๆ ที่ทำได้",
          "สม่ำเสมอ - ความคืบหน้าเล็ก ๆ ก็มีค่า",
          "เข้าร่วมวงกลมเพื่อรักษาแรงบันดาลใจกับเพื่อน",
          "ตั้งเป้าหมายและกำหนดเวลาที่เป็นจริง",
          "ติดตามสตรีกของคุณเพื่อรักษาโมเมนตัม",
          "เฉลิมฉลองความคืบหน้าของคุณ ไม่ว่าจะเล็กแค่ไหน!",
        ],
      },
    },
  },
} as const;

export type TranslationKey = typeof translations.en;
export type Language = keyof typeof translations;
