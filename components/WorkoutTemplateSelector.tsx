interface Template {
  id: string
  name: string
  description: string
  exercises: string[]
}

const templates: Template[] = [
  {
    id: 'push',
    name: 'Push Day',
    description: 'Chest, shoulders, and triceps',
    exercises: ['Bench Press', 'Shoulder Press', 'Chest Fly', 'Lateral Raises', 'Tricep Extensions']
  },
  {
    id: 'pull',
    name: 'Pull Day',
    description: 'Back and biceps',
    exercises: ['Deadlift', 'Pull-ups', 'Barbell Row', 'Face Pulls', 'Bicep Curls']
  },
  {
    id: 'legs',
    name: 'Leg Day',
    description: 'Quads, hamstrings, glutes, and calves',
    exercises: ['Squat', 'Romanian Deadlift', 'Leg Press', 'Leg Curls', 'Calf Raises']
  },
  {
    id: 'upper',
    name: 'Upper Body',
    description: 'Full upper body workout',
    exercises: ['Bench Press', 'Pull-ups', 'Shoulder Press', 'Barbell Row', 'Bicep Curls', 'Tricep Dips']
  },
  {
    id: 'lower',
    name: 'Lower Body',
    description: 'Full lower body workout',
    exercises: ['Squat', 'Deadlift', 'Lunges', 'Leg Press', 'Calf Raises']
  },
  {
    id: 'full',
    name: 'Full Body',
    description: 'Complete full body workout',
    exercises: ['Squat', 'Bench Press', 'Deadlift', 'Pull-ups', 'Shoulder Press']
  }
]

interface WorkoutTemplateSelectorProps {
  selectedTemplate: string | null
  onSelectTemplate: (templateId: string | null) => void
}

export default function WorkoutTemplateSelector({ 
  selectedTemplate, 
  onSelectTemplate 
}: WorkoutTemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Custom Workout Option */}
      <div
        onClick={() => onSelectTemplate(null)}
        className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
          selectedTemplate === null
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Custom Workout
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          Create your own workout from scratch
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          Add any exercises you want
        </p>
      </div>

      {/* Template Options */}
      {templates.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelectTemplate(template.id)}
          className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
            selectedTemplate === template.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {template.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {template.description}
          </p>
          <div className="space-y-1">
            {template.exercises.slice(0, 3).map((exercise, idx) => (
              <p key={idx} className="text-xs text-gray-500 dark:text-gray-500">
                • {exercise}
              </p>
            ))}
            {template.exercises.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                + {template.exercises.length - 3} more
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}