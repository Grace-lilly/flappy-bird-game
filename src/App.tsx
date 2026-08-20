import { Game } from './components/Game.tsx'

export function App() {
  return (
    <main className="app">
      <h1>Flappy Bird</h1>
      <Game />
      <p className="hint">Space / click / tap to flap</p>
    </main>
  )
}
