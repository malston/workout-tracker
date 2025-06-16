import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface WorkoutCardProps {
  workout: {
    id: string
    name: string
    date: string
    duration: number
    exercises: number
    totalVolume: number
    status?: 'planned' | 'completed'
  }
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  const router = useRouter()
  
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString()
    }
  }

  const isPlanned = workout.status === 'planned'

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {workout.name}
          </h3>
          {isPlanned && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              Planned
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {formatDate(workout.date)}
        </p>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-center mb-4">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {isPlanned ? '-' : formatDuration(workout.duration)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {workout.exercises}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Exercises</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {isPlanned ? '-' : (workout.totalVolume / 1000).toFixed(1) + 'k'}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Volume (lbs)</p>
        </div>
      </div>
      
      {isPlanned ? (
        <div className="space-y-2">
          <button
            onClick={() => router.push(`/workouts/session?workoutId=${workout.id}`)}
            className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Start Workout
          </button>
          <Link
            href={`/workouts/${workout.id}/edit`}
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            Edit Workout
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          <Link 
            href={`/workouts/${workout.id}`}
            className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-800 text-center py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            View Details
          </Link>
          <Link
            href={`/workouts/${workout.id}/edit`}
            className="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center py-2 px-4 rounded-lg font-semibold transition-colors"
          >
            Edit Workout
          </Link>
        </div>
      )}
    </div>
  )
}