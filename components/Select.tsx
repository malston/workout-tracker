'use client'

import React, { useState, useRef, useEffect } from 'react'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  error?: string
  className?: string
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ options, value, onChange, placeholder = 'Select...', disabled = false, error, className = '' }, ref) => {
    const [isOpen, setIsOpen] = useState(false)
    const selectRef = useRef<HTMLDivElement>(null)
    
    const selectedOption = options.find(opt => opt.value === value)

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsOpen(false)
        }
      }

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isOpen])

    const handleSelect = (optionValue: string) => {
      onChange?.(optionValue)
      setIsOpen(false)
    }

    return (
      <div ref={ref} className="w-full">
        <div ref={selectRef} className="relative">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
              error ? 'border-destructive focus:ring-destructive' : ''
            } ${className}`}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
          >
            <span className={selectedOption ? '' : 'text-muted-foreground'}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <svg
              className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
              <ul
                className="max-h-60 overflow-auto rounded-md py-1 text-base focus:outline-none sm:text-sm"
                role="listbox"
              >
                {options.map((option) => (
                  <li
                    key={option.value}
                    className={`relative cursor-pointer select-none py-2 px-3 hover:bg-accent hover:text-accent-foreground ${
                      option.value === value ? 'bg-accent/50' : ''
                    }`}
                    role="option"
                    aria-selected={option.value === value}
                    onClick={() => handleSelect(option.value)}
                  >
                    <span className="block truncate">{option.label}</span>
                    {option.value === value && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-primary">
                        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }