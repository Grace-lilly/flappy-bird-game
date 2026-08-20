import {
  BIRD_X,
  GROUND_H,
  HEIGHT,
  PIPE_GAP,
  PIPE_W,
  WIDTH,
} from './constants.ts'
import type { Pipe, World } from './types.ts'

function roundRect(
  ctx: CanvasRenderingContext2D,
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

function drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.beginPath()
  ctx.arc(x, y, 18 * s, 0, Math.PI * 2)
  ctx.arc(x + 22 * s, y - 8 * s, 22 * s, 0, Math.PI * 2)
  ctx.arc(x + 48 * s, y, 16 * s, 0, Math.PI * 2)
  ctx.fill()
}

function drawBackground(ctx: CanvasRenderingContext2D) {
  const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT)
  sky.addColorStop(0, '#4ec0ca')
  sky.addColorStop(1, '#d0f4f7')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, WIDTH, HEIGHT)

  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  drawCloud(ctx, 60, 80, 1)
  drawCloud(ctx, 250, 50, 0.8)
  drawCloud(ctx, 320, 130, 0.6)
}

function drawPipe(ctx: CanvasRenderingContext2D, pipe: Pipe) {
  const topH = pipe.gapY - PIPE_GAP / 2
  const botY = pipe.gapY + PIPE_GAP / 2
  const botH = HEIGHT - GROUND_H - botY
  const lip = 8

  ctx.fillStyle = '#73bf2e'
  ctx.strokeStyle = '#3d7a12'
  ctx.lineWidth = 3

  ctx.fillRect(pipe.x, 0, PIPE_W, topH)
  ctx.strokeRect(pipe.x, 0, PIPE_W, topH)
  roundRect(ctx, pipe.x - lip / 2, topH - 28, PIPE_W + lip, 28, 4, '#73bf2e', '#3d7a12')

  ctx.fillStyle = '#73bf2e'
  ctx.fillRect(pipe.x, botY, PIPE_W, botH)
  ctx.strokeRect(pipe.x, botY, PIPE_W, botH)
  roundRect(ctx, pipe.x - lip / 2, botY, PIPE_W + lip, 28, 4, '#73bf2e', '#3d7a12')

  ctx.fillStyle = 'rgba(255,255,255,0.18)'
  ctx.fillRect(pipe.x + 8, 0, 10, topH)
  ctx.fillRect(pipe.x + 8, botY, 10, botH)
}

function drawGround(ctx: CanvasRenderingContext2D, groundX: number) {
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

function drawBird(ctx: CanvasRenderingContext2D, world: World) {
  const tilt = Math.max(-0.6, Math.min(0.9, world.birdV / 500))
  ctx.save()
  ctx.translate(BIRD_X, world.birdY)
  ctx.rotate(tilt)

  ctx.fillStyle = '#f8d44c'
  ctx.beginPath()
  ctx.ellipse(0, 0, 18, 14, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = '#c48a12'
  ctx.lineWidth = 2
  ctx.stroke()

  const flapAmt = world.phase === 'playing' ? Math.sin(world.wing) * 8 : 0
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

export function drawWorld(ctx: CanvasRenderingContext2D, world: World) {
  drawBackground(ctx)
  for (const pipe of world.pipes) drawPipe(ctx, pipe)
  drawGround(ctx, world.groundX)
  drawBird(ctx, world)
}
