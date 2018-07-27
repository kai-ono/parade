'use strict'

class StackBox {
  /**
     * コンストラクタ
     * @param {Object} args object型の引数。
     */
  constructor (args) {
    this.args = (typeof args !== 'undefined') ? args : {}
    this.elm = (typeof this.args.elm !== 'undefined') ? this.args.elm : document.querySelector('.stackbox')
    this.baseWidth = (typeof this.args.baseWidth !== 'undefined') ? this.args.baseWidth : 1920
    this.itemWidth = (typeof this.args.itemWidth !== 'undefined') ? this.args.itemWidth : 200
    this.itemHeight = (typeof this.args.itemHeight !== 'undefined') ? this.args.itemHeight : 200
    this.onLoad = (typeof this.args.onLoad !== 'undefined') ? this.args.onLoad : null
    this.items = (this.elm !== null) ? [].slice.call(this.elm.children) : ''
    this.singleGridItem = document.querySelector('[data-grid="1,1"]')
    this.verticalGridCnt = 0
    this.itemsData = []

    this.liquid = (typeof this.args.liquid !== 'undefined') ? this.args.liquid : {}
    this.liquid.maxWidth = (typeof this.args.liquid.maxWidth !== 'undefined') ? this.args.liquid.maxWidth : 0
    this.liquid.cols = (typeof this.args.liquid.maxWidth !== 'undefined') ? this.args.liquid.cols : 0

    this.colsOrg = (typeof this.args.cols !== 'undefined') ? this.args.cols : 1
    this.cols = (window.innerWidth > this.liquid.maxWidth) ? this.colsOrg : this.liquid.cols
    this.rows = this.items.length / this.cols

    // removeEventListenerするために変数に格納
    this.eventHolder = () => {
      this.InitPos()
    }

    this.StackBox()
  }

  StackBox () {
    if (this.items === '') return
    for (let i in this.items) {
      this.itemsData.push(this.SetData(this.items[i]))
    }

    this.InitPos().then((elm) => {
      this.onLoad(elm)
    })

    this.itemsData[0].obj.addEventListener('transitionend', (e) => {
      if (e.propertyName === 'height') {
        this.InitPos()
      }
    })

    // Vueでdestroyする必要があるのでメソッド分ける
    this.SetWindowEvent()
  }

  SetWindowEvent () {
    window.addEventListener('resize', this.eventHolder)
  }

  DestroyWindowEvent () {
    window.removeEventListener('resize', this.eventHolder)
  }

  InitPos () {
    if (this.liquid.maxWidth !== 0) {
      this.cols = (window.innerWidth > this.liquid.maxWidth) ? this.colsOrg : this.liquid.cols
    }
    this.rows = Math.floor(this.itemsData.length / this.cols)
    for (let i in this.itemsData) {
      this.itemsData[i] = this.SetData(this.itemsData[i].obj)
    }
    this.matrix = []
    this.verticalGridCnt = 0
    this.matrix = this.GenerateMatrix()
    this.SetToMatrix(this.itemsData)

    // data-gridに1,1が設定されている要素の高さを1Grid分と定義する
    this.singleGrid = this.items.filter((item, index) => {
      return item.dataset.grid.indexOf('1,1') >= 0
    })
    this.singleGridHeight = this.singleGrid[0].getBoundingClientRect().height
    this.elm.style.height = this.singleGridHeight * (this.verticalGridCnt + 1) + 'px'

    return Promise.resolve(this.elm)
  }

  SetData (item) {
    const itemBCR = item.getBoundingClientRect()
    const grid = item.dataset.grid.split(',')
    if (Number(grid[0]) === 1) this.allHeight = itemBCR.height
    return {
      obj: item,
      width: 100 / this.cols,
      height: itemBCR.height,
      row: Number(grid[0]),
      col: Number(grid[1])
    }
  }

  GenerateMatrix () {
    const marginRows = 10
    let tmpMatrix = []
    let i = 0
    while (i < this.rows + marginRows) {
      let j = 0
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
    let skipFlg = false
    let cnt = 0
    let i = 0
    while (i < this.matrix.length) {
      let j = 0
      while (j < this.cols) {
        if (typeof items[cnt] === 'undefined') return
        if (this.matrix[i][j] === 0) {
          /**
           * 次のmatrixのカラムが無いとき（外枠をはみ出すとき）
           * このwhileをbreakして次の行に移る。
           * skipFlgをtrueにしておくことで、その後のskipした空白を埋める処理に繋げる。
           */
          let nextMatrix = this.matrix[i][j + items[cnt].col - 1]
          if (typeof nextMatrix === 'undefined' || nextMatrix === 1) {
            skipFlg = true
            break
          }

          /**
           * height取得のため先にwidthを設定する
           */
          items[cnt].obj.style.width = items[cnt].width * items[cnt].col + '%'

          /**
           * widthとitemWidthで設定した数値からratioを求め、
           * itemHeightにかけてheightを算出する
           */
          const ratio = Math.round(this.singleGridItem.getBoundingClientRect().width / this.itemWidth * 100) / 100
          const itemH = Math.round(this.itemHeight * ratio)

          /**
           * 要素の高さを揃えるためにheightを設定する。
           * 無くても位置はズレないが、内包している要素によっては下のラインが不揃いになる。
           * heightを設定していれば中の画像をCSSでトリミングする等の処理が行える。
           */
          items[cnt].obj.style.height = Math.round(itemH * items[cnt].row) + 'px'

          items[cnt].obj.style.position = 'absolute'
          items[cnt].obj.style.top = Math.round(i * itemH) + 'px'
          items[cnt].obj.style.left = j * items[cnt].width + '%'

          /**
           * 要素のGridの大きさに合わせてmatrixを埋める処理
           */
          let k = 0
          while (k < items[cnt].row) {
            let l = 0
            while (l < items[cnt].col) {
              this.matrix[i + k][j + l] = 1
              // 親要素の高さ計算のため、要素が存在している最後のrowを取得する
              if (this.verticalGridCnt < i + k) this.verticalGridCnt = i + k
              l++
            }
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

module.exports = StackBox
if (typeof window !== 'undefined') {
  !window.StackBox && (window.StackBox = StackBox)
}
