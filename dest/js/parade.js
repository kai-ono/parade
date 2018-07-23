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
    function Parade(args) {
      _classCallCheck(this, Parade);

      this.args = typeof args !== 'undefined' ? args : {};
      this.elm = typeof this.args.elm !== 'undefined' ? this.args.elm : document.querySelector('.parade');
      this.items = this.elm !== null ? [].slice.call(this.elm.children) : '';
      this.singleGridItem = document.querySelector('[data-grid="1,1"]');
      this.cols = this.singleGridItem !== null ? Math.floor(this.elm.getBoundingClientRect().width / this.singleGridItem.getBoundingClientRect().width) : 100;
      this.rows = this.items.length / this.cols;
      this.verticalGridCnt = 0;
      this.itemsData = [];
      this.Parade();
    }

    _createClass(Parade, [{
      key: 'Parade',
      value: function Parade() {
        var _this = this;

        if (this.items === '') return;
        for (var index in this.items) {
          this.itemsData.push(this.SetData(this.items[index]));
        }
        this.InitPos(true);
        this.itemsData[0].obj.addEventListener('transitionend', function () {
          _this.InitPos(false);
        });
        window.addEventListener('resize', function () {
          _this.InitPos(false);
        });
      }
    }, {
      key: 'InitPos',
      value: function InitPos(isFirstTime) {
        if (!isFirstTime) {
          this.cols = Math.floor(this.elm.getBoundingClientRect().width / this.items[0].getBoundingClientRect().width);
          this.rows = Math.floor(this.itemsData.length / this.cols);
          for (var index in this.itemsData) {
            this.itemsData[index] = this.SetData(this.itemsData[index].obj);
          }
          this.matrix = [];
        }
        this.verticalGridCnt = 0;
        this.matrix = this.GenerateMatrix();
        this.SetToMatrix(this.itemsData);
        this.elm.style.height = this.allHeight * this.verticalGridCnt + 'px';
      }
    }, {
      key: 'SetData',
      value: function SetData(item) {
        var itemBCR = item.getBoundingClientRect();
        var grid = item.dataset.grid.split(',');
        if (Number(grid[1]) === 1) this.allHeight = itemBCR.height;
        return {
          obj: item,
          width: 100 / this.cols,
          height: itemBCR.height,
          row: Number(grid[0]),
          col: Number(grid[1])
        };
      }
    }, {
      key: 'GenerateMatrix',
      value: function GenerateMatrix() {
        var tmpMatrix = [];
        var i = 0;
        var j = void 0;

        while (i < this.rows + 2) {
          j = 0;
          tmpMatrix[i] = [];
          while (j < this.cols) {
            tmpMatrix[i][j] = 0;
            j++;
          }
          i++;
        }
        return tmpMatrix;
      }
    }, {
      key: 'SetToMatrix',
      value: function SetToMatrix(items) {
        var cnt = 0;
        var i = 0;
        var j = void 0;
        var k = void 0;
        var l = void 0;
        var imgH = void 0;
        var skipFlg = false;
        var nextMatrix = 0;
        while (i < this.matrix.length) {
          j = 0;
          while (j < this.cols) {
            if (typeof items[cnt] === 'undefined') return;
            if (this.matrix[i][j] === 0) {
              nextMatrix = this.matrix[i][j + items[cnt].col - 1];
              if (typeof nextMatrix === 'undefined' || nextMatrix === 1) {
                skipFlg = true;
                break;
              }
              imgH = this.singleGridItem.children[0].getBoundingClientRect().height;
              items[cnt].obj.style.position = 'absolute';
              items[cnt].obj.style.top = Math.round(i * imgH) + 'px';
              items[cnt].obj.style.left = j * items[cnt].width + '%';
              items[cnt].obj.classList.add(cnt);

              k = 0;
              while (k < items[cnt].row) {
                l = 0;
                while (l < items[cnt].col) {
                  this.matrix[i + k][j + l] = 1;
                  l++;
                }

                if (j === 0 && this.matrix[i][j] === 1) this.verticalGridCnt++;
                k++;
              }

              if (skipFlg) {
                i = j = 0;
                skipFlg = false;
              }
              cnt++;
            }
            j++;
          }
          i++;
        }
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