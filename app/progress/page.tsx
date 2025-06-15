'use client'

import { useState, useEffect } from 'react'
import { useWorkouts } from '@/hooks/useWorkouts'
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, LoadingSpinner } from '@/components'

interface ProgressStats {
  totalWorkouts: number
  totalVolume: number
  totalTime: number
  averageWorkoutTime: number
  workoutsThisWeek: number
  workoutsThisMonth: number
  favoriteExercises: Array<{ name: string; count: number }>
  weeklyData: Array<{ week: string; workouts: number; volume: number }>
}

export default function ProgressPage() {
  const { workouts, loading } = useWorkouts()
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month')
  const [stats, setStats] = useState<ProgressStats>({
    totalWorkouts: 0,
    totalVolume: 0,
    totalTime: 0,
    averageWorkoutTime: 0,
    workoutsThisWeek: 0,
    workoutsThisMonth: 0,
    favoriteExercises: [],
    weeklyData: []
  })

  useEffect(() => {
    if (!workouts.length) return

    const now = new Date()
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Calculate basic stats
    const totalWorkouts = workouts.length
    const totalVolume = workouts.reduce((sum, workout) => {
      return sum + workout.exercises.reduce((exerciseSum, exercise) => {
        return exerciseSum + exercise.sets.reduce((setSum, set) => {
          return setSum + (set.weight || 0) * (set.reps || 0)
        }, 0)
      }, 0)
    }, 0)

    // Calculate time stats (placeholder - would need actual duration data)
    const totalTime = workouts.length * 60 // Assume 60 minutes per workout
    const averageWorkoutTime = totalTime / totalWorkouts || 0

    // Filter by time ranges
    const workoutsThisWeek = workouts.filter(w => new Date(w.date) >= oneWeekAgo).length
    const workoutsThisMonth = workouts.filter(w => new Date(w.date) >= oneMonthAgo).length

    // Calculate favorite exercises
    const exerciseFrequency: Record<string, number> = {}
    workouts.forEach(workout => {
      workout.exercises.forEach(exercise => {
        const name = exercise.exercise.name
        exerciseFrequency[name] = (exerciseFrequency[name] || 0) + 1
      })
    })

    const favoriteExercises = Object.entries(exerciseFrequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Generate weekly data for last 8 weeks
    const weeklyData = []
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000)
      
      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date)
        return workoutDate >= weekStart && workoutDate < weekEnd
      })

      const weekVolume = weekWorkouts.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((exerciseSum, exercise) => {
          return exerciseSum + exercise.sets.reduce((setSum, set) => {
            return setSum + (set.weight || 0) * (set.reps || 0)
          }, 0)
        }, 0)
      }, 0)

      weeklyData.push({
        week: weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        workouts: weekWorkouts.length,
        volume: weekVolume
      })
    }

    setStats({
      totalWorkouts,
      totalVolume,
      totalTime,
      averageWorkoutTime,
      workoutsThisWeek,
      workoutsThisMonth,
      favoriteExercises,
      weeklyData
    })
  }, [workouts])

  const formatVolume = (volume: number) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}k lbs`
    }
    return `${volume.toLocaleString()} lbs`
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Progress Tracking
            </h1>
            <div className="flex space-x-2">
              {(['week', 'month', 'year'] as const).map((range) => (
                <Button
                  key={range}
                  variant={timeRange === range ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeRange(range)}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track your fitness journey and see how you're improving over time
          </p>
        </div>

        {workouts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">No workout data yet!</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Complete some workouts to see your progress and statistics here.
              </p>
              <Button>
                <a href="/workouts/new">Start Your First Workout</a>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Workouts</CardDescription>
                  <CardTitle className="text-3xl">{stats.totalWorkouts}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-600">
                    {stats.workoutsThisMonth} this month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Volume</CardDescription>
                  <CardTitle className="text-2xl">{formatVolume(stats.totalVolume)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-600">
                    Weight × Reps
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Time</CardDescription>
                  <CardTitle className="text-2xl">{formatTime(stats.totalTime)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-purple-600">
                    Avg: {formatTime(stats.averageWorkoutTime)}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>This Week</CardDescription>
                  <CardTitle className="text-3xl">{stats.workoutsThisWeek}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-600">
                    Keep it up!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Progress Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
                <CardDescription>Workout frequency and volume over the last 8 weeks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.weeklyData.map((week, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                        {week.week}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="text-sm">Workouts: {week.workouts}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${Math.min((week.workouts / 7) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                      <div className="w-24 text-right text-sm text-gray-600 dark:text-gray-400">
                        {formatVolume(week.volume)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Favorite Exercises */}
            <Card>
              <CardHeader>
                <CardTitle>Most Performed Exercises</CardTitle>
                <CardDescription>Your go-to exercises based on workout frequency</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.favoriteExercises.length > 0 ? (
                  <div className="space-y-3">
                    {stats.favoriteExercises.map((exercise, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium">{exercise.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {exercise.count} times
                          </span>
                          <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ 
                                width: `${(exercise.count / Math.max(...stats.favoriteExercises.map(e => e.count))) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No exercise data available yet.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Goals and Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Goals & Achievements</CardTitle>
                <CardDescription>Track your milestones and set new targets</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🎯</div>
                    <h4 className="font-semibold mb-1">Weekly Goal</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.workoutsThisWeek}/3 workouts
                    </p>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${Math.min((stats.workoutsThisWeek / 3) * 100, 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">🏆</div>
                    <h4 className="font-semibold mb-1">Consistency</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {stats.workoutsThisMonth > 8 ? 'Great!' : 'Keep going!'}
                    </p>
                  </div>

                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl mb-2">💪</div>
                    <h4 className="font-semibold mb-1">Total Volume</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatVolume(stats.totalVolume)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}