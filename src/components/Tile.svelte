<script lang="ts">
  import type { ThemeStage, Tile as TileType } from '../lib/types'

  let { tile, stage }: { tile: TileType; stage?: ThemeStage } = $props()
  const label = $derived(stage?.label ?? String(tile.value))
  const defaultColors: Record<number, string> = {
    2: '#827CA1',
    4: '#937FB0',
    8: '#A26FAC',
    16: '#B56F96',
    32: '#C57A77',
    64: '#C49362',
    128: '#B5A65E',
    256: '#88A66C',
    512: '#5D9C91',
    1024: '#5485A7',
    2048: '#625EAA',
    4096: '#8763AA',
  }
  const backgroundColor = $derived(stage?.backgroundColor ?? defaultColors[tile.value] ?? '#706B87')
  const style = $derived(`--tile-background: ${backgroundColor};`)
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
