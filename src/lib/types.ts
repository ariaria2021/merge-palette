export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

export interface Tile {
  id: string
  value: number
  position: [number, number]
  isNew?: boolean
}

export type Grid = (Tile | null)[][]

export interface ThemeStage {
  value: number
  label: string
  imageUrl: string
  backgroundColor: string
}

export interface GameTheme {
  id: string
  name: string
  thumbnailUrl?: string
  stages: Record<number, ThemeStage>
}
