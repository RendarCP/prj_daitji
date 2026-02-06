'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'

interface LocationTreeNode {
  id: string
  name: string
  level: number
  icon?: string | null
  color?: string | null
  itemCount?: number
  children?: LocationTreeNode[]
}

interface LocationTreeProps {
  location: LocationTreeNode
  onSelect?: (location: LocationTreeNode) => void
  selectedId?: string
  depth?: number
}

export function LocationTree({ 
  location, 
  onSelect, 
  selectedId,
  depth = 0 
}: LocationTreeProps) {
  const [isExpanded, setIsExpanded] = useState(depth === 0)
  const hasChildren = location.children && location.children.length > 0
  const isSelected = selectedId === location.id

  const handleToggle = () => {
    if (hasChildren) {
      setIsExpanded(!isExpanded)
    }
    onSelect?.(location)
  }

  const iconColor = location.color || '#64748b'
  const iconEmoji = location.icon || '📁'

  return (
    <div className="animate-slide-down">
      <button
        onClick={handleToggle}
        className={`
          w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all duration-200
          group touch-manipulation
          ${isSelected 
            ? 'bg-primary-100 text-primary-700 shadow-sm' 
            : 'hover:bg-secondary-100 text-secondary-700 active:bg-secondary-200'
          }
        `}
        aria-expanded={isExpanded}
        aria-label={`${location.name} ${hasChildren ? '(하위 폴더 있음)' : ''}`}
      >
        {/* Chevron for expandable nodes */}
        {hasChildren ? (
          <div className="flex-shrink-0 transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </div>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        {/* Folder Icon */}
        <div className="flex-shrink-0">
          {iconEmoji.startsWith('http') ? (
            isExpanded ? (
              <FolderOpen className="w-5 h-5" style={{ color: iconColor }} />
            ) : (
              <Folder className="w-5 h-5" style={{ color: iconColor }} />
            )
          ) : (
            <span className="text-lg" role="img" aria-hidden="true">
              {iconEmoji}
            </span>
          )}
        </div>

        {/* Location Name */}
        <span className={`flex-1 truncate font-medium ${isSelected ? 'font-semibold' : ''}`}>
          {location.name}
        </span>
        
        {/* Item Count Badge */}
        {location.itemCount !== undefined && location.itemCount > 0 && (
          <Badge 
            size="sm" 
            variant={isSelected ? 'primary' : 'default'}
            className="ml-auto"
          >
            {location.itemCount}
          </Badge>
        )}
      </button>

      {/* Children */}
      {isExpanded && hasChildren && (
        <div className="ml-6 mt-1 space-y-1 border-l-2 border-secondary-200 pl-2">
          {location.children!.map((child) => (
            <LocationTree
              key={child.id}
              location={child}
              onSelect={onSelect}
              selectedId={selectedId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}
