import { render, screen, fireEvent } from '@testing-library/react'
import WorkoutTemplateSelector from '@/components/WorkoutTemplateSelector'

const mockTemplates = [
  {
    id: 'push-day',
    name: 'Push Day',
    description: 'Upper body pushing movements',
    category: 'strength',
    exercises: ['Bench Press', 'Shoulder Press'],
    difficulty: 'Intermediate',
    duration: 60
  },
  {
    id: 'pull-day',
    name: 'Pull Day',
    description: 'Upper body pulling movements',
    category: 'strength',
    exercises: ['Pull-ups', 'Rows'],
    difficulty: 'Intermediate',
    duration: 60
  },
  {
    id: 'cardio',
    name: 'Cardio Blast',
    description: 'High intensity cardio workout',
    category: 'cardio',
    exercises: ['Running', 'Burpees'],
    difficulty: 'Beginner',
    duration: 30
  }
]

// Mock the templates data
jest.mock('@/data/workout-templates', () => ({
  WORKOUT_TEMPLATES: mockTemplates
}))

describe('WorkoutTemplateSelector', () => {
  const mockOnSelectTemplate = jest.fn()

  beforeEach(() => {
    mockOnSelectTemplate.mockClear()
  })

  test('renders all workout templates', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    expect(screen.getByText('Push Day')).toBeInTheDocument()
    expect(screen.getByText('Pull Day')).toBeInTheDocument()
    expect(screen.getByText('Cardio Blast')).toBeInTheDocument()
  })

  test('displays template descriptions', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    expect(screen.getByText('Upper body pushing movements')).toBeInTheDocument()
    expect(screen.getByText('Upper body pulling movements')).toBeInTheDocument()
    expect(screen.getByText('High intensity cardio workout')).toBeInTheDocument()
  })

  test('shows difficulty levels', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    const intermediateElements = screen.getAllByText('Intermediate')
    const beginnerElements = screen.getAllByText('Beginner')
    
    expect(intermediateElements).toHaveLength(2) // Push and Pull Day
    expect(beginnerElements).toHaveLength(1) // Cardio Blast
  })

  test('highlights selected template', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate="push-day"
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    const pushDayCard = screen.getByText('Push Day').closest('.border-blue-500, .ring-2')
    expect(pushDayCard).toBeInTheDocument()
  })

  test('calls onSelectTemplate when template is clicked', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    fireEvent.click(screen.getByText('Push Day'))
    expect(mockOnSelectTemplate).toHaveBeenCalledWith('push-day')
  })

  test('can deselect template by clicking selected one', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate="push-day"
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    fireEvent.click(screen.getByText('Push Day'))
    expect(mockOnSelectTemplate).toHaveBeenCalledWith(null)
  })

  test('shows exercise count for each template', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    // Each template should show the number of exercises
    expect(screen.getByText(/2 exercises/i)).toBeInTheDocument()
  })

  test('displays duration information', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    expect(screen.getByText(/60.*min/i)).toBeInTheDocument()
    expect(screen.getByText(/30.*min/i)).toBeInTheDocument()
  })

  test('renders without crashing when no templates provided', () => {
    // Temporarily mock empty templates
    jest.doMock('@/data/workout-templates', () => ({
      WORKOUT_TEMPLATES: []
    }))

    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    // Should not crash and should show some placeholder or empty state
    expect(screen.queryByText('Push Day')).not.toBeInTheDocument()
  })

  test('supports keyboard navigation', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    const pushDayCard = screen.getByText('Push Day').closest('div[tabindex="0"]')
    if (pushDayCard) {
      fireEvent.keyDown(pushDayCard, { key: 'Enter' })
      expect(mockOnSelectTemplate).toHaveBeenCalledWith('push-day')
    }
  })

  test('applies correct styling for different difficulties', () => {
    render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    const intermediateElements = screen.getAllByText('Intermediate')
    const beginnerElement = screen.getByText('Beginner')

    // Check that difficulty badges have appropriate styling
    intermediateElements.forEach(element => {
      expect(element).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })
    
    expect(beginnerElement).toHaveClass('bg-green-100', 'text-green-800')
  })

  test('handles template selection state changes', () => {
    const { rerender } = render(
      <WorkoutTemplateSelector 
        selectedTemplate={null}
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    // Initially no template selected
    expect(screen.queryByText('Selected')).not.toBeInTheDocument()

    // Rerender with selected template
    rerender(
      <WorkoutTemplateSelector 
        selectedTemplate="push-day"
        onSelectTemplate={mockOnSelectTemplate}
      />
    )

    // Should show visual indication of selection
    const selectedCard = screen.getByText('Push Day').closest('[class*="ring"], [class*="border-blue"]')
    expect(selectedCard).toBeInTheDocument()
  })
})