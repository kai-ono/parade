'use strict'

class StackBox {
  /**
     * コンストラクタ
     * @param {Object} args object型の引数。
     */
  constructor (args) {
    this.args = (typeof args !== 'undefined') ? args : {}
    this.elm = (typeof this.args.elm !== 'undefined') ? this.args.elm : document.querySelector('.stackbox')
    this.singleGridItem = this.elm.querySelector('[data-grid="1,1"]')
    this.baseWidth = (typeof this.args.baseWidth !== 'undefined') ? this.args.baseWidth : 1920
    this.itemWidth = (typeof this.args.itemWidth !== 'undefined') ? this.args.itemWidth : 200
    this.itemHeight = (typeof this.args.itemHeight !== 'undefined') ? this.args.itemHeight : 200
    this.onLoad = (typeof this.args.onLoad !== 'undefined') ? this.args.onLoad : null
    this.items = (this.elm !== null) ? [].slice.call(this.elm.children) : ''
    this.verticalGridCnt = 0
    this.itemsData = []
    this.liquid = (typeof this.args.liquid !== 'undefined') ? this.args.liquid : {}
    this.liquid.maxWidth = (typeof this.args.liquid.maxWidth !== 'undefined') ? this.args.liquid.maxWidth : 0
    this.liquid.cols = (typeof this.args.liquid.maxWidth !== 'undefined') ? this.args.liquid.cols : 0

    this.colsOrg = (typeof this.args.cols !== 'undefined') ? this.args.cols : 1
    this.cols = (window.innerWidth > this.liquid.maxWidth) ? this.colsOrg : this.liquid.cols
    this.rows = this.items.length / this.cols

    // removeEventListenerするために変数に格納
    this.resizeEvents = () => {
      clearTimeout(this.resizeTimer)
      this.resizeTimer = setTimeout(() => {
        this.InitPos()
      }, 100)
    }

    this.StackBox()
  }

  StackBox () {
    if (this.items === '') return

    /**
     * this.singleGridに該当する要素がthis.itemsDataの最初に定義されていないと
     * getBoundingClientRectで要素の幅、高さが取得できずに崩れが発生するので、先頭に要素を入れておく
     */
    this.SetSingleGridData()
    this.itemsData.push(this.singleGrid)
    for (let i in this.items) {
      this.itemsData.push(this.SetData(this.items[i], false))
    }

    this.InitPos().then((elm) => {
      this.onLoad(elm)
    })

    // itemsData[0]はダミーなのでitemsData[1]のtransitionendを基準とする
    this.itemsData[1].obj.addEventListener('transitionend', (e) => {
      /** TODO
       * transitionのプロパティによっては発動しない可能性があるので要検討
       */
      if (e.propertyName === 'height' || e.propertyName === 'opacity') {
        this.InitPos()
      }
    })

    this.SetWindowEvent()
  }

  // Vueでdestroyする必要があるので、Windowイベントの定義はメソッドにまとめて行う
  SetWindowEvent () {
    window.addEventListener('resize', this.resizeEvents)
  }

  // Vueでのdestroy用
  DestroyWindowEvent () {
    window.removeEventListener('resize', this.resizeEvents)
  }

  InitPos () {
    return new Promise((resolve) => {
      if (this.liquid.maxWidth !== 0) {
        this.cols = (window.innerWidth > this.liquid.maxWidth) ? this.colsOrg : this.liquid.cols
      }
      this.rows = Math.floor(this.itemsData.length / this.cols)
      this.SetSingleGridData()
      for (let i in this.itemsData) {
        this.itemsData[i] = this.SetData(this.itemsData[i].obj, false)
      }
      this.matrix = []
      this.verticalGridCnt = 0
      this.matrix = this.GenerateMatrix()
      this.SetToMatrix(this.itemsData)
      this.elm.style.height = this.singleGrid.obj.getBoundingClientRect().height * (this.verticalGridCnt + 1) + 'px'

      return resolve(this.elm)
    })
  }

  /**
   * data-gridに1,1が設定されている要素を1Grid分と定義する。
   */
  SetSingleGridData () {
    const tmpSingleGridArr = this.items.filter((item, index) => {
      return item.dataset.grid.indexOf('1,1') >= 0
    })
    this.singleGrid = this.SetData(tmpSingleGridArr[0], true)
  }

  SetData (item, isSingle) {
    const grid = item.dataset.grid.split(',')
    let tmpObj = {
      obj: item,
      row: Number(grid[0]),
      col: Number(grid[1])
    }
    if (isSingle) {
      tmpObj.perWidth = 100 / this.cols
    }
    return tmpObj
  }

  GenerateMatrix () {
    /** TODO
     * 10行の余裕をもってmatrixを生成しているが、
     * 1アイテムが占めるGrid数が大きい場合(data-grid="5,5"など)は
     * 足りなくなる可能性があるので計算式を要検討
     */
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
    let dummyItem = true
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
          items[cnt].obj.style.width = this.singleGrid.perWidth * items[cnt].col + '%'

          /**
           * widthとitemWidthで設定した数値からratioを求め、
           * itemHeightにかけてheightを算出する
           */
          const ratio = Math.round(this.singleGrid.obj.getBoundingClientRect().width / this.itemWidth * 100) / 100
          const itemH = Math.round(this.itemHeight * ratio)

          /**
           * 要素の高さを揃えるためにheightを設定する。
           * 無くても位置はズレないが、内包している要素によっては下のラインが不揃いになる。
           * heightを設定していれば中の画像をCSSでトリミングする等の処理が行える。
           */
          items[cnt].obj.style.height = Math.round(itemH * items[cnt].row) + 'px'

          /**
           * 配列itemsの先頭には1Grid分を計算するためのダミー要素が入っているため、
           * 計算に必要なheightを設定したら処理を次のitemsに移す
           */
          if (dummyItem) {
            dummyItem = false
            cnt++
            continue
          }

          items[cnt].obj.style.position = 'absolute'
          items[cnt].obj.style.top = Math.round(i * itemH) + 'px'
          items[cnt].obj.style.left = j * this.singleGrid.perWidth + '%'

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
}

module.exports = StackBox
if (typeof window !== 'undefined') {
  !window.StackBox && (window.StackBox = StackBox)
}
