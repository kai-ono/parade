'use strict'

class Parade {
  /**
     * コンストラクタ
     * @param {Object} args object型の引数。
     */
  constructor (args) {
    this.args = (typeof args !== 'undefined') ? args : {}
    this.elm = (typeof this.args.elm !== 'undefined') ? this.args.elm : document.querySelector('.parade')
    this.items = (this.elm !== null) ? [].slice.call(this.elm.children) : ''
    // this.items[0]は不確定要素なので何とかしたい
    this.cols = Math.floor(this.elm.getBoundingClientRect().width / this.items[0].getBoundingClientRect().width)
    this.rows = this.items.length / this.cols
    this.gridW = Math.floor(this.elm.getBoundingClientRect().width * (100 / this.cols / 100))
    // this.gridH = Math.floor(this.elm.getBoundingClientRect().height * (100 / this.rows / 100))
    this.itemsData = []
    this.Parade()
  }

  Parade () {
    if (this.items === '') return

    for (let index in this.items) {
      this.itemsData.push(this.SetData(this.items[index]))
    }
    this.matrix = this.GenerateMatrix()
    this.SetToMatrix(this.itemsData)
    this.itemsData[0].obj.addEventListener('transitionend', () => {
      this.InitPos()
    })
    window.addEventListener('resize', () => {
      this.InitPos()
    })
console.log(this.matrix)
  }

  InitPos () {
    this.cols = Math.floor(this.elm.getBoundingClientRect().width / this.items[0].getBoundingClientRect().width)
    this.rows = this.itemsData.length / this.cols
    this.matrix = []
    this.matrix = this.GenerateMatrix()
    for (let index in this.itemsData) {
      this.itemsData[index] = this.SetData(this.itemsData[index].obj)
    }
    this.SetToMatrix(this.itemsData)
console.log(this.matrix)
  }

  SetData (item) {
    const itemBCR = item.getBoundingClientRect()
// console.log({
//   grid: this.gridW,
//   b: Math.floor(item.getBoundingClientRect().width),
//   c: Math.floor(item.getBoundingClientRect().width / this.gridW)
// })

    const grid = item.dataset.grid.split(',')
    return {
      obj: item,
      width: 100 / this.cols,
      height: itemBCR.height,
      row: Number(grid[0]),
      col: Number(grid[1])
    }
  }

  GenerateMatrix () {
    let tmpMatrix = []
    let i = 0
    let j
    // プラス2はデバッグ用
    while (i < this.rows + 2) {
      j = 0
      tmpMatrix[i] = []
      while (j < this.cols) {
        tmpMatrix[i][j] = 0 // (i === 0 && j === 3) ? 1 : 0
        j++
      }
      i++
    }
    return tmpMatrix
  }

  SetToMatrix (items) {
    let cnt = 0
    let i = 0
    let j
    let k
    let l
    let imgH
    // プラス2はデバッグ用
    while (i < this.rows + 2) {
      j = 0
      while (j < this.cols) {
        if (typeof items[cnt] === 'undefined') return
        if (this.matrix[i][j] === 0) {
          console.log({
            cnt: cnt,
            j: j,
            col: items[cnt].col,
            next: this.matrix[i][j + items[cnt].col - 1],
            top: Math.round(i * imgH),
            left: j * items[cnt].width
          })
          if (typeof this.matrix[i][j + items[cnt].col - 1] === 'undefined') break
          // items[0]が不確定要素。参照する要素を要変更
          imgH = items[0].obj.children[0].getBoundingClientRect().height
          items[cnt].obj.style.position = 'absolute'
          if (cnt === 2) {
            console.log(Math.round(imgH))
          }
          items[cnt].obj.style.top = Math.round(i * imgH) + 'px'
          items[cnt].obj.style.left = j * items[cnt].width + '%'
          items[cnt].obj.classList.add(cnt)
          // this.matrix[i][j] = 1
          // if (items[cnt].col === 2)
          // items[cnt].col = (cnt === 1) ? 2 : 1
          // items[cnt].row = (cnt === 1) ? 2 : 1
          k = 0
          while (k < items[cnt].row) {
            l = 0
            while (l < items[cnt].col) {
// if (cnt === 1) {
// console.log({
//   itm: cnt,
//   col: items[cnt].col,
//   row: l
// })
// }
              this.matrix[i + k][j + l] = 1
              l++
            }
            k++
          }
          cnt++
        }
        j++
      }
      i++
    }
  }
};

// window.addEventListener('DOMContentLoaded', function () {
//   var list, w
//   // clearTimeout(_this.tempTimer)
//   _this.nowUpdate = true
//   w = $(_this).parent().width()
//   list = $(_this).children(options.itemSelector)
//   return _this.cr = new Parade(options, w, list, updateDatas)
// })

module.exports = Parade
if (typeof window !== 'undefined') {
  !window.Parade && (window.Parade = Parade)
}
