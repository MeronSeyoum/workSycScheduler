import * as React from "react"
import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Optional flag to control the animation
   * @default true
   */
  animate?: boolean
  /**
   * Custom background color
   * @default "bg-gray-100"
   */
  bgColor?: string
}

function Skeleton({
  className,
  animate = true,
  bgColor = "bg-gray-200",
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md",
        animate && "animate-pulse",
        bgColor,
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }