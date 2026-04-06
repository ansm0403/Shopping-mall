import React from 'react'

interface SearchProps {
    onSearch: (query: string) => void
    placeholder?: string
    className?: string
}

export default function SearchBar(props : SearchProps) {
  return (
    <div>
        <label>
            <input 
                type = "text" 
                name = "search" 
                placeholder={props.placeholder} 
                className={props.className}
            />
        </label>
    </div>
  )
}
