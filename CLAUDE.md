# Workout Tracker - Claude Code Instructions

## Project Overview

This is a comprehensive Workout Tracker web application built with Next.js 15, featuring real-time workout sessions, exercise management, and data import capabilities.

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Database**: PostgreSQL with Prisma ORM
- **Containerization**: Docker Compose
- **State Management**: React hooks with localStorage fallback

## Key Features

- **Workout-Focused Design**: Primary focus on tracking complete workouts with live session support
- **Exercise Management**: Track strength, cardio, flexibility, balance, sports, and other exercise types
- **Real-time Tracking**: Live workout sessions optimized for gym use
- **Data Import**: Import exercises and workouts from CSV, JSON, and XML files
- **Dark Mode**: Full dark mode support throughout the application
- **Mobile-First**: Responsive design optimized for phone use during workouts
- **Offline Support**: Graceful fallback to localStorage when database is unavailable

## Development Commands

```bash
make help        # Show all available commands
make dev         # Start development server (checks DB status first)
make db-up       # Start PostgreSQL database
make db-down     # Stop database
make db-setup    # Initialize database schema
make db-reset    # Reset database completely
make db-status   # Check database connection
make install     # Install dependencies
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

## Database Models

1. **Exercise**: Individual exercises with categories (strength, cardio, etc.)
2. **Workout**: Completed workout sessions with exercises
3. **WorkoutTemplate**: Pre-built and custom workout templates
4. **WorkoutSession**: Active workout tracking

## Important Notes

- **Imperial Units**: Default to pounds and miles throughout the app
- **Database Fallback**: App gracefully falls back to localStorage when database is unavailable
- **Mobile Optimized**: UI is optimized for gym use with large, touch-friendly buttons
- **Dark Mode**: Full dark mode support with system preference detection
- **Type Safety**: Strict TypeScript throughout

## Environment Setup

1. Copy `.env.example` to `.env`
2. Run `make db-setup` to start database and apply schema
3. Run `make dev` to start development server

## Common Tasks

### Adding New Exercise Categories
- Update `types.ts` with new category
- Modify `ExerciseForm.tsx` for category-specific fields
- Update parsers if needed for import support

### Adding New Workout Features
- Modify `WorkoutSession` model in Prisma schema
- Update `useWorkoutSessions.ts` hook
- Enhance workout session UI components

### Database Operations
- Always ensure graceful fallback to localStorage
- Use hooks from `src/hooks/` for database operations
- Test both database and localStorage modes

## Testing Strategy

- Test with database running: `make db-up && make dev`
- Test without database: `make db-down && make dev`
- Verify localStorage fallback works properly
- Test on mobile devices for gym use

## Key Files to Know

- `app/workouts/session/page.tsx` - Live workout tracking
- `src/hooks/useDatabase.ts` - Database connection management
- `utils/parsers/` - File import system
- `components/WorkoutTemplateSelector.tsx` - Pre-built templates
- `prisma/schema.prisma` - Database schema

## Pre-built Workout Templates

1. **Push Day**: Bench Press, Shoulder Press, Tricep Dips, Push-ups
2. **Pull Day**: Pull-ups, Barbell Rows, Bicep Curls, Face Pulls
3. **Legs**: Squats, Lunges, Leg Press, Calf Raises
4. **Upper Body**: Mixed upper body exercises
5. **Lower Body**: Mixed lower body exercises
6. **Full Body**: Comprehensive full-body workout

## Data Import Support

The app supports importing exercises and workouts from:
- **CSV**: Comma-separated values
- **JSON**: JavaScript Object Notation  
- **XML**: Extensible Markup Language

See `/sample-imports/` for example files and format documentation.