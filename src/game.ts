const WIDTH = 400
const HEIGHT = 600
const GROUND_H = 96
const BIRD_X = 90
const BIRD_R = 14
const GRAVITY = 1800
const FLAP = -420
const PIPE_W = 62
const PIPE_GAP = 150
const PIPE_SPEED = 160
const PIPE_EVERY = 1.45
const MAX_FALL = 620

type Pipe = { x: number; gapY: number; scored: boolean }

type State = 'ready' | 'playing' | 'over'

export function startGame(canvas: HTMLCanvasElement) {
  const maybeCtx = canvas.getContext('2d')
  if (!maybeCtx) throw new Error('Canvas 2D not available')
  const ctx: CanvasRenderingContext2D = maybeCtx

  canvas.width = WIDTH
  canvas.height = HEIGHT

  let state: State = 'ready'
  let birdY = HEIGHT / 2
  let birdV = 0
  let pipes: Pipe[] = []
  let spawnT = 0
  let score = 0
  let best = Number(localStorage.getItem('flappy-best') ?? '0')
  let groundX = 0
  let last = performance.now()
  let wing = 0

  function reset() {
    state = 'ready'
    birdY = HEIGHT / 2
    birdV = 0
    pipes = []
    spawnT = 0
    score = 0
    groundX = 0
  }

  function flap() {
    if (state === 'over') {
      reset()
      return
    }
    if (state === 'ready') state = 'playing'
    birdV = FLAP
  }

  function spawnPipe() {
    const margin = 50
    const min = margin + PIPE_GAP / 2
    const max = HEIGHT - GROUND_H - margin - PIPE_GAP / 2
    pipes.push({
      x: WIDTH + 20,
      gapY: min + Math.random() * (max - min),
      scored: false,
    })
  }

  function hitPipe(p: Pipe) {
    const left = p.x
    const right = p.x + PIPE_W
    const top = p.gapY - PIPE_GAP / 2
    const bot = p.gapY + PIPE_GAP / 2
    const overlapsX = BIRD_X + BIRD_R > left && BIRD_X - BIRD_R < right
    return overlapsX && (birdY - BIRD_R < top || birdY + BIRD_R > bot)
  }

  function update(dt: number) {
    groundX = (groundX - PIPE_SPEED * dt * 1.1) % 24
    wing += dt * 10

    if (state !== 'playing') return

    birdV = Math.min(MAX_FALL, birdV + GRAVITY * dt)
    birdY += birdV * dt

    spawnT += dt
    if (spawnT >= PIPE_EVERY) {
      spawnT = 0
      spawnPipe()
    }

    for (const p of pipes) {
      p.x -= PIPE_SPEED * dt
      if (!p.scored && p.x + PIPE_W < BIRD_X - BIRD_R) {
        p.scored = true
        score += 1
        if (score > best) {
          best = score
          localStorage.setItem('flappy-best', String(best))
        }
      }
    }
    pipes = pipes.filter((p) => p.x + PIPE_W > -40)

    if (birdY + BIRD_R >= HEIGHT - GROUND_H || birdY - BIRD_R <= 0) {
      state = 'over'
      return
    }
    for (const p of pipes) {
      if (hitPipe(p)) {
        state = 'over'
        return
      }
    }
  }

  function roundRect(
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    fill: string,
    stroke?: string,
  ) {
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, r)
    ctx.fillStyle = fill
    ctx.fill()
    if (stroke) {
      ctx.strokeStyle = stroke
      ctx.lineWidth = 3
      ctx.stroke()
    }
  }

  function drawBackground() {
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT)
    sky.addColorStop(0, '#4ec0ca')
    sky.addColorStop(1, '#d0f4f7')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    drawCloud(60, 80, 1)
    drawCloud(250, 50, 0.8)
    drawCloud(320, 130, 0.6)
  }

  function drawCloud(x: number, y: number, s: number) {
    ctx.beginPath()
    ctx.arc(x, y, 18 * s, 0, Math.PI * 2)
    ctx.arc(x + 22 * s, y - 8 * s, 22 * s, 0, Math.PI * 2)
    ctx.arc(x + 48 * s, y, 16 * s, 0, Math.PI * 2)
    ctx.fill()
  }

  function drawPipe(p: Pipe) {
    const topH = p.gapY - PIPE_GAP / 2
    const botY = p.gapY + PIPE_GAP / 2
    const botH = HEIGHT - GROUND_H - botY
    const lip = 8

    ctx.fillStyle = '#73bf2e'
    ctx.strokeStyle = '#3d7a12'
    ctx.lineWidth = 3

    ctx.fillRect(p.x, 0, PIPE_W, topH)
    ctx.strokeRect(p.x, 0, PIPE_W, topH)
    roundRect(p.x - lip / 2, topH - 28, PIPE_W + lip, 28, 4, '#73bf2e', '#3d7a12')

    ctx.fillStyle = '#73bf2e'
    ctx.fillRect(p.x, botY, PIPE_W, botH)
    ctx.strokeRect(p.x, botY, PIPE_W, botH)
    roundRect(p.x - lip / 2, botY, PIPE_W + lip, 28, 4, '#73bf2e', '#3d7a12')

    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(p.x + 8, 0, 10, topH)
    ctx.fillRect(p.x + 8, botY, 10, botH)
  }

  function drawGround() {
    ctx.fillStyle = '#ded895'
    ctx.fillRect(0, HEIGHT - GROUND_H, WIDTH, GROUND_H)
    ctx.fillStyle = '#5c4018'
    ctx.fillRect(0, HEIGHT - GROUND_H, WIDTH, 6)
    ctx.fillStyle = '#83cb36'
    ctx.fillRect(0, HEIGHT - GROUND_H, WIDTH, 18)

    ctx.fillStyle = '#cbb96a'
    for (let x = groundX; x < WIDTH + 24; x += 24) {
      ctx.fillRect(x, HEIGHT - GROUND_H + 28, 12, 8)
    }
  }

  function drawBird() {
    const tilt = Math.max(-0.6, Math.min(0.9, birdV / 500))
    ctx.save()
    ctx.translate(BIRD_X, birdY)
    ctx.rotate(tilt)

    ctx.fillStyle = '#f8d44c'
    ctx.beginPath()
    ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#c48a12'
    ctx.lineWidth = 2
    ctx.stroke()

    const flapAmt = state === 'playing' ? Math.sin(wing) * 8 : 0
    ctx.fillStyle = '#f0f0f0'
    ctx.beginPath()
    ctx.ellipse(-6, 2 + flapAmt * 0.15, 10, 7, -0.4 + flapAmt * 0.05, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()

    ctx.fillStyle = '#fff'
    ctx.beginPath()
    ctx.arc(8, -4, 5.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.stroke()
    ctx.fillStyle = '#222'
    ctx.beginPath()
    ctx.arc(10, -4, 2.2, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#f47a20'
    ctx.beginPath()
    ctx.moveTo(14, 2)
    ctx.lineTo(26, 6)
    ctx.lineTo(14, 10)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()

    ctx.restore()
  }

  function drawHud() {
    ctx.textAlign = 'center'
    ctx.fillStyle = '#fff'
    ctx.strokeStyle = '#553'
    ctx.lineWidth = 6
    ctx.font = 'bold 42px system-ui, Segoe UI, sans-serif'
    if (state === 'playing') {
      ctx.strokeText(String(score), WIDTH / 2, 70)
      ctx.fillText(String(score), WIDTH / 2, 70)
    }

    ctx.font = 'bold 28px system-ui, Segoe UI, sans-serif'
    if (state === 'ready') {
      ctx.strokeText('Flappy Bird', WIDTH / 2, HEIGHT / 2 - 80)
      ctx.fillText('Flappy Bird', WIDTH / 2, HEIGHT / 2 - 80)
      ctx.font = '16px system-ui, Segoe UI, sans-serif'
      ctx.lineWidth = 4
      ctx.strokeText('Click or press Space to flap', WIDTH / 2, HEIGHT / 2 + 70)
      ctx.fillText('Click or press Space to flap', WIDTH / 2, HEIGHT / 2 + 70)
    }

    if (state === 'over') {
      roundRect(50, 150, WIDTH - 100, 220, 16, 'rgba(0,0,0,0.55)')
      ctx.fillStyle = '#fff'
      ctx.font = 'bold 32px system-ui, Segoe UI, sans-serif'
      ctx.fillText('Game over', WIDTH / 2, 200)
      ctx.font = '18px system-ui, Segoe UI, sans-serif'
      ctx.fillText(`Score  ${score}`, WIDTH / 2, 250)
      ctx.fillText(`Best   ${best}`, WIDTH / 2, 280)
      ctx.fillText('Click or Space to retry', WIDTH / 2, 330)
    }
  }

  function frame(now: number) {
    const dt = Math.min(0.033, (now - last) / 1000)
    last = now
    update(dt)
    drawBackground()
    for (const p of pipes) drawPipe(p)
    drawGround()
    drawBird()
    drawHud()
    requestAnimationFrame(frame)
  }

  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault()
    flap()
  })
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault()
      flap()
    }
  })

  requestAnimationFrame(frame)
}
