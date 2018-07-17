'use strict'

class Parade {
  /**
     * コンストラクタ
     * @param {Object} args object型の引数。
     */
  constructor (config, width, list, callback) {
    this.options = {
      itemSelector: (typeof config.itemSelector !== 'undefined') ? config.itemSelector : '*',
      itemWidth: (typeof config.itemWidth !== 'undefined') ? config.itemSelector : 100,
      itemHeight: (typeof config.itemHeight !== 'undefined') ? config.itemSelector : 10,
      marginW: (typeof config.marginW !== 'undefined') ? config.itemSelector : 20,
      marginH: (typeof config.marginH !== 'undefined') ? config.itemSelector : 20,
      isWindowResizeUpdate: (typeof config.isWindowResizeUpdate !== 'undefined') ? config.itemSelector : true,
      isAutoLayout: (typeof config.isAutoLayout !== 'undefined') ? config.itemSelector : true,
      isDrawSpace: (typeof config.isDrawSpace !== 'undefined') ? config.itemSelector : false
    }
    this.options.animation = (typeof config.animation !== 'undefined') ? config.animation : {}
    this.options.animation.delayEach = (typeof this.options.animation.delayEach !== 'undefined') ? this.options.animation.delayEach : 0
    this.options.animation.duration = (typeof this.options.animation.duration !== 'undefined') ? this.options.animation.duration : 0
    this.options.animation.ease = (typeof this.options.animation.ease !== 'undefined') ? this.options.itemSelector : null

    this.eWidth = this.options.itemWidth + this.options.marginW
    this.eHeight = this.options.itemHeight + this.options.marginH
    this.nowUpdate = false

    if (!width && !list && !callback) return

    this.GetData(width, list, callback)
  }

  GetData (width, list, callback) {
    if (!width && !list && !callback) return

    this.callback = callback

    if (this.nowUpdate && this.list) {
      this.Updated()
      return
    }

    const opt = this.options
    this.nowUpdate = true
    this.maxOffX = 0
    this.maxOffY = 0
    this.startRow = 0
    this.itemNum = 0
    this.listTemp = this.InitList(list)
    this.map = []

    const cols1 = ((width + opt.marginW) / opt.eWidth) << 0
    const cols2 = Math.ceil(this.itemWidthMax / opt.eWidth)
    this.cols = Math.max(cols1, cols2)

    this.map = this.makeGrids()
    this.tempTimer = setTimeout(this.UpdateEachItem, 0)
  }

  UpdateEachItem () {
    clearTimeout(this.tempTimer)
    if (this.itemNum < this.listTemp.length) {
      const item = this.listTemp[this.itemNum]
      if (item.x && item.y) {
        this.map = this.SetOnGrid(this.map, item)
      } else {
        this.map = this.SearchPosOnGrid(this.map, item)
      }
      this.itemNum++
      this.tempTimer = setTimeout(this.UpdateEachItem, 0)
    } else {
      this.list = this.listTemp
      this.tempTimer = setTimeout(this.Updated, 0)
    }
  }

  Updated () {
    clearTimeout(this.tempTimer)
    const opt = this.options
    const areaWidth = this.cols * opt.eWidth - opt.marginW
    const data = {}
    data.area = {
      width: areaWidth,
      height: this.areaHeight
    }
    data.items = this.list
    if (opt.isDrawSpace) {
      data.spaces = this.GetSpace(this.map.slice(0, this.maxOffY + 1))
    }
    this.nowUpdate = false
    this.callback(data)
  }

  InitList (list) {
    this.itemWidthMax = 0
    const opt = this.options
    const listLen = list.length

    if (listLen <= 0) return []

    let newList = []
    let newListFix = []
    let newListFree = []
    let isListFlg = false

    if (list[0].element || list[0].width) {
      isListFlg = true
    }

    let i = 0

    while (i < listLen) {
      const item = (isListFlg) ? list[i] : {element: list[i]}
      if (item.width === null) {
        item.width = item.element.getBoundingClientRect().width
      }
      if (item.height === null) {
        item.height = item.element.getBoundingClientRect().height
      }
      let w = item.width + opt.marginW
      let h = item.height + opt.marginH
      if (this.itemWidthMax < w) {
        this.itemWidthMax = w
      }
      item.cols = Math.ceil(w / opt.eWidth)
      item.rows = Math.ceil(h / opt.itemHeight)
      if ((item.x !== null) && (item.y !== null)) {
        newListFix.push(item)
      } else {
        newListFree.push(item)
      }
      i++
    }
    newList = newListFix.concat(newListFree)
    return newList
  }

  MakeGrids () {
    this.areaHeight = 0
    let matrix = []
    const cols = this.cols
    let listTempL = this.listTemp.length
    let i = 0
    let rows = 1
    while (i < listTempL) {
      rows += this.listTemp[i].rows
      i++
    }
    listTempL = rows
    i = 0
    while (i < listTempL) {
      let line = []
      let j = 0
      while (j < cols) {
        line.push(0)
        j++
      }
      matrix.push(line)
      i++
    }
    return matrix
  }

  SetOnGrid (matrix, item) {
    const opt = this.options
    const offX = (item.x / opt.eWidth) << 0
    const offY = (item.y / opt.itemHeight) << 0

    let rowL = matrix.length - offY
    if (rowL > item.rows) rowL = item.cols

    let colL = matrix[0].length - offX
    if (colL > item.cols) colL = item.cols

    item.rectWidth = item.cols * opt.eWidth - opt.marginW
    item.rectHeight = item.rows * opt.itemHeight - opt.marginH

    const tmpH = offY * opt.itemHeight + opt.itemHeight * item.rows
    if (tmpH > this.areaHeight) this.areaHeight = tmpH

    let rowI = 0
    while (rowI < rowL) {
      let colI = 0
      while (colI < colL) {
        matrix[offY + rowI][offX + colI] = 1
        colI++
      }
      rowI++
    }
    return matrix
  }

  SearchPosOnGrid (matrix, item) {
    const opt = this.options
    const mcols = matrix[0].length - item.cols + 1
    const mrows = matrix.length
    const offX = 0
    const offY = 0
    let len = mrows
    let i = this.startRow
    while (i < len) {
      const br = matrix[i].join()
      if (br.indexOf('0') > -1) {
        i += 1
      } else {
        this.startRow++
      }
      i++
    }
    len = mrows - item.rows
    i = this.startRow
    while (i < len) {
      let j = 0
      while (j < mcols) {
        if (matrix[i][j] === 0) {
          const rowL = item.rows
          const colL = item.cols
          let rowI = i + rowL - 1
          let colI = j + colL - 1
          if (matrix[rowI][colI] === 0) {
            let val = 0
            rowI = 0
            colI = 0
            while (colI < colL) {
              val += matrix[i + rowI][j + colI]
              colI++
            }
            if (val === 0) {
              rowI++
              while (rowI < rowL) {
                colI = 0
                while (colI < colL) {
                  val += matrix[i + rowI][j + colI]
                  colI++
                }
                rowI++
              }
              if (val === 0) {
                const offX = j
                const offY = i
                if (offY > this.maxOffY || (offX > this.maxOffX && offY >= this.maxOffY)) {
                  this.maxOffX = offX
                  this.maxOffY = offY
                }
                j += mcols
                i += mrows
              }
            }
          }
        }
        j++
      }
      i++
    }
    item.x = offX * opt.eWidth
    item.y = offY * opt.itemHeight
    matrix = this.SetOnGrid(matrix, item)
    return matrix
  }

  GetSpace (matrix) {
    const opt = this.options
    let arr = []
    if (matrix.length < 1) return arr

    const cols = matrix[0].length
    let rows = matrix.length
    let i = 0
    while (i < cols) {
      let j = rows - 1
      while (j >= 0) {
        const v = matrix[j][i]
        if (v > 0) {
          j = -1
        } else {
          matrix[j][i] = 1
          j--
        }
      }
      i++
    }
    let flg = true
    while (flg && matrix.length > 0) {
      const v = matrix[matrix.length - 1].join('')
      if (v.indexOf('0') !== -1) {
        flg = false
      } else {
        matrix.pop()
      }
    }
    rows = matrix.length
    i = 0
    while (i < rows) {
      let j = 0
      while (j < cols) {
        if (matrix[i][j] === 0) {
          const v = this.GetSpaceRectSize(matrix, j, i)
          const obj = {
            x: j * opt.eWidth,
            y: i * opt.itemHeight,
            cols: v.cols,
            rows: v.rows,
            width: v.cols * opt.eWidth - opt.marginW,
            height: v.rows * opt.itemHeight - opt.marginH
          }
          if (obj.width > 0 && obj.height > 0) arr.push(obj)
          const tjL = j + v.cols
          const tiL = i + v.rows
          let ti = i
          while (ti < tiL) {
            let tj = j
            while (tj < tjL) {
              matrix[ti][tj] = 1
              tj++
            }
            ti++
          }
        }
        j++
      }
      i++
    }
    return arr
  }

  GetSpaceRectSize (matrix, x, y) {
    let w = 1
    let h = 1
    let i = x + 1
    let len = matrix[0].length
    while (i < len) {
      if (matrix[y][i] > 0) {
        i += len
      } else {
        w++
        i++
      }
    }
    len = w
    let flg = true
    while (flg) {
      h++
      i = 0
      while (i < len) {
        const tx = x + i
        const ty = y + h
        if (ty >= matrix.length) {
          flg = false
          i += len
        } else {
          if (matrix[ty][tx] > 0) {
            flg = false
            i += len
          } else {
            i++
          }
        }
      }
    }
    return {
      cols: w,
      rows: h
    }
  }
};

module.exports = Parade
if (typeof window !== 'undefined') {
  !window.Parade && (window.Parade = Parade)
}
