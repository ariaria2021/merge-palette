import type { GameTheme, ThemeStage } from './types'

const REQUIRED_VALUES = Array.from({ length: 12 }, (_, index) => 2 ** (index + 1))
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

export interface RawTheme {
  id: string
  slug?: string
  name?: string
  thumbnail?: { url?: string }
  sortOrder?: number
}

export interface RawStage {
  id: string
  theme?: { id?: string } | string
  value?: number
  label?: string
  image?: { url?: string }
  backgroundColor?: string
}

export const numericTheme: GameTheme = {
  id: 'local-numbers',
  slug: 'numbers',
  name: '数字',
  stages: {},
}

const getThemeId = (theme: RawStage['theme']) => typeof theme === 'string' ? theme : theme?.id
const stageIsValid = (stage: RawStage): stage is RawStage & Required<Pick<RawStage, 'value' | 'label' | 'image' | 'backgroundColor'>> =>
  typeof stage.value === 'number' && stage.value >= 2 && (stage.value & (stage.value - 1)) === 0 &&
  typeof stage.label === 'string' && stage.label.trim().length > 0 &&
  Boolean(stage.image?.url) && typeof stage.backgroundColor === 'string' && HEX_COLOR.test(stage.backgroundColor)

export const normalizeThemes = (rawThemes: RawTheme[], rawStages: RawStage[]): GameTheme[] => {
  const stagesByTheme = new Map<string, ThemeStage[]>()

  rawStages.filter(stageIsValid).forEach((stage) => {
    const themeId = getThemeId(stage.theme)
    if (!themeId) return
    const stages = stagesByTheme.get(themeId) ?? []
    stages.push({
      value: stage.value,
      label: stage.label.trim(),
      imageUrl: stage.image.url!,
      backgroundColor: stage.backgroundColor,
    })
    stagesByTheme.set(themeId, stages)
  })

  return rawThemes
    .filter((theme) => Boolean(theme.id && theme.slug && theme.name))
    .sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0))
    .flatMap((theme) => {
      const stages = stagesByTheme.get(theme.id) ?? []
      const values = stages.map((stage) => stage.value)
      const unique = new Set(values)
      if (values.length !== unique.size || !REQUIRED_VALUES.every((value) => unique.has(value))) return []

      return [{
        id: theme.id,
        slug: theme.slug!,
        name: theme.name!.trim(),
        thumbnailUrl: theme.thumbnail?.url,
        stages: Object.fromEntries(stages.map((stage) => [stage.value, stage])),
      }]
    })
}

export const resolveSelectedTheme = (themes: GameTheme[], savedSlug: string | null): GameTheme =>
  themes.find((theme) => theme.slug === savedSlug) ?? themes[0] ?? numericTheme
