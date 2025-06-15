import { WORKOUT_TEMPLATES } from '@/data/workout-templates'

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
      {WORKOUT_TEMPLATES.map((template) => (
        <div
          key={template.id}
          onClick={() => onSelectTemplate(template.id)}
          className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
            selectedTemplate === template.id
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {template.emoji} {template.name}
            </h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              template.difficulty === 'Beginner' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : template.difficulty === 'Intermediate'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
            }`}>
              {template.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {template.description}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-3">
            {template.duration} • {template.exercises.length} exercises
          </p>
          <div className="space-y-1">
            {template.exercises.slice(0, 3).map((exercise, idx) => (
              <p key={idx} className="text-xs text-gray-500 dark:text-gray-500">
                • {exercise.name}
              </p>
            ))}
            {template.exercises.length > 3 && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                + {template.exercises.length - 3} more exercises
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}