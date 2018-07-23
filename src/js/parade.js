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
    this.singleGridItem = document.querySelector('[data-grid="1,1"]')
    this.cols = (this.singleGridItem !== null) ? Math.floor(this.elm.getBoundingClientRect().width / this.singleGridItem.getBoundingClientRect().width) : 100
    this.rows = this.items.length / this.cols
    this.verticalGridCnt = 0
    this.itemsData = []
    this.Parade()
  }

  Parade () {
    if (this.items === '') return
    for (let index in this.items) {
      this.itemsData.push(this.SetData(this.items[index]))
    }
    this.InitPos(true)
    this.itemsData[0].obj.addEventListener('transitionend', () => {
      this.InitPos(false)
    })
    window.addEventListener('resize', () => {
      this.InitPos(false)
    })
  }

  InitPos (isFirstTime) {
    if (!isFirstTime) {
      this.cols = Math.floor(this.elm.getBoundingClientRect().width / this.items[0].getBoundingClientRect().width)
      this.rows = Math.floor(this.itemsData.length / this.cols)
      for (let index in this.itemsData) {
        this.itemsData[index] = this.SetData(this.itemsData[index].obj)
      }
      this.matrix = []
    }
    this.verticalGridCnt = 0
    this.matrix = this.GenerateMatrix()
    this.SetToMatrix(this.itemsData)
    this.elm.style.height = this.allHeight * this.verticalGridCnt + 'px'
  }

  SetData (item) {
    const itemBCR = item.getBoundingClientRect()
    const grid = item.dataset.grid.split(',')
    if (Number(grid[1]) === 1) this.allHeight = itemBCR.height
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
    while (i < this.matrix.length) {
      j = 0
      while (j < this.cols) {
        if (typeof items[cnt] === 'undefined') return
        if (this.matrix[i][j] === 0) {
          nextMatrix = this.matrix[i][j + items[cnt].col - 1]
          if (typeof nextMatrix === 'undefined' || nextMatrix === 1) {
            skipFlg = true
            break
          }
          imgH = this.singleGridItem.children[0].getBoundingClientRect().height
          items[cnt].obj.style.position = 'absolute'
          items[cnt].obj.style.top = Math.round(i * imgH) + 'px'
          items[cnt].obj.style.left = j * items[cnt].width + '%'
          items[cnt].obj.classList.add(cnt)

          // 要素のGridの大きさに合わせてmatrixを埋める処理
          k = 0
          while (k < items[cnt].row) {
            l = 0
            while (l < items[cnt].col) {
              this.matrix[i + k][j + l] = 1
              l++
            }
            // 親要素の高さ計算のため、matrixの各行の1カラム目が1の場合にカウントアップする
            if (j === 0 && this.matrix[i][j] === 1) this.verticalGridCnt++
            k++
          }

          // skipFlgがtrueならmatrixの最初に戻る
          if (skipFlg) {
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

module.exports = Parade
if (typeof window !== 'undefined') {
  !window.Parade && (window.Parade = Parade)
}
