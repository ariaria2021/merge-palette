<script lang="ts">
  let { open, onRetry }: { open: boolean; onRetry: () => void } = $props()
</script>

{#if open}
  <div class="game-over" role="dialog" aria-modal="true" aria-label="ゲームオーバー">
    <div>
      <p>GAME OVER</p>
      <button class="button" type="button" onclick={onRetry}>もう一度</button>
    </div>
  </div>
{/if}
