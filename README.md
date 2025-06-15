# Workout Tracker

A comprehensive workout tracking web application built with Next.js 15, featuring real-time workout sessions, exercise management, and data import capabilities.

## Features

- **🏋️ Workout-Focused Design**: Primary focus on tracking complete workouts with live session support
- **💪 Exercise Management**: Track strength, cardio, flexibility, balance, sports, and other exercise types
- **📊 Real-time Tracking**: Live workout sessions optimized for gym use with large, touch-friendly buttons
- **📁 Data Import**: Import exercises and workouts from CSV, JSON, and XML files
- **🌙 Dark Mode**: Full dark mode support throughout the application
- **📱 Mobile-First**: Responsive design optimized for phone use during workouts
- **💾 Offline Support**: Graceful fallback to localStorage when database is unavailable
- **🏃 Pre-built Templates**: 6 workout templates (Push, Pull, Legs, Upper, Lower, Full Body)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker Compose
- **State Management**: React hooks with localStorage fallback

## Quick Start

### Prerequisites

- Node.js 18+ 
- Docker (for PostgreSQL)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd workout-tracker
```

2. Install dependencies:
```bash
make install
# or
npm install --legacy-peer-deps
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Start the database and initialize schema:
```bash
make db-setup
# or manually:
# docker-compose up -d
# npx prisma db push
```

5. Start the development server:
```bash
make dev
# or
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## Development Commands

```bash
make help        # Show all available commands
make dev         # Start development server
make db-up       # Start PostgreSQL database
make db-down     # Stop database
make db-reset    # Reset database completely
make lint        # Run ESLint
make type-check  # TypeScript type checking
make build       # Build for production
```

## Project Structure

```
workout-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── exercises/         # Exercise management pages
│   ├── workouts/          # Workout tracking pages
│   └── import/            # Data import page
├── components/            # React components
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript type definitions
├── utils/                 # Utility functions
│   └── parsers/          # File parsers (CSV, JSON, XML)
├── prisma/               # Database schema
├── sample-imports/       # Example import files
└── docker-compose.yml    # PostgreSQL setup
```

## Key Features Explained

### Workout Sessions

The workout session tracker (`/workouts/session`) provides:
- Real-time exercise tracking
- Rest timer with visual countdown
- Large buttons for easy gym use
- Automatic workout duration tracking
- Exercise completion flow

### Exercise Categories

Different exercise types have adapted forms:
- **Strength**: Sets, reps, and weight (pounds)
- **Cardio**: Duration (minutes) and distance (miles)
- **Others**: Duration and optional notes

### Data Import

Import data from multiple formats:
- **CSV**: Comma-separated values
- **JSON**: JavaScript Object Notation
- **XML**: Extensible Markup Language

See `/sample-imports` for example files and format documentation.

### Database Fallback

The app gracefully handles database connection issues:
- Automatically falls back to localStorage
- Shows console warnings (not user-facing errors)
- Syncs data when database becomes available
- Never gets stuck on loading screens

## Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/workout_tracker"
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.