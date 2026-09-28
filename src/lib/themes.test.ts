import { describe, expect, it } from 'vitest'
import { normalizeThemes, numericTheme, resolveSelectedTheme } from './themes'
import type { RawTheme } from './themes'

const tiles = Array.from({ length: 12 }, (_, index) => ({
  fieldId: 'tile',
  value: 2 ** (index + 1),
  label: `Lv ${index + 1}`,
  image: { url: `https://example.test/${index}.png`, width: 512, height: 512 },
  backgroundColor: '#123456',
}))

const theme: RawTheme = { id: 'animals', name: '森の動物', tiles }

describe('normalizeThemes', () => {
  it('maps a complete theme from one CMS content item', () => {
    const themes = normalizeThemes([theme])
    expect(themes).toHaveLength(1)
    expect(themes[0].stages[4096].label).toBe('Lv 12')
    expect(themes[0].stages[2].imageUrl).toBe('https://example.test/0.png')
  })

  it('rejects duplicate, missing, or invalid tile data', () => {
    expect(normalizeThemes([{ ...theme, tiles: [...tiles, { ...tiles[0] }] }])).toHaveLength(0)
    expect(normalizeThemes([{ ...theme, tiles: tiles.slice(1) }])).toHaveLength(0)
    expect(normalizeThemes([{ ...theme, tiles: [{ ...tiles[0], fieldId: 'other' }, ...tiles.slice(1)] }])).toHaveLength(0)
    expect(normalizeThemes([{ ...theme, tiles: [{ ...tiles[0], image: undefined }, ...tiles.slice(1)] }])).toHaveLength(0)
    expect(normalizeThemes([{ ...theme, tiles: [{ ...tiles[0], image: { url: 'https://example.test/tiny.png', width: 3, height: 5 } }, ...tiles.slice(1)] }])).toHaveLength(0)
  })

  it('accepts a 512px roman theme and rejects an undersized thumbnail', () => {
    const roman = { ...theme, id: 'roman', name: 'roman', thumbnail: { url: 'https://example.test/roman.png', width: 512, height: 512 } }
    expect(normalizeThemes([roman])).toHaveLength(1)
    expect(normalizeThemes([{ ...roman, thumbnail: { ...roman.thumbnail, width: 5, height: 5 } }])).toHaveLength(0)
  })

  it('restores by the microCMS content ID and falls back to numbers', () => {
    const themes = normalizeThemes([theme])
    expect(resolveSelectedTheme(themes, 'animals').name).toBe('森の動物')
    expect(resolveSelectedTheme([], 'missing')).toBe(numericTheme)
  })
})
