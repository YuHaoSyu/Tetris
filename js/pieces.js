class Piece {
  constructor() {
    this.mode = 0
    this.position = null
    this.type = null
    this.nextTypes = Array(6)
      .fill()
      .map(type => this.randomType)
    this.color = 2
    this.shape = null

    this.reset()
  }

  // prettier-ignore
  colorIndex(shape) {
    for (let row of shape)
      for (let v of row)
        if (v) return v
  }

  get nextShape() {
    return this.type[(this.mode + 1) % this.type.length]
  }

  get randomType() {
    const { shapes } = Block
    const randomIndex = Math.floor(Math.random() * shapes.length)
    const type = shapes[randomIndex]
    this.position = Block.position[randomIndex]
    return type
  }

  reset() {
    this.mode = 0
    this.type = this.nextTypes.shift()
    this.nextTypes.push(this.randomType)
    this.shape = this.rotateShape()
    this.color = this.colorIndex(this.shape)

    const eachColorIndex = this.nextTypes.map(shape => this.colorIndex(shape[0]))

    Block.alternate(this.nextTypes, eachColorIndex)
  }

  rotateShape(dir = 0) {
    this.mode += dir
    return this.type[this.mode % this.type.length]
  }

  // prettier-ignore
  blocks(cb) {
    const { shape, color, position: { x, y } } = this
    const  { length: len } = shape
    for (let r = len; r--; ) {
      for (let c = len; c--; ) {
        if (!shape[r][c]) continue
        cb(c, x, r, y, color)
      }
    }
  }

  erase(c, x, r, y, color) {
    const panelColorIndex = (r + y + c + x) % 2
    Block.draw(c + x, r + y, panelColorIndex)
  }

  draw(c, x, r, y, color) {
    Block.draw(c + x, r + y, color)
  }

  update(cb) {
    this.blocks(this.erase)
    cb()
    this.blocks(this.draw)
  }

  collision(move, shape = this.shape, { x, y } = this.position) {
    const { length: len } = shape
    for (let r = len; r--; ) {
      for (let c = len; c--; ) {
        const column = shape[r][c]
        if (!column) continue
        const dist = { x: x + c + move.x, y: y + r + move.y }
        if (dist.y < 0) continue
        if (!(-1 < dist.x && dist.x < COLUMNS) || dist.y >= ROWS) return true
        if (panel.position(dist)) return true
      }
    }
    return false
  }

  dropdown() {
    if (this.collision({ x: 0, y: 1 })) {
      panel.record(this.shape, this.position)
      panel.eliminateFullRows()
      this.reset()
      return
    }

    this.update(_ => this.position.y++)
  }

  transitionX(x) {
    if (this.collision({ x, y: 0 })) return

    this.update(_ => (this.position.x += x))
  }

  rotate() {
    let returnX = 0
    if (this.collision({ x: 0, y: 0 }, this.nextShape)) {
      returnX = this.position.x > COLUMNS / 2 ? -1 : 1
    }
    if (this.collision({ x: returnX, y: 0 }, this.nextShape)) return

    this.update(_ => {
      this.position.x += returnX
      this.shape = this.rotateShape(1)
    })
  }
}
