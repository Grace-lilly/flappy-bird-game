type GameOverScreenProps = {
  score: number
  best: number
}

export function GameOverScreen({ score, best }: GameOverScreenProps) {
  return (
    <div className="overlay">
      <h2>Game over</h2>
      <p className="overlay-copy">
        Score {score}
        <span aria-hidden="true"> · </span>
        Best {best}
      </p>
      <p className="overlay-kicker">Click or Space to retry</p>
    </div>
  )
}
