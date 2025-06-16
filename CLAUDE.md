# Workout Tracker - Claude Code Instructions

## Project Overview

This is a comprehensive Workout Tracker web application built with Next.js 15, featuring real-time workout sessions, exercise management, and data import capabilities. The application is **production-ready** with complete testing infrastructure and Next.js 15 compatibility.

## Tech Stack

- **Framework**: Next.js 15 with App Router (fully compatible)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **Database**: PostgreSQL with Prisma ORM
- **Testing**: Jest + React Testing Library (comprehensive test suite)
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
- **Pre-built Templates**: 6 workout templates (Push/Pull/Legs/Upper/Lower/Full Body)
- **Progress Tracking**: Comprehensive progress analytics and statistics
- **Workout Management**: Full CRUD operations - create, edit, delete, and view workouts
- **Completed Workout Editing**: Edit finished workouts to correct errors in data
- **Proper Duration Tracking**: Accurate workout timing from start to finish

## Development Commands

```bash
# Development
make help        # Show all available commands
make dev         # Start development server (checks DB status first)
make build       # Build for production

# Database
make db-up       # Start PostgreSQL database
make db-down     # Stop database
make db-setup    # Initialize database schema
make db-reset    # Reset database completely
make db-status   # Check database connection

# Quality Assurance
make install     # Install dependencies
make lint        # Run ESLint
make type-check  # TypeScript type checking

# Testing
npm test                # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Generate coverage report
```

## Project Structure

```
workout-tracker/
├── app/                    # Next.js app directory
│   ├── api/               # API routes (exercises, workouts, health)
│   │   ├── exercises/    # Exercise CRUD endpoints
│   │   └── workouts/     # Workout CRUD endpoints with [id] routes
│   ├── exercises/         # Exercise management pages
│   │   ├── [id]/         # Individual exercise view/edit
│   │   └── new/          # Create new exercise
│   ├── workouts/          # Workout tracking pages
│   │   ├── [id]/         # Individual workout view with deletion
│   │   │   └── edit/     # Edit completed/planned workouts
│   │   ├── new/          # Create new workout with templates
│   │   └── session/      # Live workout tracking
│   ├── templates/         # Pre-built workout templates
│   ├── progress/          # Progress tracking and analytics
│   └── import/            # Data import page
├── components/            # React components
├── hooks/                 # Custom React hooks
├── utils/                 # Utility functions
│   ├── localStorage.ts   # localStorage management
│   └── parsers/          # File parsing with status support (CSV, JSON, XML)
├── __tests__/            # Comprehensive test suite
│   ├── hooks/           # Hook unit tests
│   ├── utils/           # Utility function tests
│   ├── api/             # API route tests
│   ├── components/      # Component tests
│   └── integration/     # Integration tests
├── prisma/               # Database schema
├── sample-imports/       # Example import files
└── docker-compose.yml    # PostgreSQL setup
```

## Current Status & Recent Completions

### ✅ **Recently Completed Features:**

1. **Workout Import Enhancements** (Latest Session)
   - **Status field support**: Import workouts as either 'planned' or 'completed' status
   - **Flexible order field**: Exercise order is now optional, defaults to array index
   - **Enhanced validation**: Improved workout import validation with better error messages
   - **Updated documentation**: Import page and README now include status field documentation
   - **Fixed import workflow**: Workouts properly stored through useWorkouts hook with status

2. **Workout Management Enhancements** (Previous Session)
   - **Fixed workout deletion**: Proper deletion through useWorkouts hook with API support
   - **Completed workout editing**: Users can now edit completed workouts to fix errors
   - **Enhanced workout cards**: Added "Edit Workout" buttons to completed workouts
   - **Improved data storage**: Fixed duration and totalVolume tracking for completed workouts
   - **TypeScript compilation fixes**: Resolved type mismatches preventing page loading

3. **Next.js 15 Compatibility** (Previous Session)
   - Fixed all TypeScript errors for Next.js 15 async params
   - Updated API routes to handle Promise<{ id: string }> params
   - Fixed Suspense boundary requirements for useSearchParams
   - Application builds successfully with no errors

4. **Complete Application Pages** (Previous Session)
   - `/templates` - 6 pre-built workout templates with modal details
   - `/progress` - Comprehensive progress tracking with statistics
   - `/exercises/[id]` - Exercise detail view with full CRUD operations
   - All navigation links working without 404 errors

5. **Database Architecture** (Previous Sessions)
   - PostgreSQL with Prisma ORM setup
   - All CRUD operations moved to API routes (no browser Prisma usage)
   - Graceful localStorage fallback when database unavailable
   - Health check system for database connectivity

6. **Comprehensive Testing Infrastructure** (Previous Session)
   - Jest + React Testing Library setup
   - 44 passing tests across utilities, hooks, components, and integration
   - **90%+ test coverage** on critical utilities:
     - fileImport.ts: 96.33% line coverage, 92.5% branch coverage
     - localStorage.ts: 78.37% line coverage, 100% branch coverage
     - useDatabase.ts: 89.47% line coverage
   - Integration tests for localStorage fallback scenarios

### **Architecture Decisions Made:**

1. **Database Access Pattern**: All database operations go through API routes, never direct Prisma in browser
2. **Error Handling**: Graceful degradation to localStorage when database unavailable
3. **TypeScript**: Strict typing throughout with Next.js 15 compatibility
4. **Testing**: Comprehensive test coverage for all critical functionality

## Database Models

1. **Exercise**: Individual exercises with categories (strength, cardio, etc.)
2. **Workout**: Completed workout sessions with exercises
3. **WorkoutTemplate**: Pre-built and custom workout templates
4. **WorkoutSession**: Active workout tracking

## Important Implementation Notes

- **Imperial Units**: Default to pounds and miles throughout the app
- **Database Fallback**: App gracefully falls back to localStorage when database is unavailable
- **Mobile Optimized**: UI is optimized for gym use with large, touch-friendly buttons
- **Dark Mode**: Full dark mode support with system preference detection
- **Type Safety**: Strict TypeScript throughout with Next.js 15 compatibility
- **API-First**: All database operations go through API routes, never direct browser access

## Environment Setup

1. Copy `.env.example` to `.env`
2. Run `make db-setup` to start database and apply schema
3. Run `make dev` to start development server
4. Run `npm test` to verify all tests pass

## Testing Strategy

### **Current Test Coverage:**
- ✅ **Utility Functions**: localStorage, file import (CSV/JSON/XML)
- ✅ **Database Hooks**: useDatabase, useExercises, useWorkouts
- ✅ **API Routes**: exercises CRUD, health checks
- ✅ **Components**: Button, WorkoutTemplateSelector
- ✅ **Integration**: localStorage fallback scenarios

### **Testing Commands:**
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode for development
npm run test:coverage       # Coverage report
npm test -- __tests__/utils/  # Test specific directory
```

## Common Tasks

### Adding New Exercise Categories
- Update exercise types in `utils/fileImport.ts` VALID_CATEGORIES
- Modify category selection in exercise forms
- Update validation logic for new categories

### Adding New Workout Features
- Modify `WorkoutSession` model in Prisma schema
- Update hooks in `hooks/` directory
- Add corresponding API routes in `app/api/`
- Write tests for new functionality

### Database Operations
- Always ensure graceful fallback to localStorage
- Use hooks from `hooks/` for database operations
- Test both database and localStorage modes
- All database access goes through API routes

## Key Files to Know

### **Core Application:**
- `app/page.tsx` - Dashboard with quick stats and recent workouts
- `app/workouts/session/page.tsx` - Live workout tracking interface
- `app/templates/page.tsx` - Pre-built workout templates with modal details
- `app/progress/page.tsx` - Progress tracking and analytics
- `app/import/page.tsx` - File import system for exercises/workouts

### **Database & State Management:**
- `hooks/useDatabase.ts` - Database connection management with health checks
- `hooks/useExercises.ts` - Exercise CRUD with API routes and localStorage fallback
- `hooks/useWorkouts.ts` - Workout management with CRUD operations and deletion support
- `app/api/health/database/route.ts` - Database health check endpoint
- `app/api/workouts/[id]/route.ts` - Individual workout DELETE and PUT operations

### **Utility Functions:**
- `utils/localStorage.ts` - localStorage management with error handling
- `utils/fileImport.ts` - File parsing (CSV, JSON, XML) with validation

### **Testing:**
- `__tests__/` - Comprehensive test suite with 90%+ coverage
- `jest.config.js` - Jest configuration with Next.js support
- `jest.setup.js` - Test environment setup and mocks

## Pre-built Workout Templates

1. **Push Day** (Intermediate, 60-75 min): Bench Press, Shoulder Press, Incline Press, Tricep Dips, Lateral Raises, Push-ups
2. **Pull Day** (Intermediate, 60-75 min): Pull-ups, Barbell Rows, Lat Pulldowns, Bicep Curls, Face Pulls, Hammer Curls  
3. **Leg Day** (Advanced, 75-90 min): Squats, Romanian Deadlifts, Lunges, Leg Press, Calf Raises, Leg Curls
4. **Upper Body** (Intermediate, 75-90 min): Mixed upper body exercises combining push/pull
5. **Lower Body** (Intermediate, 60-75 min): Comprehensive lower body strength and power
6. **Full Body** (Beginner, 45-60 min): Complete workout targeting all major muscle groups

## Data Import Support

The app supports importing exercises and workouts from:
- **CSV**: Comma-separated values with proper field validation
- **JSON**: JavaScript Object Notation with array structure validation
- **XML**: Extensible Markup Language with element parsing

### **Import Validation:**
- Exercise data: name, category, muscleGroup, equipment, difficulty, instructions
- Workout data: name, date, status (planned/completed), exerciseName, setNumber, reps, weight, duration, distance
- Optional fields: order (defaults to array index), notes for workouts and sets
- Comprehensive error handling and data sanitization
- Status-aware import: workouts can be imported as planned or completed

See `/sample-imports/` for example files and format documentation.

## Next Steps / Future Enhancements

### **Potential Areas for Extension:**
1. **User Authentication**: Add user accounts and data isolation
2. **Social Features**: Share workouts, follow other users
3. **Advanced Analytics**: Detailed progress charts and trends
4. **Mobile App**: React Native version for better mobile experience
5. **Workout Plans**: Multi-week workout programming
6. **Exercise Library**: Expanded exercise database with video demonstrations

### **Technical Improvements:**
1. **Real-time Updates**: WebSocket integration for live workout sharing
2. **Offline-First**: Enhanced PWA capabilities
3. **Performance**: Image optimization for exercise demonstrations
4. **Internationalization**: Multi-language support

## Development Guidelines

### **Code Quality:**
- All new features must include comprehensive tests
- Maintain 90%+ test coverage on critical functionality
- Follow TypeScript strict mode requirements
- Use Tailwind CSS for consistent styling

### **Database Access:**
- Never use Prisma directly in client components
- All database operations through API routes
- Always implement localStorage fallback
- Test both online and offline scenarios

### **Testing Requirements:**
- Unit tests for all utilities and hooks
- Integration tests for complex workflows
- Component tests for user interactions
- API route tests for all endpoints

The application is **production-ready** with comprehensive testing, Next.js 15 compatibility, and full feature completeness as originally requested.