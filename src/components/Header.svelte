<script lang="ts">
  let {
    score,
    bestScore,
    themeName,
    onReset,
    onOpenThemes,
  }: {
    score: number
    bestScore: number
    themeName: string
    onReset: () => void
    onOpenThemes: () => void
  } = $props()
</script>

<header class="header">
  <div class="brand">
    <h1>マージパレット</h1>
    <p>{themeName}</p>
  </div>
  <div class="header-actions">
    <div class="score-box"><span>SCORE</span><strong>{score}</strong></div>
    <div class="score-box"><span>BEST</span><strong>{bestScore}</strong></div>
    <button class="button button--secondary" type="button" onclick={onOpenThemes}>テーマ</button>
    <button class="button" type="button" onclick={onReset}>新しく遊ぶ</button>
  </div>
</header>
