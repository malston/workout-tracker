import Link from 'next/link'

interface WorkoutCardProps {
  workout: {
    id: string
    name: string
    date: string
    duration: number
    exercises: number
    totalVolume: number
  }
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
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

  return (
    <Link href={`/workouts/${workout.id}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            {workout.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {formatDate(workout.date)}
          </p>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatDuration(workout.duration)}
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
              {(workout.totalVolume / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Volume (lbs)</p>
          </div>
        </div>
      </div>
    </Link>
  )
}