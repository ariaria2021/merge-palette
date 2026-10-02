import { describe, expect, it, vi } from 'vitest'
import { createThemeOptionsLoader } from './themeOptions'
import type { GameTheme } from './types'

const remoteTheme: GameTheme = {
  id: 'remote-theme',
  name: '遠隔テーマ',
  stages: {},
}

describe('createThemeOptionsLoader', () => {
  it('does not fetch until the caller explicitly loads themes', async () => {
    const fetchThemes = vi.fn<() => Promise<GameTheme[]>>().mockResolvedValue([remoteTheme])
    const loader = createThemeOptionsLoader(fetchThemes)

    expect(loader.state.status).toBe('idle')
    expect(loader.state.themes).toHaveLength(1)
    expect(fetchThemes).not.toHaveBeenCalled()

    await loader.load()

    expect(fetchThemes).toHaveBeenCalledTimes(1)
    expect(loader.state.status).toBe('ready')
    expect(loader.state.themes).toEqual([loader.state.themes[0], remoteTheme])
  })

  it('reuses successful results for the current session', async () => {
    const fetchThemes = vi.fn<() => Promise<GameTheme[]>>().mockResolvedValue([remoteTheme])
    const loader = createThemeOptionsLoader(fetchThemes)

    await loader.load()
    await loader.load()

    expect(fetchThemes).toHaveBeenCalledTimes(1)
  })

  it('keeps the default theme after a failed fetch and permits a retry', async () => {
    const fetchThemes = vi.fn<() => Promise<GameTheme[]>>()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce([remoteTheme])
    const loader = createThemeOptionsLoader(fetchThemes)

    await loader.load()
    expect(loader.state.status).toBe('error')
    expect(loader.state.themes).toHaveLength(1)

    await loader.load()
    expect(fetchThemes).toHaveBeenCalledTimes(2)
    expect(loader.state.status).toBe('ready')
  })
})
