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
    this.rows = 4
    this.cols = Math.floor(this.elm.getBoundingClientRect().width / this.items[0].getBoundingClientRect().width)
    this.itemsData = []
    this.Parade()
  }

  Parade () {
    if (this.items === '') return

    this.matrix = this.GenerateMatrix()
    for (let index in this.items) {
      this.itemsData.push(this.SetData(this.items[index]))
    }
    this.SetToMatrix(this.itemsData)
    this.itemsData[0].obj.addEventListener('transitionend', () => {
      this.InitPos()
    })
    window.addEventListener('resize', () => {
      this.InitPos()
    })
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
    return {
      obj: item,
      width: 100 / this.cols,
      height: itemBCR.height,
      row: 0,
      col: 0
    }
  }

  SetPos (item) {
  }

  GenerateMatrix () {
    let tmpMatrix = []
    let i = 0
    let j
    while (i < this.rows) {
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
    let imgH
    while (i < this.rows) {
      j = 0
      while (j < this.cols) {
        if (typeof items[cnt] === 'undefined') return
        if (this.matrix[i][j] === 0) {
          imgH = items[cnt].obj.children[0].getBoundingClientRect().height
          items[cnt].obj.style.position = 'absolute'
          items[cnt].obj.style.top = Math.round(i * imgH) + 'px'
          items[cnt].obj.style.left = j * items[cnt].width + '%'
          this.matrix[i][j] = 1
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
