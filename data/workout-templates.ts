// Pre-built workout templates
export const WORKOUT_TEMPLATES = [
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Upper body pushing movements targeting chest, shoulders, and triceps',
    emoji: '💪',
    difficulty: 'Intermediate',
    duration: '60-75 minutes',
    exercises: [
      { name: 'Bench Press', sets: '4 sets x 8-12 reps', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Shoulder Press', sets: '3 sets x 10-12 reps', muscles: ['shoulders', 'triceps'] },
      { name: 'Incline Dumbbell Press', sets: '3 sets x 10-12 reps', muscles: ['chest', 'shoulders'] },
      { name: 'Tricep Dips', sets: '3 sets x 12-15 reps', muscles: ['triceps', 'chest'] },
      { name: 'Lateral Raises', sets: '3 sets x 12-15 reps', muscles: ['shoulders'] },
      { name: 'Push-ups', sets: '2 sets to failure', muscles: ['chest', 'shoulders', 'triceps'] }
    ]
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    description: 'Upper body pulling movements targeting back, biceps, and rear delts',
    emoji: '🔙',
    difficulty: 'Intermediate',
    duration: '60-75 minutes',
    exercises: [
      { name: 'Pull-ups', sets: '4 sets x 6-10 reps', muscles: ['back', 'biceps'] },
      { name: 'Barbell Rows', sets: '4 sets x 8-12 reps', muscles: ['back', 'biceps'] },
      { name: 'Lat Pulldowns', sets: '3 sets x 10-12 reps', muscles: ['back', 'biceps'] },
      { name: 'Bicep Curls', sets: '3 sets x 12-15 reps', muscles: ['biceps'] },
      { name: 'Face Pulls', sets: '3 sets x 15-20 reps', muscles: ['rear delts', 'back'] },
      { name: 'Hammer Curls', sets: '2 sets x 12-15 reps', muscles: ['biceps', 'forearms'] }
    ]
  },
  {
    id: 'leg-day',
    name: 'Leg Day',
    description: 'Lower body workout targeting quads, hamstrings, glutes, and calves',
    emoji: '🦵',
    difficulty: 'Advanced',
    duration: '75-90 minutes',
    exercises: [
      { name: 'Squats', sets: '4 sets x 8-12 reps', muscles: ['quadriceps', 'glutes'] },
      { name: 'Romanian Deadlifts', sets: '4 sets x 10-12 reps', muscles: ['hamstrings', 'glutes'] },
      { name: 'Lunges', sets: '3 sets x 12 reps each leg', muscles: ['quadriceps', 'glutes'] },
      { name: 'Leg Press', sets: '3 sets x 15-20 reps', muscles: ['quadriceps', 'glutes'] },
      { name: 'Calf Raises', sets: '4 sets x 15-20 reps', muscles: ['calves'] },
      { name: 'Leg Curls', sets: '3 sets x 12-15 reps', muscles: ['hamstrings'] }
    ]
  },
  {
    id: 'upper-body',
    name: 'Upper Body',
    description: 'Complete upper body workout combining push and pull movements',
    emoji: '🏋️',
    difficulty: 'Intermediate',
    duration: '75-90 minutes',
    exercises: [
      { name: 'Bench Press', sets: '4 sets x 8-10 reps', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull-ups', sets: '4 sets x 6-10 reps', muscles: ['back', 'biceps'] },
      { name: 'Shoulder Press', sets: '3 sets x 10-12 reps', muscles: ['shoulders', 'triceps'] },
      { name: 'Barbell Rows', sets: '3 sets x 10-12 reps', muscles: ['back', 'biceps'] },
      { name: 'Bicep Curls', sets: '3 sets x 12-15 reps', muscles: ['biceps'] },
      { name: 'Tricep Extensions', sets: '3 sets x 12-15 reps', muscles: ['triceps'] }
    ]
  },
  {
    id: 'lower-body',
    name: 'Lower Body',
    description: 'Comprehensive lower body strength and power workout',
    emoji: '🏃',
    difficulty: 'Intermediate',
    duration: '60-75 minutes',
    exercises: [
      { name: 'Deadlifts', sets: '4 sets x 6-8 reps', muscles: ['hamstrings', 'glutes', 'back'] },
      { name: 'Squats', sets: '4 sets x 10-12 reps', muscles: ['quadriceps', 'glutes'] },
      { name: 'Bulgarian Split Squats', sets: '3 sets x 10 reps each leg', muscles: ['quadriceps', 'glutes'] },
      { name: 'Hip Thrusts', sets: '3 sets x 12-15 reps', muscles: ['glutes', 'hamstrings'] },
      { name: 'Calf Raises', sets: '3 sets x 15-20 reps', muscles: ['calves'] },
      { name: 'Glute Bridges', sets: '2 sets x 15-20 reps', muscles: ['glutes'] }
    ]
  },
  {
    id: 'full-body',
    name: 'Full Body',
    description: 'Complete workout targeting all major muscle groups',
    emoji: '🔥',
    difficulty: 'Beginner',
    duration: '45-60 minutes',
    exercises: [
      { name: 'Squats', sets: '3 sets x 12-15 reps', muscles: ['quadriceps', 'glutes'] },
      { name: 'Push-ups', sets: '3 sets x 10-15 reps', muscles: ['chest', 'shoulders', 'triceps'] },
      { name: 'Pull-ups or Rows', sets: '3 sets x 8-12 reps', muscles: ['back', 'biceps'] },
      { name: 'Lunges', sets: '2 sets x 10 reps each leg', muscles: ['quadriceps', 'glutes'] },
      { name: 'Plank', sets: '3 sets x 30-60 seconds', muscles: ['core'] },
      { name: 'Shoulder Press', sets: '2 sets x 10-12 reps', muscles: ['shoulders'] }
    ]
  }
]

export type WorkoutTemplate = typeof WORKOUT_TEMPLATES[0]
export type TemplateExercise = typeof WORKOUT_TEMPLATES[0]['exercises'][0]