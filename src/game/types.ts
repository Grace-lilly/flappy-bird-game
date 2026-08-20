export type GamePhase = 'ready' | 'playing' | 'over'

export type Pipe = {
  x: number
  gapY: number
  scored: boolean
}

export type World = {
  phase: GamePhase
  birdY: number
  birdV: number
  pipes: Pipe[]
  spawnT: number
  score: number
  best: number
  groundX: number
  wing: number
}
