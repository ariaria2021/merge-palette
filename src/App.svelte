<script lang="ts">
  import { onMount } from 'svelte'
  import Board from './components/Board.svelte'
  import GameOver from './components/GameOver.svelte'
  import Header from './components/Header.svelte'
  import ThemePicker from './components/ThemePicker.svelte'
  import { createGame, isGameOver, moveGrid } from './lib/game'
  import { fetchThemes } from './lib/microcms'
  import { numericTheme, resolveSelectedTheme } from './lib/themes'
  import type { Direction, GameTheme } from './lib/types'

  const BEST_SCORE_KEY = 'merge-palette-best-score'
  const THEME_KEY = 'merge-palette-theme'
  let grid = $state(createGame())
  let score = $state(0)
  let bestScore = $state(0)
  let themes = $state<GameTheme[]>([numericTheme])
  let theme = $state<GameTheme>(numericTheme)
  let themePickerOpen = $state(false)
  let cmsUnavailable = $state(false)
  let touchStart = $state<{ x: number; y: number } | null>(null)

  const gameOver = $derived(isGameOver(grid))

  const saveBestScore = (value: number) => localStorage.setItem(BEST_SCORE_KEY, String(value))

  const selectTheme = (nextTheme: GameTheme) => {
    theme = nextTheme
    localStorage.setItem(THEME_KEY, nextTheme.id)
    themePickerOpen = false
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
    const savedId = localStorage.getItem(THEME_KEY)

    fetchThemes()
      .then((remoteThemes) => {
        if (!remoteThemes.length) throw new Error('利用できるテーマがありません。')
        themes = remoteThemes
        theme = resolveSelectedTheme(remoteThemes, savedId)
      })
      .catch(() => {
        cmsUnavailable = true
        theme = numericTheme
      })

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })
</script>

<svelte:head><title>マージパレット</title></svelte:head>

<main class="app-shell">
  <Header {score} {bestScore} themeName={theme.name} onReset={resetGame} onOpenThemes={() => themePickerOpen = true} />

  {#if cmsUnavailable}
    <p class="notice">テーマを読み込めなかったため、数字テーマで遊んでいます。</p>
  {/if}

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

<ThemePicker open={themePickerOpen} {themes} selectedId={theme.id} onSelect={selectTheme} onClose={() => themePickerOpen = false} />
