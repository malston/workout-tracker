'use client'

import Link from 'next/link'
import { Button } from '@/components'

export default function Home() {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div>
        <h1 className="text-4xl font-bold mb-4">Welcome to Workout Tracker</h1>
        <p className="text-muted-foreground text-lg">
          Track your workouts, monitor progress, and stay motivated on your fitness journey.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/workouts/new">
          <Button className="w-full h-16 text-lg" size="lg">
            🏋️ Start Workout
          </Button>
        </Link>
        <Link href="/exercises">
          <Button variant="outline" className="w-full h-16 text-lg" size="lg">
            💪 Browse Exercises
          </Button>
        </Link>
        <Link href="/workouts">
          <Button variant="outline" className="w-full h-16 text-lg" size="lg">
            📊 View History
          </Button>
        </Link>
        <Link href="/import">
          <Button variant="outline" className="w-full h-16 text-lg" size="lg">
            📁 Import Data
          </Button>
        </Link>
      </div>

      {/* Simple Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Welcome to your personal workout tracker! Start by creating your first workout or browsing available exercises.
        </p>
        <div className="space-y-2">
          <p>• Track strength, cardio, and flexibility exercises</p>
          <p>• Monitor your progress over time</p>
          <p>• Import exercises from CSV, JSON, or XML files</p>
          <p>• Use pre-built workout templates</p>
        </div>
      </div>
    </div>
  )
}