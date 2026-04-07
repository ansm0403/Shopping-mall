import React from 'react'
import { HiOutlineBars3 } from 'react-icons/hi2'

const sizeMap = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
} as const;

interface CategoryIconProps {
    size?: keyof typeof sizeMap,
    color?: string,
    className?: string
}


export default function CategoryIcon({size = "sm", color, className} : CategoryIconProps) {
  return (
    <HiOutlineBars3 
        size= {sizeMap[size]} 
        className={[color, className].filter(Boolean).join(" ")}
    />
  )
}
