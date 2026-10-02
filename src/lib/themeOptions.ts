import { numericTheme } from './themes'
import type { GameTheme } from './types'

export type ThemeLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ThemeOptionsState {
  status: ThemeLoadStatus
  themes: GameTheme[]
  error: string | null
}

type ThemeFetcher = () => Promise<GameTheme[]>

export const createThemeOptionsLoader = (fetchThemes: ThemeFetcher) => {
  let state: ThemeOptionsState = {
    status: 'idle',
    themes: [numericTheme],
    error: null,
  }
  let pending: Promise<ThemeOptionsState> | undefined

  const load = (): Promise<ThemeOptionsState> => {
    if (state.status === 'ready') return Promise.resolve(state)
    if (pending) return pending

    state = { status: 'loading', themes: state.themes, error: null }
    pending = fetchThemes()
      .then((remoteThemes) => {
        if (!remoteThemes.length) throw new Error('利用できるテーマがありません。')
        state = { status: 'ready', themes: [numericTheme, ...remoteThemes], error: null }
        return state
      })
      .catch(() => {
        state = {
          status: 'error',
          themes: [numericTheme],
          error: 'テーマを読み込めませんでした。もう一度お試しください。',
        }
        return state
      })
      .finally(() => {
        pending = undefined
      })

    return pending
  }

  return {
    get state() {
      return state
    },
    load,
  }
}
