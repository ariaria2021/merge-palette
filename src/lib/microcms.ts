import { normalizeThemes } from './themes'
import type { RawStage, RawTheme } from './themes'
import type { GameTheme } from './types'

interface ListResponse<T> {
  contents: T[]
}

const serviceDomain = import.meta.env.VITE_MICROCMS_SERVICE_DOMAIN as string | undefined
const apiKey = import.meta.env.VITE_MICROCMS_API_KEY as string | undefined

const getList = async <T>(endpoint: string): Promise<T[]> => {
  if (!serviceDomain || !apiKey) throw new Error('microCMSの接続設定がありません。')
  const response = await fetch(`https://${serviceDomain}.microcms.io/api/v1/${endpoint}?limit=100`, {
    headers: { 'X-MICROCMS-API-KEY': apiKey },
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`microCMSの取得に失敗しました (${response.status})`)
  return (await response.json() as ListResponse<T>).contents
}

export const fetchThemes = async (): Promise<GameTheme[]> => {
  const [themes, stages] = await Promise.all([
    getList<RawTheme>('themes'),
    getList<RawStage>('theme-stages'),
  ])
  return normalizeThemes(themes, stages)
}
