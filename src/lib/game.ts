import type { Direction, Grid, Tile } from './types'

export const GRID_SIZE = 4

const createId = () => Math.random().toString(36).slice(2, 11)

export const createEmptyGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () => Array<Tile | null>(GRID_SIZE).fill(null))

const emptyCells = (grid: Grid): [number, number][] => {
  const cells: [number, number][] = []
  grid.forEach((row, rowIndex) => row.forEach((tile, columnIndex) => {
    if (!tile) cells.push([rowIndex, columnIndex])
  }))
  return cells
}

export const addRandomTile = (grid: Grid): Grid => {
  const cells = emptyCells(grid)
  if (!cells.length) return grid

  const [row, column] = cells[Math.floor(Math.random() * cells.length)]
  const next = grid.map((line) => [...line])
  next[row][column] = {
    id: createId(),
    value: Math.random() < 0.9 ? 2 : 4,
    position: [row, column],
    isNew: true,
  }
  return next
}

export const createGame = () => addRandomTile(addRandomTile(createEmptyGrid()))

const rotateRight = (grid: Grid): Grid => {
  const next = createEmptyGrid()
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      next[column][GRID_SIZE - 1 - row] = grid[row][column]
    }
  }
  return next
}

const rotateLeft = (grid: Grid): Grid => {
  const next = createEmptyGrid()
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      next[GRID_SIZE - 1 - column][row] = grid[row][column]
    }
  }
  return next
}

const slideRow = (row: (Tile | null)[]) => {
  const tiles = row.filter((tile): tile is Tile => tile !== null)
  const merged: Tile[] = []
  let score = 0

  for (let index = 0; index < tiles.length; index += 1) {
    const current = tiles[index]
    const next = tiles[index + 1]
    if (next && current.value === next.value) {
      const value = current.value * 2
      merged.push({ id: createId(), value, position: current.position })
      score += value
      index += 1
    } else {
      merged.push({ ...current, isNew: false })
    }
  }

  return { row: [...merged, ...Array<Tile | null>(GRID_SIZE - merged.length).fill(null)], score }
}

export const moveGrid = (grid: Grid, direction: Direction) => {
  let working = grid.map((row) => [...row])
  if (direction === 'RIGHT') working = rotateRight(rotateRight(working))
  if (direction === 'UP') working = rotateLeft(working)
  if (direction === 'DOWN') working = rotateRight(working)

  let score = 0
  const movedRows = working.map((row) => {
    const result = slideRow(row)
    score += result.score
    return result.row
  })

  let next = movedRows
  if (direction === 'RIGHT') next = rotateLeft(rotateLeft(next))
  if (direction === 'UP') next = rotateRight(next)
  if (direction === 'DOWN') next = rotateLeft(next)

  const changed = JSON.stringify(grid.map((row) => row.map((tile) => tile?.value))) !==
    JSON.stringify(next.map((row) => row.map((tile) => tile?.value)))

  if (!changed) return { grid, moved: false, score: 0 }

  const positioned = next.map((row, rowIndex) => row.map((tile, columnIndex) =>
    tile ? { ...tile, position: [rowIndex, columnIndex] as [number, number] } : null,
  ))
  return { grid: addRandomTile(positioned), moved: true, score }
}

export const isGameOver = (grid: Grid) => {
  if (emptyCells(grid).length) return false
  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let column = 0; column < GRID_SIZE; column += 1) {
      const value = grid[row][column]?.value
      if (grid[row + 1]?.[column]?.value === value || grid[row][column + 1]?.value === value) return false
    }
  }
  return true
}
