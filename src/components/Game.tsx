import { GameCanvas } from './GameCanvas.tsx'
import { GameOverScreen } from './GameOverScreen.tsx'
import { ScoreHud } from './ScoreHud.tsx'
import { StartScreen } from './StartScreen.tsx'
import { useFlappyGame } from '../hooks/useFlappyGame.ts'

export function Game() {
  const { canvasRef, phase, score, best, flap } = useFlappyGame()

  return (
    <section className="stage" onPointerDown={flap}>
      <GameCanvas canvasRef={canvasRef} />
      <ScoreHud score={score} visible={phase === 'playing'} />
      {phase === 'ready' ? <StartScreen /> : null}
      {phase === 'over' ? <GameOverScreen score={score} best={best} /> : null}
    </section>
  )
}
