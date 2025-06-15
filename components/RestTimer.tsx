'use client'

import { useState, useEffect } from 'react'

interface RestTimerProps {
  onClose: () => void
}

const REST_PRESETS = [30, 60, 90, 120, 180]

export default function RestTimer({ onClose }: RestTimerProps) {
  const [duration, setDuration] = useState(90) // Default 90 seconds
  const [timeLeft, setTimeLeft] = useState(90)
  const [isRunning, setIsRunning] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!isRunning || isPaused) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false)
          // Play notification sound or vibrate
          if ('vibrate' in navigator) {
            navigator.vibrate([200, 100, 200])
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, isPaused])

  const startTimer = () => {
    setTimeLeft(duration)
    setIsRunning(true)
    setIsPaused(false)
  }

  const togglePause = () => {
    setIsPaused(!isPaused)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setIsPaused(false)
    setTimeLeft(duration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = isRunning ? ((duration - timeLeft) / duration) * 100 : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rest Timer
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Timer Display */}
        <div className="text-center mb-6">
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-48 h-48 transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - progress / 100)}`}
                className="text-blue-500 transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-5xl font-bold text-gray-900 dark:text-white">
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>

        {/* Preset Buttons */}
        {!isRunning && (
          <div className="flex justify-center gap-2 mb-6">
            {REST_PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => setDuration(preset)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  duration === preset
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {preset}s
              </button>
            ))}
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex gap-2">
          {!isRunning ? (
            <button
              onClick={startTimer}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Timer
            </button>
          ) : (
            <>
              <button
                onClick={togglePause}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold text-lg transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
              <button
                onClick={resetTimer}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Reset
              </button>
            </>
          )}
        </div>

        {timeLeft === 0 && (
          <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <p className="text-green-800 dark:text-green-200 font-semibold">
              Rest time complete! Ready for your next set.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}