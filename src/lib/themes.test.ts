import { describe, expect, it } from 'vitest'
import { normalizeThemes, numericTheme, resolveSelectedTheme } from './themes'

const stages = Array.from({ length: 12 }, (_, index) => ({
  id: `stage-${index}`,
  theme: { id: 'animals' },
  value: 2 ** (index + 1),
  label: `Lv ${index + 1}`,
  image: { url: `https://example.test/${index}.png` },
  backgroundColor: '#123456',
}))

describe('normalizeThemes', () => {
  it('accepts a complete, valid theme', () => {
    const themes = normalizeThemes([{ id: 'animals', slug: 'animals', name: '森の動物' }], stages)
    expect(themes).toHaveLength(1)
    expect(themes[0].stages[4096].label).toBe('Lv 12')
  })

  it('rejects a theme with duplicate or missing stages', () => {
    expect(normalizeThemes([{ id: 'animals', slug: 'animals', name: '森の動物' }], [...stages, { ...stages[0], id: 'duplicate' }])).toHaveLength(0)
    expect(normalizeThemes([{ id: 'animals', slug: 'animals', name: '森の動物' }], stages.slice(1))).toHaveLength(0)
  })

  it('restores the saved theme and falls back to numbers', () => {
    const themes = normalizeThemes([{ id: 'animals', slug: 'animals', name: '森の動物' }], stages)
    expect(resolveSelectedTheme(themes, 'animals').name).toBe('森の動物')
    expect(resolveSelectedTheme([], 'missing')).toBe(numericTheme)
  })
})
