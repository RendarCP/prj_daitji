'use client'

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  error?: string
  helperText?: string
  options: SelectOption[]
  placeholder?: string
  leftIcon?: ReactNode
  fullWidth?: boolean
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    error, 
    helperText, 
    options,
    placeholder,
    leftIcon,
    fullWidth = true,
    ...props 
  }, ref) => {
    return (
      <div className={cn('flex flex-col gap-2', fullWidth ? 'w-full' : '')}>
        {label && (
          <label className="text-sm font-medium text-secondary-700">
            {label}
            {props.required && <span className="text-danger-500 ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary-500 pointer-events-none z-10">
              {leftIcon}
            </div>
          )}
          <select
            ref={ref}
            className={cn(
              'w-full px-4 py-2.5 border rounded-lg transition-all duration-200 text-secondary-900 bg-white',
              'appearance-none cursor-pointer',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              'disabled:bg-secondary-100 disabled:cursor-not-allowed disabled:text-secondary-500',
              error 
                ? 'border-danger-500 focus:ring-danger-500' 
                : 'border-secondary-300 hover:border-secondary-400',
              leftIcon && 'pl-10',
              'pr-10',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-500 pointer-events-none">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p id={`${props.id}-error`} className="text-sm text-danger-500 flex items-center gap-1">
            <span className="text-xs">⚠</span>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${props.id}-helper`} className="text-sm text-secondary-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
