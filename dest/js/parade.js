(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['module'], factory);
  } else if (typeof exports !== "undefined") {
    factory(module);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod);
    global.parade = mod.exports;
  }
})(this, function (module) {
  'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var Parade = function () {
    function Parade(config, width, list, callback) {
      _classCallCheck(this, Parade);

      this.options = {
        itemSelector: typeof config.itemSelector !== 'undefined' ? config.itemSelector : '*',
        itemWidth: typeof config.itemWidth !== 'undefined' ? config.itemSelector : 100,
        itemHeight: typeof config.itemHeight !== 'undefined' ? config.itemSelector : 10,
        marginW: typeof config.marginW !== 'undefined' ? config.itemSelector : 20,
        marginH: typeof config.marginH !== 'undefined' ? config.itemSelector : 20,
        isWindowResizeUpdate: typeof config.isWindowResizeUpdate !== 'undefined' ? config.itemSelector : true,
        isAutoLayout: typeof config.isAutoLayout !== 'undefined' ? config.itemSelector : true,
        isDrawSpace: typeof config.isDrawSpace !== 'undefined' ? config.itemSelector : false
      };
      this.options.animation = typeof config.animation !== 'undefined' ? config.animation : {};
      this.options.animation.delayEach = typeof this.options.animation.delayEach !== 'undefined' ? this.options.animation.delayEach : 0;
      this.options.animation.duration = typeof this.options.animation.duration !== 'undefined' ? this.options.animation.duration : 0;
      this.options.animation.ease = typeof this.options.animation.ease !== 'undefined' ? this.options.itemSelector : null;

      this.eWidth = this.options.itemWidth + this.options.marginW;
      this.eHeight = this.options.itemHeight + this.options.marginH;
      this.nowUpdate = false;

      if (!width && !list && !callback) return;

      this.GetData(width, list, callback);
    }

    _createClass(Parade, [{
      key: 'GetData',
      value: function GetData(width, list, callback) {
        if (!width && !list && !callback) return;

        this.callback = callback;

        if (this.nowUpdate && this.list) {
          this.Updated();
          return;
        }

        var opt = this.options;
        this.nowUpdate = true;
        this.maxOffX = 0;
        this.maxOffY = 0;
        this.startRow = 0;
        this.itemNum = 0;
        this.listTemp = this.InitList(list);
        this.map = [];

        var cols1 = (width + opt.marginW) / opt.eWidth << 0;
        var cols2 = Math.ceil(this.itemWidthMax / opt.eWidth);
        this.cols = Math.max(cols1, cols2);

        this.map = this.makeGrids();
        this.tempTimer = setTimeout(this.UpdateEachItem, 0);
      }
    }, {
      key: 'UpdateEachItem',
      value: function UpdateEachItem() {
        clearTimeout(this.tempTimer);
        if (this.itemNum < this.listTemp.length) {
          var item = this.listTemp[this.itemNum];
          if (item.x && item.y) {
            this.map = this.SetOnGrid(this.map, item);
          } else {
            this.map = this.SearchPosOnGrid(this.map, item);
          }
          this.itemNum++;
          this.tempTimer = setTimeout(this.UpdateEachItem, 0);
        } else {
          this.list = this.listTemp;
          this.tempTimer = setTimeout(this.Updated, 0);
        }
      }
    }, {
      key: 'Updated',
      value: function Updated() {
        clearTimeout(this.tempTimer);
        var opt = this.options;
        var areaWidth = this.cols * opt.eWidth - opt.marginW;
        var data = {};
        data.area = {
          width: areaWidth,
          height: this.areaHeight
        };
        data.items = this.list;
        if (opt.isDrawSpace) {
          data.spaces = this.GetSpace(this.map.slice(0, this.maxOffY + 1));
        }
        this.nowUpdate = false;
        this.callback(data);
      }
    }, {
      key: 'InitList',
      value: function InitList(list) {
        this.itemWidthMax = 0;
        var opt = this.options;
        var listLen = list.length;

        if (listLen <= 0) return [];

        var newList = [];
        var newListFix = [];
        var newListFree = [];
        var isListFlg = false;

        if (list[0].element || list[0].width) {
          isListFlg = true;
        }

        var i = 0;

        while (i < listLen) {
          var item = isListFlg ? list[i] : { element: list[i] };
          if (item.width === null) {
            item.width = item.element.getBoundingClientRect().width;
          }
          if (item.height === null) {
            item.height = item.element.getBoundingClientRect().height;
          }
          var w = item.width + opt.marginW;
          var h = item.height + opt.marginH;
          if (this.itemWidthMax < w) {
            this.itemWidthMax = w;
          }
          item.cols = Math.ceil(w / opt.eWidth);
          item.rows = Math.ceil(h / opt.itemHeight);
          if (item.x !== null && item.y !== null) {
            newListFix.push(item);
          } else {
            newListFree.push(item);
          }
          i++;
        }
        newList = newListFix.concat(newListFree);
        return newList;
      }
    }, {
      key: 'MakeGrids',
      value: function MakeGrids() {
        this.areaHeight = 0;
        var matrix = [];
        var cols = this.cols;
        var listTempL = this.listTemp.length;
        var i = 0;
        var rows = 1;
        while (i < listTempL) {
          rows += this.listTemp[i].rows;
          i++;
        }
        listTempL = rows;
        i = 0;
        while (i < listTempL) {
          var line = [];
          var j = 0;
          while (j < cols) {
            line.push(0);
            j++;
          }
          matrix.push(line);
          i++;
        }
        return matrix;
      }
    }, {
      key: 'SetOnGrid',
      value: function SetOnGrid(matrix, item) {
        var opt = this.options;
        var offX = item.x / opt.eWidth << 0;
        var offY = item.y / opt.itemHeight << 0;

        var rowL = matrix.length - offY;
        if (rowL > item.rows) rowL = item.cols;

        var colL = matrix[0].length - offX;
        if (colL > item.cols) colL = item.cols;

        item.rectWidth = item.cols * opt.eWidth - opt.marginW;
        item.rectHeight = item.rows * opt.itemHeight - opt.marginH;

        var tmpH = offY * opt.itemHeight + opt.itemHeight * item.rows;
        if (tmpH > this.areaHeight) this.areaHeight = tmpH;

        var rowI = 0;
        while (rowI < rowL) {
          var colI = 0;
          while (colI < colL) {
            matrix[offY + rowI][offX + colI] = 1;
            colI++;
          }
          rowI++;
        }
        return matrix;
      }
    }, {
      key: 'SearchPosOnGrid',
      value: function SearchPosOnGrid(matrix, item) {
        var opt = this.options;
        var mcols = matrix[0].length - item.cols + 1;
        var mrows = matrix.length;
        var offX = 0;
        var offY = 0;
        var len = mrows;
        var i = this.startRow;
        while (i < len) {
          var br = matrix[i].join();
          if (br.indexOf('0') > -1) {
            i += 1;
          } else {
            this.startRow++;
          }
          i++;
        }
        len = mrows - item.rows;
        i = this.startRow;
        while (i < len) {
          var j = 0;
          while (j < mcols) {
            if (matrix[i][j] === 0) {
              var rowL = item.rows;
              var colL = item.cols;
              var rowI = i + rowL - 1;
              var colI = j + colL - 1;
              if (matrix[rowI][colI] === 0) {
                var val = 0;
                rowI = 0;
                colI = 0;
                while (colI < colL) {
                  val += matrix[i + rowI][j + colI];
                  colI++;
                }
                if (val === 0) {
                  rowI++;
                  while (rowI < rowL) {
                    colI = 0;
                    while (colI < colL) {
                      val += matrix[i + rowI][j + colI];
                      colI++;
                    }
                    rowI++;
                  }
                  if (val === 0) {
                    var _offX = j;
                    var _offY = i;
                    if (_offY > this.maxOffY || _offX > this.maxOffX && _offY >= this.maxOffY) {
                      this.maxOffX = _offX;
                      this.maxOffY = _offY;
                    }
                    j += mcols;
                    i += mrows;
                  }
                }
              }
            }
            j++;
          }
          i++;
        }
        item.x = offX * opt.eWidth;
        item.y = offY * opt.itemHeight;
        matrix = this.SetOnGrid(matrix, item);
        return matrix;
      }
    }, {
      key: 'GetSpace',
      value: function GetSpace(matrix) {
        var opt = this.options;
        var arr = [];
        if (matrix.length < 1) return arr;

        var cols = matrix[0].length;
        var rows = matrix.length;
        var i = 0;
        while (i < cols) {
          var j = rows - 1;
          while (j >= 0) {
            var v = matrix[j][i];
            if (v > 0) {
              j = -1;
            } else {
              matrix[j][i] = 1;
              j--;
            }
          }
          i++;
        }
        var flg = true;
        while (flg && matrix.length > 0) {
          var _v = matrix[matrix.length - 1].join('');
          if (_v.indexOf('0') !== -1) {
            flg = false;
          } else {
            matrix.pop();
          }
        }
        rows = matrix.length;
        i = 0;
        while (i < rows) {
          var _j = 0;
          while (_j < cols) {
            if (matrix[i][_j] === 0) {
              var _v2 = this.GetSpaceRectSize(matrix, _j, i);
              var obj = {
                x: _j * opt.eWidth,
                y: i * opt.itemHeight,
                cols: _v2.cols,
                rows: _v2.rows,
                width: _v2.cols * opt.eWidth - opt.marginW,
                height: _v2.rows * opt.itemHeight - opt.marginH
              };
              if (obj.width > 0 && obj.height > 0) arr.push(obj);
              var tjL = _j + _v2.cols;
              var tiL = i + _v2.rows;
              var ti = i;
              while (ti < tiL) {
                var tj = _j;
                while (tj < tjL) {
                  matrix[ti][tj] = 1;
                  tj++;
                }
                ti++;
              }
            }
            _j++;
          }
          i++;
        }
        return arr;
      }
    }, {
      key: 'GetSpaceRectSize',
      value: function GetSpaceRectSize(matrix, x, y) {
        var w = 1;
        var h = 1;
        var i = x + 1;
        var len = matrix[0].length;
        while (i < len) {
          if (matrix[y][i] > 0) {
            i += len;
          } else {
            w++;
            i++;
          }
        }
        len = w;
        var flg = true;
        while (flg) {
          h++;
          i = 0;
          while (i < len) {
            var tx = x + i;
            var ty = y + h;
            if (ty >= matrix.length) {
              flg = false;
              i += len;
            } else {
              if (matrix[ty][tx] > 0) {
                flg = false;
                i += len;
              } else {
                i++;
              }
            }
          }
        }
        return {
          cols: w,
          rows: h
        };
      }
    }]);

    return Parade;
  }();

  ;

  module.exports = Parade;
  if (typeof window !== 'undefined') {
    !window.Parade && (window.Parade = Parade);
  }
});