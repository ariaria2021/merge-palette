<script lang="ts">
  import { onMount } from 'svelte'
  import Board from './components/Board.svelte'
  import GameOver from './components/GameOver.svelte'
  import Header from './components/Header.svelte'
  import ThemePicker from './components/ThemePicker.svelte'
  import { createGame, isGameOver, moveGrid } from './lib/game'
  import { fetchThemes } from './lib/microcms'
  import { numericTheme } from './lib/themes'
  import { createThemeOptionsLoader } from './lib/themeOptions'
  import type { ThemeLoadStatus } from './lib/themeOptions'
  import type { Direction, GameTheme } from './lib/types'

  const BEST_SCORE_KEY = 'merge-palette-best-score'
  const themeOptions = createThemeOptionsLoader(fetchThemes)
  let grid = $state(createGame())
  let score = $state(0)
  let bestScore = $state(0)
  let themes = $state<GameTheme[]>(themeOptions.state.themes)
  let theme = $state<GameTheme>(numericTheme)
  let themePickerOpen = $state(false)
  let themeLoadStatus = $state<ThemeLoadStatus>(themeOptions.state.status)
  let themeLoadError = $state<string | null>(themeOptions.state.error)
  let touchStart = $state<{ x: number; y: number } | null>(null)

  const gameOver = $derived(isGameOver(grid))

  const saveBestScore = (value: number) => localStorage.setItem(BEST_SCORE_KEY, String(value))

  const selectTheme = (nextTheme: GameTheme) => {
    theme = nextTheme
    themePickerOpen = false
  }

  const loadThemeOptions = async () => {
    const pending = themeOptions.load()
    const loadingState = themeOptions.state
    themes = loadingState.themes
    themeLoadStatus = loadingState.status
    themeLoadError = loadingState.error

    const loadedState = await pending
    themes = loadedState.themes
    themeLoadStatus = loadedState.status
    themeLoadError = loadedState.error
  }

  const openThemePicker = () => {
    themePickerOpen = true
    void loadThemeOptions()
  }

  const resetGame = () => {
    grid = createGame()
    score = 0
  }

  const move = (direction: Direction) => {
    if (gameOver) return
    const result = moveGrid(grid, direction)
    if (!result.moved) return
    grid = result.grid
    score += result.score
    if (score > bestScore) {
      bestScore = score
      saveBestScore(bestScore)
    }
  }

  const handleKeydown = (event: KeyboardEvent) => {
    const keyToDirection: Record<string, Direction> = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
    }
    const direction = keyToDirection[event.key]
    if (!direction) return
    event.preventDefault()
    move(direction)
  }

  const handleTouchEnd = (event: TouchEvent) => {
    if (!touchStart || gameOver) return
    const point = event.changedTouches[0]
    const horizontal = point.clientX - touchStart.x
    const vertical = point.clientY - touchStart.y
    touchStart = null
    if (Math.max(Math.abs(horizontal), Math.abs(vertical)) < 30) return
    move(Math.abs(horizontal) > Math.abs(vertical) ? (horizontal > 0 ? 'RIGHT' : 'LEFT') : (vertical > 0 ? 'DOWN' : 'UP'))
  }

  onMount(() => {
    const storedBest = Number(localStorage.getItem(BEST_SCORE_KEY))
    if (Number.isFinite(storedBest) && storedBest > 0) bestScore = storedBest

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })
</script>

<svelte:head><title>マージパレット</title></svelte:head>

<main class="app-shell">
  <Header {score} {bestScore} themeName={theme.name} onReset={resetGame} onOpenThemes={openThemePicker} />

  <div
    class="game-area"
    role="application"
    aria-label="マージパレットのゲーム盤"
    ontouchstart={(event) => touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY }}
    ontouchend={handleTouchEnd}
    ontouchcancel={() => touchStart = null}
  >
    <Board {grid} {theme} />
    <GameOver open={gameOver} onRetry={resetGame} />
  </div>
  <p class="instructions">矢印キーまたはスワイプで、同じタイルをつなげよう。</p>
</main>

<ThemePicker
  open={themePickerOpen}
  {themes}
  selectedId={theme.id}
  loading={themeLoadStatus === 'loading'}
  error={themeLoadError}
  onSelect={selectTheme}
  onRetry={() => void loadThemeOptions()}
  onClose={() => themePickerOpen = false}
/>
