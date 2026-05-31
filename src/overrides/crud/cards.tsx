/* eslint-disable @typescript-eslint/no-explicit-any */
import type React from "react"

export const cards: Record<
  string,
  React.ComponentType<{
    isLoading: boolean
    data: any[]
    fetcher: (projection: Record<string, 1>) => void
  }>
> = {
  // Add your custom cards components here
  // E.g: posts: PostCards
}
