<script lang="ts">
  import type { GameTheme } from '../lib/types'

  let {
    open,
    themes,
    selectedId,
    loading,
    error,
    onSelect,
    onRetry,
    onClose,
  }: {
    open: boolean
    themes: GameTheme[]
    selectedId: string
    loading: boolean
    error: string | null
    onSelect: (theme: GameTheme) => void
    onRetry: () => void
    onClose: () => void
  } = $props()
</script>

{#if open}
  <div class="modal-backdrop" role="presentation" onclick={(event) => event.target === event.currentTarget && onClose()}>
    <div class="theme-picker" role="dialog" aria-modal="true" aria-labelledby="theme-picker-title">
      <div class="theme-picker__heading">
        <div><p>PALETTE</p><h2 id="theme-picker-title">テーマをえらぶ</h2></div>
        <button class="icon-button" type="button" aria-label="閉じる" onclick={onClose}>×</button>
      </div>
      <div class="theme-picker__grid">
        {#each themes as theme (theme.id)}
          <button
            class:theme-card--selected={theme.id === selectedId}
            class="theme-card"
            type="button"
            onclick={() => onSelect(theme)}
          >
            {#if theme.thumbnailUrl}
              <img src={theme.thumbnailUrl} alt="" />
            {:else}
              <span class="theme-card__placeholder">#</span>
            {/if}
            <strong>{theme.name}</strong>
          </button>
        {/each}
      </div>
      {#if loading}
        <p class="theme-picker__status" aria-live="polite">テーマを読み込んでいます…</p>
      {:else if error}
        <div class="theme-picker__status theme-picker__status--error" role="alert">
          <p>{error}</p>
          <button class="button button--secondary" type="button" onclick={onRetry}>再試行</button>
        </div>
      {/if}
    </div>
  </div>
{/if}
