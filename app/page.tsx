'use client'

import { useState } from 'react'
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, LoadingSpinner, Modal, Select } from '@/components'

export default function Home() {
  const [modalOpen, setModalOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const selectOptions = [
    { value: 'bench', label: 'Bench Press' },
    { value: 'squat', label: 'Squat' },
    { value: 'deadlift', label: 'Deadlift' },
    { value: 'overhead', label: 'Overhead Press' },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-4">Workout Tracker</h1>
        <p className="text-muted-foreground">
          Welcome to your personal workout tracking application. Start by exploring the UI components below.
        </p>
      </div>

      {/* Button Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and sizes</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Button>
          <Button disabled>Disabled</Button>
        </CardContent>
      </Card>

      {/* Input Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>Input fields with validation states</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Enter workout name..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Input
            type="number"
            placeholder="Enter weight (kg)..."
          />
          <Input
            placeholder="This field has an error"
            error="Please enter a valid value"
          />
          <Input
            placeholder="Disabled input"
            disabled
          />
        </CardContent>
      </Card>

      {/* Select Example */}
      <Card>
        <CardHeader>
          <CardTitle>Select Dropdown</CardTitle>
          <CardDescription>Choose from predefined options</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            placeholder="Choose an exercise..."
          />
          <Select
            options={selectOptions}
            value="squat"
            onChange={setSelectValue}
            disabled
          />
          <Select
            options={selectOptions}
            value={selectValue}
            onChange={setSelectValue}
            error="Please select an exercise"
          />
        </CardContent>
      </Card>

      {/* Modal Example */}
      <Card>
        <CardHeader>
          <CardTitle>Modal Dialog</CardTitle>
          <CardDescription>Interactive modal windows</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Add New Workout"
            description="Create a new workout session with exercises"
          >
            <div className="space-y-4">
              <Input placeholder="Workout name..." />
              <Select
                options={selectOptions}
                placeholder="Select exercise..."
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setModalOpen(false)}>
                  Save Workout
                </Button>
              </div>
            </div>
          </Modal>
        </CardContent>
      </Card>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
          <CardDescription>Various loading spinner sizes</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <LoadingSpinner size="sm" />
          <LoadingSpinner size="md" />
          <LoadingSpinner size="lg" />
          <Button onClick={() => {
            setIsLoading(true)
            setTimeout(() => setIsLoading(false), 2000)
          }}>
            Show Full Screen Loader
          </Button>
          {isLoading && <LoadingSpinner fullScreen />}
        </CardContent>
      </Card>

      {/* Card Layouts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Today's Workout</CardTitle>
            <CardDescription>Upper Body Focus</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li>• Bench Press: 3x10</li>
              <li>• Overhead Press: 3x8</li>
              <li>• Dumbbell Rows: 3x12</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Start Workout</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Progress Stats</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Workouts:</span>
                <span className="font-semibold">5</span>
              </div>
              <div className="flex justify-between">
                <span>Total Volume:</span>
                <span className="font-semibold">12,450 kg</span>
              </div>
              <div className="flex justify-between">
                <span>Active Time:</span>
                <span className="font-semibold">4h 35m</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" variant="outline">
              New Workout
            </Button>
            <Button className="w-full" variant="outline">
              Add Exercise
            </Button>
            <Button className="w-full" variant="outline">
              View History
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}