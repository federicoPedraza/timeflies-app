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
