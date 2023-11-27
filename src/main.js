import kaboom from "kaboom"

const k = kaboom({
  background: [255, 255, 255],
  root: document.querySelector("#root"),
  debug: true,
})

const CONTROLS_PADDING = 24
const CONTROLS_HEIGHT = 100
const FLOOR_HEIGHT = CONTROLS_PADDING * 2 + CONTROLS_HEIGHT
const JUMP_FORCE = 1000
const SPEED = 480
const GRAVITY = 2200
const SCORE_PADDING = 24
const PLAYER_X = k.width() * 0.05
const PLAYER_Y = k.height() - FLOOR_HEIGHT
const SPAWN_MIN = 0.75
const SPAWN_MAX = 1.25

let score = 0
let bestScore = 0

k.loadSprite("bean", "sprites/bean.png")

function createBtn({
  target,
  pos,
  f,
  anchor = "botleft",
  w = 80,
  h = 80,
  rad = 8,
  color = [255, 255, 255],
}) {
  const btn = k.add(
    [
      k.rect(w, h, {
        radius: rad,
      }),
      k.color(color),
      k.anchor(anchor),
      k.area(),
      k.body({ isStatic: true }),
      k.pos(pos),
    ],
    target
  )
  btn.add([])
  btn.onHoverUpdate(() => {
    btn.scale = k.vec2(1.2)
    k.setCursor("pointer")
  })
  btn.onHoverEnd(() => {
    btn.scale = k.vec2(1)
  })
  btn.onClick(f)
  return btn
}

k.scene("game", () => {
  k.setGravity(GRAVITY)

  const bean = k.add([
    k.sprite("bean"),
    k.pos(PLAYER_X, PLAYER_Y),
    k.anchor("botleft"),
    k.area(),
    k.body(),
  ])

  k.add([
    k.rect(k.width(), FLOOR_HEIGHT),
    k.pos(0, k.height()),
    k.anchor("botleft"),
    k.area(),
    k.body({ isStatic: true }),
    k.color(127, 200, 255),
  ])

  function jump() {
    if (bean.pos.y >= k.height() - FLOOR_HEIGHT - 20) {
      bean.jump(JUMP_FORCE)
    }
  }

  function down() {
    if (bean.pos.y <= k.height() - FLOOR_HEIGHT - 180) {
      bean.jump(-JUMP_FORCE * 0.75)
    }
  }

  k.onKeyPress("space", jump)
  k.onKeyDown("shift", down)

  function spawnTree() {
    k.add([
      k.rect(48, k.rand(24, 64)),
      k.area(),
      k.pos(k.width(), k.height() - FLOOR_HEIGHT),
      k.anchor("botleft"),
      k.color(255, 180, 255),
      k.offscreen({ destroy: true }),
      k.move(k.LEFT, SPEED),
      "tree",
    ])
    k.wait(k.rand(SPAWN_MIN, SPAWN_MAX), spawnTree)
  }

  spawnTree()

  bean.onCollide("tree", () => {
    k.go("lose")
    k.burp()
    k.addKaboom(bean.pos)
  })

  const btnLeft = createBtn({
    pos: k.vec2(CONTROLS_PADDING, k.height() - CONTROLS_PADDING),
    w: CONTROLS_HEIGHT,
    h: CONTROLS_HEIGHT,
    color: [120, 120, 120],
    f: jump,
  })

  const btnRight = createBtn({
    pos: k.vec2(k.width() - CONTROLS_PADDING, k.height() - CONTROLS_PADDING),
    w: CONTROLS_HEIGHT,
    h: CONTROLS_HEIGHT,
    anchor: "botright",
    f: down,
  })

  const scoreLabel = k.add([
    k.text(score),
    k.anchor("topright"),
    k.color(2, 2, 2),
    k.pos(k.width() - SCORE_PADDING, SCORE_PADDING),
  ])

  const bestScoreLabel = k.add([
    k.text(bestScore),
    k.anchor("topright"),
    k.color(180, 180, 180),
    k.pos(k.width() - 160, SCORE_PADDING),
  ])

  k.onUpdate(() => {
    k.setCursor("default")
    if (bean.pos.y > k.height() - FLOOR_HEIGHT + 30) {
      bean.moveTo(k.vec2(PLAYER_X, PLAYER_Y))
    }
    score += 0.25
    scoreLabel.text = Math.floor(score)
  })
})

k.scene("lose", () => {
  function reset() {
    k.go("game")
    if (score > bestScore) bestScore = Math.floor(score)
    score = 0
  }

  k.add([
    k.text("Game Over"),
    k.pos(k.width() / 2, k.height() / 2 - 80),
    k.color(2, 2, 2),
    k.scale(2),
    k.anchor("center"),
  ])

  k.add([
    k.text(Math.floor(score)),
    k.color(2, 2, 2),
    k.scale(2),
    k.pos(k.center()),
    k.anchor("center"),
  ])

  k.add([
    k.text("Press SPACE"),
    k.color(2, 2, 2),
    k.pos(k.width() / 2, k.height() / 2 + 80),
    k.anchor("center"),
  ])

  k.onKeyPress("space", reset)
  k.onClick(reset)
})

k.go("game")
