class Tetromino {
  /* prettier-ignore */
  constructor(flattenIndex, colorIndex, size = 3) {
    this.blocks = Array(size).fill().map(
      (_, r) => Array(size).fill().map(
        (_, c) => +flattenIndex.includes(r * size + c) && colorIndex)
      )
  }
  rotate(times = 4) {
    const shapes = Array(times).fill(this.blocks.map(b => b))
    if (times === 1) return shapes

    shapes.reduce((pre, _, i, a) => {
      a[i] = pre.map((row, r) => row.map((_, c) => pre[c][r]).reverse())
      return a[i]
    })

    return shapes
  }
}

class Block {
  static size = 20
  static cvs = document.getElementById('tetris')
  static ctx = this.cvs.getContext('2d')
  static nextBlock = document.querySelectorAll('.next-block')
  static tetrominos = {
    O: new Tetromino([0, 1, 2, 3], 2, 2),
    S: new Tetromino([1, 2, 3, 4], 3),
    Z: new Tetromino([0, 1, 4, 5], 4),
    I: new Tetromino([4, 5, 6, 7], 5, 4),
    J: new Tetromino([0, 3, 4, 5], 6),
    L: new Tetromino([2, 3, 4, 5], 7),
    T: new Tetromino([1, 3, 4, 5], 8)
  }

  static init(ROWS, COLUMNS) {
    this.cvs.height = this.size * ROWS
    this.cvs.width = this.size * COLUMNS
  }

  static fillList = [
    '#2b2b2b',
    '#2f2f2f',
    '#f2385d',
    '#fe7e27',
    '#fcc220',
    '#7bd420',
    '#32bff4',
    '#3d65e8',
    '#d049a8'
  ]
  /* prettier-ignore */
  static draw(x, y, colorIndex, { w = 1, h = 1 } = {}) {
    this.ctx.fillStyle = this.fillList[colorIndex]
    this.ctx.fillRect(x * this.size, y * this.size, this.size * w, this.size * h)
  }

  /* prettier-ignore */
  static get shapes() {
    return Object.entries(this.tetrominos).map(([key, shape]) => shape.rotate(key === 'O' ? 1 : 4))
  }

  static get position() {
    return [
      { x: 4, y: -1 },
      { x: 4, y: -1 },
      { x: 3, y: -1 },
      { x: 3, y: -2 },
      { x: 3, y: -1 },
      { x: 4, y: -1 },
      { x: 3, y: -1 }
    ]
  }

  static alternate(types, colorIndex) {
    Array.prototype.map.call(this.nextBlock, (canvas, i) => {
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.width)
      const shape = types[i][0]
      const rows = shape.length > 3 ? 3 : 2
      const width = (canvas.width - (shape.length * this.size) / 2) / 2
      const height = (canvas.height - (rows * this.size) / 2) / 2
      ctx.fillStyle = this.fillList[colorIndex[i]]
      for (let r = shape.length; r--; ) {
        for (let c = shape.length; c--; ) {
          if (!shape[r][c]) continue
          ctx.fillRect(
            (this.size / 2) * c + width,
            (this.size / 2) * r + height,
            this.size / 2,
            this.size / 2
          )
        }
      }
    })
  }
}

class Panel {
  constructor(rows, columns) {
    this.score = 0
    this.freeze = true
    this.interval = 1000
    this.sizing = { w: columns, h: rows }
    this.storage = Array(rows)
      .fill()
      .map((r, i) => Array(columns).fill(0))
  }

  updateScore(value) {
    this.score += value
    document.getElementById('score').textContent = this.score
  }

  resetScore() {
    this.score = 0
    this.updateScore(0)
  }

  resetRecord() {
    this.storage.map(r => r.fill(0))
  }

  start() {
    this.freeze = false
    this.resetScore()
    this.resetRecord()
    this.draw()
  }

  position({ x, y }, value) {
    if (value) {
      this.storage[y][x] = value
      return
    }
    return this.storage[y][x]
  }

  /* prettier-ignore */
  eliminateFullRows(){
    let rowCounter = 1
    for (let r = 0; r < ROWS; r++) {
      let isFull = this.storage[r].every(c => c)
      if (isFull) {
        const eliminated = this.storage.splice(r, 1)[0].fill(0)
        this.storage.unshift(eliminated)
        this.updateScore(rowCounter * 10)
        rowCounter++
      }
    }

    if (rowCounter > 1) {
      this.draw()
    }
  }

  record(shape, { x, y }) {
    const { length: len } = shape
    for (let r = len; r--; ) {
      for (let c = len; c--; ) {
        if (!shape[r][c]) continue
        console.log(y, r, y + r)
        if (y < 1) {
          this.freeze = true
          console.log('game over')
          document.getElementById('start').classList.remove('disabled')
          break
        }

        this.position({ x: x + c, y: y + r }, shape[r][c])
      }
    }
  }

  draw() {
    Block.draw(0, 0, 0, this.sizing)
    this.storage.forEach((row, r) => {
      row.forEach((column, c) => {
        if (column > 1) {
          Block.draw(c, r, column)
          return
        }

        if ((r + c) % 2) {
          Block.draw(c, r, 1)
        }
      })
    })
  }
}
