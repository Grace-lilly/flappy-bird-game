import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { HEIGHT, WIDTH } from '../game/constants.ts'
import { drawWorld } from '../game/draw.ts'
import type { GamePhase } from '../game/types.ts'
import { createWorld, flapBird, stepWorld } from '../game/world.ts'

export function useFlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const worldRef = useRef(createWorld())
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [score, setScore] = useState(0)
  const [best, setBest] = useState(() => worldRef.current.best)

  const publish = useEffectEvent(() => {
    const world = worldRef.current
    setPhase(world.phase)
    setScore(world.score)
    setBest(world.best)
  })

  const flap = useEffectEvent(() => {
    flapBird(worldRef.current)
    publish()
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = WIDTH
    canvas.height = HEIGHT

    let last = performance.now()
    let frame = 0
    let prevPhase: GamePhase = worldRef.current.phase
    let prevScore = worldRef.current.score
    let prevBest = worldRef.current.best

    const loop = (now: number) => {
      const dt = Math.min(0.033, (now - last) / 1000)
      last = now
      const world = worldRef.current
      stepWorld(world, dt)
      drawWorld(ctx, world)
      if (world.phase !== prevPhase || world.score !== prevScore || world.best !== prevBest) {
        prevPhase = world.phase
        prevScore = world.score
        prevBest = world.best
        publish()
      }
      frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)

    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault()
        flap()
      }
    }
    window.addEventListener('keydown', onKey)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  return { canvasRef, phase, score, best, flap }
}
