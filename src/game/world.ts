import {
  BIRD_R,
  BIRD_X,
  FLAP,
  GRAVITY,
  GROUND_H,
  HEIGHT,
  MAX_FALL,
  PIPE_EVERY,
  PIPE_GAP,
  PIPE_SPEED,
  PIPE_W,
  BEST_KEY,
} from './constants.ts'
import type { World } from './types.ts'

export function loadBest(): number {
  return Number(localStorage.getItem(BEST_KEY) ?? '0')
}

export function createWorld(): World {
  return {
    phase: 'ready',
    birdY: HEIGHT / 2,
    birdV: 0,
    pipes: [],
    spawnT: 0,
    score: 0,
    best: loadBest(),
    groundX: 0,
    wing: 0,
  }
}

export function resetWorld(world: World) {
  world.phase = 'ready'
  world.birdY = HEIGHT / 2
  world.birdV = 0
  world.pipes = []
  world.spawnT = 0
  world.score = 0
  world.groundX = 0
  world.wing = 0
}

export function flapBird(world: World) {
  if (world.phase === 'over') {
    resetWorld(world)
    return
  }
  if (world.phase === 'ready') world.phase = 'playing'
  world.birdV = FLAP
}

function spawnPipe(world: World) {
  const margin = 50
  const min = margin + PIPE_GAP / 2
  const max = HEIGHT - GROUND_H - margin - PIPE_GAP / 2
  world.pipes.push({
    x: 420,
    gapY: min + Math.random() * (max - min),
    scored: false,
  })
}

function hitPipe(world: World, x: number, gapY: number) {
  const left = x
  const right = x + PIPE_W
  const top = gapY - PIPE_GAP / 2
  const bot = gapY + PIPE_GAP / 2
  const overlapsX = BIRD_X + BIRD_R > left && BIRD_X - BIRD_R < right
  return overlapsX && (world.birdY - BIRD_R < top || world.birdY + BIRD_R > bot)
}

export function stepWorld(world: World, dt: number) {
  world.groundX = (world.groundX - PIPE_SPEED * dt * 1.1) % 24
  world.wing += dt * 10

  if (world.phase !== 'playing') return

  world.birdV = Math.min(MAX_FALL, world.birdV + GRAVITY * dt)
  world.birdY += world.birdV * dt

  world.spawnT += dt
  if (world.spawnT >= PIPE_EVERY) {
    world.spawnT = 0
    spawnPipe(world)
  }

  for (const pipe of world.pipes) {
    pipe.x -= PIPE_SPEED * dt
    if (!pipe.scored && pipe.x + PIPE_W < BIRD_X - BIRD_R) {
      pipe.scored = true
      world.score += 1
      if (world.score > world.best) {
        world.best = world.score
        localStorage.setItem(BEST_KEY, String(world.best))
      }
    }
  }
  world.pipes = world.pipes.filter((pipe) => pipe.x + PIPE_W > -40)

  if (world.birdY + BIRD_R >= HEIGHT - GROUND_H || world.birdY - BIRD_R <= 0) {
    world.phase = 'over'
    return
  }

  for (const pipe of world.pipes) {
    if (hitPipe(world, pipe.x, pipe.gapY)) {
      world.phase = 'over'
      return
    }
  }
}
