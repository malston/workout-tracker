'use client'

import { useState, useEffect } from 'react'

interface WorkoutTimerProps {
  startTime: string
}

export default function WorkoutTimer({ startTime }: WorkoutTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const start = new Date(startTime)
      const now = new Date()
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000)
      setElapsed(diff)
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    const pad = (num: number) => num.toString().padStart(2, '0')

    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`
    } else {
      return `${pad(minutes)}:${pad(secs)}`
    }
  }

  return (
    <div className="text-lg font-mono text-gray-600 dark:text-gray-400">
      {formatTime(elapsed)}
    </div>
  )
}