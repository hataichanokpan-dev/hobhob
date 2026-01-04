# HobHob - Testing & Deployment Checklist

This document contains comprehensive testing checklists for the HobHob habit tracker app before deployment.

---

## Pre-Deployment Checklist

### Build & Type Check
- [ ] Run `npm run build` - no errors
- [ ] Run `npx tsc --noEmit` - no type errors
- [ ] Run `npm run lint` - no critical linting errors

### Environment Variables
- [ ] All Firebase config variables set in `.env.local`
- [ ] `NEXT_PUBLIC_FIREBASE_API_KEY` set
- [ ] `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` set
- [ ] `NEXT_PUBLIC_FIREBASE_DATABASE_URL` set
- [ ] `NEXT_PUBLIC_FIREBASE_PROJECT_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` set
- [ ] `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `NEXT_PUBLIC_FIREBASE_APP_ID` set
- [ ] Dev mode bypass configured (optional)

---

## Functional Testing

### Authentication Flow
- [ ] **Sign In**
  - [ ] Can access sign-in page at `/sign-in`
  - [ ] Google sign-in button works
  - [ ] Dev mode button works (if enabled)
  - [ ] After successful sign-in, redirects to `/today`
  - [ ] User profile created in Firebase Realtime Database

- [ ] **Sign Out**
  - [ ] Sign out button in Settings works
  - [ ] After sign out, redirects to `/sign-in`
  - [ ] User state cleared
  - [ ] localStorage cleared (for dev mode)

### Habit Management
- [ ] **Create Habit**
  - [ ] Can open habit form
  - [ ] Name input works
  - [ ] Icon selection works (16 icons)
  - [ ] Color selection works (6 colors)
  - [ ] Frequency selection works (daily/weekly)
  - [ ] Create button disabled when name is empty
  - [ ] Successfully creates habit
  - [ ] Habit appears in list immediately

- [ ] **Edit Habit**
  - [ ] Can open edit form
  - [ ] Form pre-filled with existing data
  - [ ] Can modify name, icon, color, frequency
  - [ ] Save changes works
  - [ ] Updates reflected immediately

- [ ] **Delete Habit**
  - [ ] Delete button shows confirmation dialog
  - [ ] Can cancel deletion
  - [ ] Can confirm deletion
  - [ ] Habit removed from list
  - [ ] Associated check-ins and stats remain in DB

### Daily Check-ins
- [ ] **Today Page**
  - [ ] Displays today's date correctly
  - [ ] Shows all active habits
  - [ ] Shows progress bar with completion percentage
  - [ ] Empty state when no habits

- [ ] **Check-in Toggle**
  - [ ] Can mark habit as done
  - [ ] Toggle changes color immediately (optimistic UI)
  - [ ] Shows checkmark icon when done
  - [ ] Can unmark habit
  - [ ] Progress bar updates immediately
  - [ ] Data persists after page refresh

### Statistics
- [ ] **Stats Page**
  - [ ] Can select different habits
  - [ ] Current streak displays correctly
  - [ ] Best streak displays correctly
  - [ ] 7-day completion rate displays
  - [ ] 30-day completion rate displays
  - [ ] Calendar heatmap shows correct colors
  - [ ] Green for done, gray for missed, transparent for none

### Settings
- [ ] **Profile Card**
  - [ ] Displays user avatar with first letter
  - [ ] Shows display name
  - [ ] Shows email
  - [ ] Shows join date

- [ ] **Timezone Selector**
  - [ ] Can select timezone from dropdown
  - [ ] Update saves immediately
  - [ ] Persisted across sessions

- [ ] **Export Data**
  - [ ] Export button works
  - [ ] Downloads JSON file
  - [ ] File contains all user data (profile, habits, check-ins, stats)
  - [ ] Filename includes current date

- [ ] **Delete Account**
  - [ ] Shows confirmation dialog
  - [ ] Warns about permanent data loss
  - [ ] Can cancel deletion
  - [ ] Can confirm deletion
  - [ ] All data removed from database
  - [ ] Redirected to sign-in

---

## UI/UX Testing

### Mobile Responsiveness
- [ ] **Viewport 375px (Mobile)**
  - [ ] All pages fit without horizontal scroll
  - [ ] Touch targets are minimum 44x44px
  - [ ] Text is readable
  - [ ] Bottom navigation is accessible
  - [ ] Modal/dialog fits on screen

- [ ] **Viewport 768px (Tablet)**
  - [ ] Layout remains usable
  - [ ] No breaking issues

- [ ] **Viewport 1024px+ (Desktop)**
  - [ ] Mobile layout still works
  - [ ] Content is centered appropriately

### Design System
- [ ] **Glassmorphism**
  - [ ] Cards have proper blur effect
  - [ ] Borders are visible
  - [ ] Hover effects work
  - [ ] Active states work

- [ ] **Colors**
  - [ ] Primary color (purple) used consistently
  - [ ] Gradient effects visible
  - [ ] Text contrast is sufficient
  - [ ] Dark mode only (no light mode issues)

- [ ] **Animations**
  - [ ] Page transitions are smooth
  - [ ] Button press feedback
  - [ ] Loading spinners work
  - [ ] Skeleton loaders work
  - [ ] Reduced motion respected

### Navigation
- [ ] **Bottom Navigation**
  - [ ] 4 tabs: Today, Habits, Stats, Settings
  - [ ] Active tab highlighted
  - [ ] Clicking tab navigates correctly
  - [ ] Icons are clear
  - [ ] Safe area inset for notch/home indicator

---

## Data Persistence Testing

### Firebase Realtime Database
- [ ] **Data Structure**
  - [ ] User data under `/users/{uid}/`
  - [ ] Profile at `/users/{uid}/profile`
  - [ ] Habits at `/users/{uid}/habits`
  - [ ] Check-ins at `/users/{uid}/checkins/{date}`
  - [ ] Stats at `/users/{uid}/stats`

- [ ] **Real-time Updates**
  - [ ] Creating habit updates across tabs
  - [ ] Editing habit updates across tabs
  - [ ] Checking in updates across tabs
  - [ ] Deleting habit updates across tabs

- [ ] **Offline/Online**
  - [ ] App works with network issues
  - [ ] Firebase SDK handles reconnection
  - [ ] Data syncs when back online

### Local Storage (Dev Mode)
- [ ] Dev user persists across page refreshes
- [ ] Cleared on sign out

---

## Security Testing

### Firebase Security Rules
- [ ] Users can only read their own data (`auth.uid == $uid`)
- [ ] Users can only write their own data
- [ ] Unauthenticated users cannot access data
- [ ] Data validation works (string lengths, types)
- [ ] Test rules with Firebase emulator or console simulator

### Authentication
- [ ] Cannot access protected routes without auth
- [ ] Session persists across page refreshes
- [ ] Invalid tokens are handled gracefully

### Data Validation
- [ ] Habit name cannot be empty
- [ ] Habit name max 50 characters
- [ ] Email is validated
- [ ] Display name max 50 characters

---

## Performance Testing

### Load Time
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages < 500ms
- [ ] Optimistic UI updates feel instant

### Bundle Size
- [ ] JavaScript bundle size is reasonable
- [ ] No duplicate dependencies
- [ ] Firebase SDK is tree-shaken properly

---

## Accessibility Testing

### Keyboard Navigation
- [ ] All interactive elements are focusable
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape key closes modals

### Screen Readers
- [ ] Images have alt text
- [ ] Icons have aria-labels
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text

### Visual Accessibility
- [ ] Text contrast ratio ≥ 4.5:1
- [ ] Touch targets ≥ 44x44px
- [ ] No reliance on color alone

---

## Browser Compatibility

### Mobile Browsers
- [ ] iOS Safari (iOS 14+)
- [ ] Chrome Mobile (Android)
- [ ] Firefox Mobile

### Desktop Browsers
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)

---

## PWA Testing

### Installability
- [ ] Manifest loads correctly
- [ ] Service worker registered
- [ ] App can be installed on mobile
- [ ] App icon displays correctly

### Offline Support
- [ ] App shell loads offline
- [ ] Shows offline message
- [ ] Reconnects when back online

---

## Error Handling

### Network Errors
- [ ] Shows error message on network failure
- [ ] Retry mechanism or retry button
- [ ] Graceful degradation

### Firebase Errors
- [ ] Auth errors handled
- [ ] Database errors handled
- [ ] Permission errors handled

### Edge Cases
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] No JavaScript errors in console

---

## Deployment Checklist

### Vercel
- [ ] Project connected to GitHub
- [ ] Environment variables configured in Vercel
- [ ] Auto-deploy enabled on main branch
- [ ] Custom domain configured (if applicable)

### Firebase
- [ ] Security rules deployed (`firebase deploy --only database:rules`)
- [ ] Google provider enabled
- [ ] OAuth consent screen configured
- [ ] Authorized domains added

### Post-Deployment
- [ ] Test on production URL
- [ ] Test on mobile device
- [ ] Verify all environment variables
- [ ] Check Firebase console for errors

---

## Known Issues & Limitations

### Dev Mode
- Dev mode bypass is only for development
- Must be disabled in production

### Stats Calculation
- Streak calculation is basic and can be improved
- Uses simple consecutive day counting

### Timezone Handling
- Relies on browser timezone detection
- User can manually override in Settings

---

## Sign-off

- [ ] All critical tests passed
- [ ] All high-priority bugs fixed
- [ ] Documentation updated
- [ ] Ready for production deployment

**Tester:** _______________
**Date:** _______________
**Version:** 1.0.0
