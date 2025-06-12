# Timeflies

<img src="https://github.com/user-attachments/assets/a1c30341-380f-4799-bae5-3b6fa68449e2" alt="Timeflies Icon" width="400px" />

Timeflies is a modern, responsive calendar application built with Vue 3 and TypeScript. It offers a seamless experience for managing your schedule across different time zones and devices.

## Features

- 📅 **Responsive Calendar View**: Adapts to your screen size, showing multiple days on desktop and a single day on mobile
- 🌍 **Timezone Support**: View and manage events in your local timezone
- 🎨 **Modern UI**: Clean, intuitive interface with smooth animations
- 📱 **Mobile Design**: Optimized experience across all devices
- 🔒 **User Authentication**: Secure login and signup system
- ⚡ **Real-time Updates**: Instant feedback on all actions
- 🎯 **Event Management**: Create, edit, and delete events with ease

## Tech Stack

- **Frontend Framework**: Vue 3 with Composition API
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Package Manager**: npm

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/federicoPedraza/timeflies-app
   cd timeflies-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm build
   ```

## Project Structure

```
timeflies/
├── src/
│   ├── assets/          # Static assets (images, icons)
│   ├── components/      # Reusable Vue components
│   ├── stores/          # Pinia stores
│   ├── views/           # Page components
│   ├── router/          # Vue Router configuration
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/              # Public static files
└── tests/               # Test files
```

## Development

### Key Components

- **Calendar View**: Responsive calendar implementation in `src/views/Calendar.vue`
- **Event Management**: Event creation and editing in `src/components/events/`
- **Authentication**: User authentication system in `src/views/Auth.vue`
- **Settings**: User preferences and timezone settings in `src/views/ConfigTime.vue`

### Calendar Component

The calendar component (`src/views/Calendar.vue`) is a sophisticated implementation that provides a responsive and interactive calendar view. Here's how it works:

#### Layout Structure
- **Grid Layout**: Uses a three-column grid layout on desktop (hour column, calendar, hour column) and single column on mobile
- **Responsive Design**: Adapts the number of visible days based on screen width:
  - Mobile (< 640px): 1 day
  - Tablet (640px - 1280px): 2 days
  - Small Desktop (1280px - 1536px): 4 days
  - Large Desktop (> 1536px): 7 days

#### Key Features
1. **Dynamic Day Width**: Automatically calculates and adjusts day width based on container size
2. **Synchronized Scrolling**:
   - Header and body scroll horizontally in sync
   - Left/right hour columns scroll vertically with the main calendar
3. **Event Management**:
   - Supports overlapping events with automatic column assignment
   - Handles multi-day events
   - Provides drag-and-drop event creation
   - Allows event resizing from both ends
4. **Time Indicators**:
   - Shows current time indicator
   - Displays half-hour markers
   - Highlights current day
5. **Mobile Optimizations**:
   - Single day view with horizontal day navigation
   - Compact hour display
   - Full-width event popups
   - Touch-friendly interactions

#### Technical Implementation
- Implements virtual scrolling for performance
- Handles timezone conversions using moment-timezone
- Manages event overlapping with a sophisticated algorithm
- Provides smooth animations and transitions

#### Event Handling
- **Creation**: Click and drag on calendar cells
- **Editing**: Click events to open popup
- **Resizing**: Drag event edges to adjust duration
- **Deletion**: Through event popup
- **Multi-day**: Events can span multiple days with visual indicators

#### Performance Considerations
- Implements efficient event rendering
- Uses computed properties for derived state
- Optimizes scroll performance
- Handles large datasets efficiently
- Implements proper cleanup on component unmount


# Things to-do and known bugs

## Known Bugs
- Events can be created with negative duration
- Timezone conversion edge cases need to be handled better
- Event popup positioning can be incorrect on certain screen sizes
- Calendar scroll position is not preserved when switching views

## Features to Implement

### Event Management
- [ ] Add support for recurring events
- [ ] Implement event categories and tags
- [ ] Add event reminders and notifications
- [ ] Support for event attachments
- [ ] Add event sharing capabilities
- [ ] Implement event templates

### Meeting Features
- [ ] Add meeting scheduling with multiple participants
- [ ] Implement meeting availability checking
- [ ] Add meeting room booking system
- [ ] Support for video conference integration
- [ ] Add meeting agenda and minutes

### UI/UX Improvements
- [ ] Implement dark mode
- [ ] Add custom theme support
- [ ] Create an interactive onboarding tutorial
- [ ] Improve mobile touch interactions
- [ ] Add keyboard shortcuts
- [ ] Implement drag-and-drop for event reordering

### Calendar Enhancements
- [ ] Add different calendar views (week, month, year)
- [ ] Implement calendar sharing
- [ ] Add calendar import/export (iCal, Google Calendar)
- [ ] Support for multiple calendars
- [ ] Add calendar search functionality
- [ ] Implement calendar analytics

### User Experience
- [ ] Add user preferences and settings
- [ ] Implement user profile customization
- [ ] Add notification preferences
- [ ] Create a help center
- [ ] Add user feedback system
- [ ] Implement user onboarding flow

### Performance
- [ ] Optimize event rendering for large datasets
- [ ] Improve scroll performance
- [ ] Implement better state management
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Implement better caching strategies

## Technical Debt
- [ ] Refactor event overlapping algorithm
- [ ] Improve TypeScript type definitions
- [ ] Add comprehensive test coverage
- [ ] Update dependencies
- [ ] Improve code documentation
- [ ] Implement better error handling
