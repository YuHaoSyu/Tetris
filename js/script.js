const ROWS = 20
const COLUMNS = 10
const block = Block.init(ROWS, COLUMNS)
const panel = new Panel(ROWS, COLUMNS)
const piece = new Piece()

let counter = 0
let lastTime = 0
function tick(time) {
  const deltaTime = time - lastTime
  counter += deltaTime
  lastTime = time

  if (counter > panel.interval) {
    piece.dropdown()
    counter = 0
  }

  if (!panel.freeze) requestAnimationFrame(tick)
}

panel.draw()

document.getElementById('start').addEventListener('click', function (e) {
  panel.start()
  requestAnimationFrame(tick)
  this.classList.add('disabled')
})
document.addEventListener('keydown', function (e) {
  if (panel.freeze) return
  if (e.code === 'ArrowUp') {
    piece.rotate()
  }
  if (e.code === 'ArrowDown') {
    piece.dropdown()
  }
  if (e.code === 'ArrowLeft') {
    piece.transitionX(-1)
  }
  if (e.code === 'ArrowRight') {
    piece.transitionX(1)
  }
})
