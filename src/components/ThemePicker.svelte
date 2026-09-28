<script lang="ts">
  import type { GameTheme } from '../lib/types'

  let {
    open,
    themes,
    selectedId,
    onSelect,
    onClose,
  }: {
    open: boolean
    themes: GameTheme[]
    selectedId: string
    onSelect: (theme: GameTheme) => void
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
    </div>
  </div>
{/if}
