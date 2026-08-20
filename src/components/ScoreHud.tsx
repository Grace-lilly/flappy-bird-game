type ScoreHudProps = {
  score: number
  visible: boolean
}

export function ScoreHud({ score, visible }: ScoreHudProps) {
  if (!visible) return null

  return <p className="score-hud">{score}</p>
}
