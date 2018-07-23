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
    this.rows = Math.floor(this.itemsData.length / this.cols)
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
        tmpMatrix[i][j] = 0
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
    let skipFlg = false
    let nextMatrix = 0
    console.log(this.matrix)
    while (i < this.matrix.length) {
      j = 0
      while (j < this.cols) {
        if (typeof items[cnt] === 'undefined') return
        if (this.matrix[i][j] === 0) {
// console.log({
//   cnt: cnt,
//   j: j,
//   col: items[cnt].col,
//   next: this.matrix[i][j + items[cnt].col - 1],
//   top: Math.round(i * imgH),
//   left: j * items[cnt].width
// })
          nextMatrix = this.matrix[i][j + items[cnt].col - 1]
          if (typeof nextMatrix === 'undefined' || nextMatrix === 1) {
            skipFlg = true
            break
          }
          // items[0]が不確定要素。参照する要素を要変更
          imgH = items[0].obj.children[0].getBoundingClientRect().height
          items[cnt].obj.style.position = 'absolute'
          items[cnt].obj.style.top = Math.round(i * imgH) + 'px'
          items[cnt].obj.style.left = j * items[cnt].width + '%'
          items[cnt].obj.classList.add(cnt)
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
          if (skipFlg) {
            console.log('skip')
            console.log(this.matrix)
            i = j = 0
            skipFlg = false
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
