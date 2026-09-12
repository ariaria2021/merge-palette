<script lang="ts">
  import type { ThemeStage, Tile as TileType } from '../lib/types'

  let { tile, stage }: { tile: TileType; stage?: ThemeStage } = $props()
  const label = $derived(stage?.label ?? String(tile.value))
  const style = $derived(`--tile-background: ${stage?.backgroundColor ?? '#7c7696'};`)
</script>

<div
  class:tile--new={tile.isNew}
  class="tile"
  style={`${style} left: calc(${tile.position[1]} * (25% + var(--gap) / 4)); top: calc(${tile.position[0]} * (25% + var(--gap) / 4));`}
>
  {#if stage?.imageUrl}
    <img src={stage.imageUrl} alt={label} />
  {/if}
  <span class="tile__label">{label}</span>
</div>
