<script lang="ts">
  import Tile from './Tile.svelte'
  import type { GameTheme, Grid, Tile as TileType } from '../lib/types'

  let { grid, theme }: { grid: Grid; theme: GameTheme } = $props()
  const tiles = $derived(grid.flat().filter((tile): tile is TileType => tile !== null))
</script>

<div class="board" aria-label="4×4 のゲーム盤">
  <div class="board__background">
    {#each Array(16) as _}
      <div class="board__cell"></div>
    {/each}
  </div>
  <div class="board__tiles">
    {#each tiles as tile (tile.id)}
      <Tile {tile} stage={theme.stages[tile.value]} />
    {/each}
  </div>
</div>
