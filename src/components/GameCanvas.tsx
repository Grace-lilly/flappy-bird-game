import type { RefObject } from 'react'

type GameCanvasProps = {
  canvasRef: RefObject<HTMLCanvasElement | null>
}

export function GameCanvas({ canvasRef }: GameCanvasProps) {
  return (
    <canvas
      ref={canvasRef}
      className="game-canvas"
      width={400}
      height={600}
      aria-label="Flappy Bird playfield"
    />
  )
}
