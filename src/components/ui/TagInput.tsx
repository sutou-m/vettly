'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { X } from 'lucide-react'

interface TagInputProps {
  name: string
  label?: string
  defaultTags?: string[]
  placeholder?: string
}

export function TagInput({ name, label, defaultTags = [], placeholder }: TagInputProps) {
  const [tags, setTags] = useState<string[]>(defaultTags)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(value: string) {
    const trimmed = value.trim()
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setInputValue('')
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <span className="text-sm font-medium text-[#1C2B35]">{label}</span>}
      <input type="hidden" name={name} value={tags.join(',')} />
      <div
        className="min-h-[42px] w-full px-3 py-2 bg-white rounded-[6px] border border-[#D0D8D6] focus-within:border-[#00A896] focus-within:ring-1 focus-within:ring-[#00A896] transition-colors cursor-text flex flex-wrap gap-1.5 items-center"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-[#E6F5F3] text-[#00A896] text-xs font-medium px-2 py-0.5 rounded-[6px]"
          >
            {tag}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                removeTag(tag)
              }}
              className="hover:text-[#008A7C] transition-colors leading-none"
              aria-label={`${tag}を削除`}
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            if (inputValue.trim()) addTag(inputValue)
          }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] text-sm text-[#1C2B35] placeholder:text-[#6B7F7C] outline-none bg-transparent"
        />
      </div>
      <p className="text-xs text-[#6B7F7C]">Enterキーでタグを追加</p>
    </div>
  )
}
