import type { GameTheme, ThemeStage } from './types'

const REQUIRED_VALUES = Array.from({ length: 12 }, (_, index) => 2 ** (index + 1))
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/
const IMAGE_SIZE = 512

interface RawImage {
  url?: string
  width?: number
  height?: number
}

const imageIsValid = (image: RawImage | undefined): boolean =>
  Boolean(image?.url) && image?.width === IMAGE_SIZE && image?.height === IMAGE_SIZE

export interface RawTile {
  fieldId?: string
  value?: number
  label?: string
  image?: RawImage
  backgroundColor?: string
}

export interface RawTheme {
  id: string
  name?: string
  thumbnail?: RawImage
  sortOrder?: number
  tiles?: RawTile[]
}

export const numericTheme: GameTheme = {
  id: 'local-numbers',
  name: '数字',
  stages: {},
}

const tileIsValid = (tile: RawTile): tile is RawTile & Required<Pick<RawTile, 'value' | 'label' | 'image' | 'backgroundColor'>> =>
  tile.fieldId === 'tile' &&
  typeof tile.value === 'number' && Number.isSafeInteger(tile.value) &&
  tile.value >= 2 && Number.isInteger(Math.log2(tile.value)) &&
  typeof tile.label === 'string' && tile.label.trim().length > 0 &&
  imageIsValid(tile.image) && typeof tile.backgroundColor === 'string' && HEX_COLOR.test(tile.backgroundColor)

export const normalizeThemes = (rawThemes: RawTheme[]): GameTheme[] =>
  rawThemes
    .filter((theme) => Boolean(theme.id && theme.name?.trim()) &&
      (!theme.thumbnail || imageIsValid(theme.thumbnail)))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .flatMap((theme) => {
      const rawTiles = theme.tiles ?? []
      if (!rawTiles.every(tileIsValid)) return []
      const values = rawTiles.map((tile) => tile.value)
      if (values.length !== new Set(values).size || !REQUIRED_VALUES.every((value) => values.includes(value))) return []

      const stages: Record<number, ThemeStage> = Object.fromEntries(rawTiles.map((tile) => [tile.value, {
        value: tile.value,
        label: tile.label.trim(),
        imageUrl: tile.image.url!,
        backgroundColor: tile.backgroundColor,
      }]))

      return [{
        id: theme.id,
        name: theme.name!.trim(),
        thumbnailUrl: theme.thumbnail?.url,
        stages,
      }]
    })

export const resolveSelectedTheme = (themes: GameTheme[], savedId: string | null): GameTheme =>
  themes.find((theme) => theme.id === savedId) ?? themes[0] ?? numericTheme
