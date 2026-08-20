import './style.css'
import { startGame } from './game.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <canvas id="game" width="400" height="600" aria-label="Flappy Bird"></canvas>
  <p class="hint">Space / click / tap to flap</p>
`

const canvas = document.querySelector<HTMLCanvasElement>('#game')!
startGame(canvas)
