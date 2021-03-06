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
    global.stackbox = mod.exports;
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

  var StackBox = function () {
    function StackBox(args) {
      var _this = this;

      _classCallCheck(this, StackBox);

      this.args = typeof args !== 'undefined' ? args : {};
      this.elm = typeof this.args.elm !== 'undefined' ? this.args.elm : document.querySelector('.stackbox');
      this.singleGridItem = this.elm.querySelector('[data-grid="1,1"]');
      this.baseWidth = typeof this.args.baseWidth !== 'undefined' ? this.args.baseWidth : 1920;
      this.itemWidth = typeof this.args.itemWidth !== 'undefined' ? this.args.itemWidth : 200;
      this.itemHeight = typeof this.args.itemHeight !== 'undefined' ? this.args.itemHeight : 200;
      this.onLoad = typeof this.args.onLoad !== 'undefined' ? this.args.onLoad : null;
      this.items = this.elm !== null ? [].slice.call(this.elm.children) : '';
      this.verticalGridCnt = 0;
      this.itemsData = [];
      this.liquid = typeof this.args.liquid !== 'undefined' ? this.args.liquid : {};
      this.liquid.maxWidth = typeof this.args.liquid.maxWidth !== 'undefined' ? this.args.liquid.maxWidth : 0;
      this.liquid.cols = typeof this.args.liquid.maxWidth !== 'undefined' ? this.args.liquid.cols : 0;

      this.colsOrg = typeof this.args.cols !== 'undefined' ? this.args.cols : 1;
      this.cols = window.innerWidth > this.liquid.maxWidth ? this.colsOrg : this.liquid.cols;
      this.rows = this.items.length / this.cols;

      this.resizeEvents = function () {
        clearTimeout(_this.resizeTimer);
        _this.resizeTimer = setTimeout(function () {
          _this.InitPos();
        }, 100);
      };

      this.StackBox();
    }

    _createClass(StackBox, [{
      key: 'StackBox',
      value: function StackBox() {
        var _this2 = this;

        if (this.items === '') return;

        this.SetSingleGridData();
        this.itemsData.push(this.singleGrid);
        for (var i in this.items) {
          this.itemsData.push(this.SetData(this.items[i], false));
        }

        this.InitPos().then(function (elm) {
          _this2.onLoad(elm);
        });

        this.itemsData[1].obj.addEventListener('transitionend', function (e) {
          if (e.propertyName === 'height' || e.propertyName === 'opacity' || e.propertyName === 'width') {
            _this2.InitPos();
          }
        });

        this.SetWindowEvent();
      }
    }, {
      key: 'SetWindowEvent',
      value: function SetWindowEvent() {
        window.addEventListener('resize', this.resizeEvents);
      }
    }, {
      key: 'DestroyWindowEvent',
      value: function DestroyWindowEvent() {
        window.removeEventListener('resize', this.resizeEvents);
      }
    }, {
      key: 'InitPos',
      value: function InitPos() {
        var _this3 = this;

        return new Promise(function (resolve) {
          if (_this3.liquid.maxWidth !== 0) {
            _this3.cols = window.innerWidth > _this3.liquid.maxWidth ? _this3.colsOrg : _this3.liquid.cols;
          }
          _this3.rows = Math.floor(_this3.itemsData.length / _this3.cols);
          _this3.SetSingleGridData();
          for (var i in _this3.itemsData) {
            _this3.itemsData[i] = _this3.SetData(_this3.itemsData[i].obj, false);
          }
          _this3.matrix = [];
          _this3.verticalGridCnt = 0;
          _this3.matrix = _this3.GenerateMatrix();
          _this3.SetToMatrix(_this3.itemsData);
          _this3.elm.style.height = _this3.singleGrid.obj.getBoundingClientRect().height * (_this3.verticalGridCnt + 1) + 'px';

          return resolve(_this3.elm);
        });
      }
    }, {
      key: 'SetSingleGridData',
      value: function SetSingleGridData() {
        var tmpSingleGridArr = this.items.filter(function (item, index) {
          return item.dataset.grid.indexOf('1,1') >= 0;
        });
        this.singleGrid = this.SetData(tmpSingleGridArr[0], true);
      }
    }, {
      key: 'SetData',
      value: function SetData(item, isSingle) {
        var grid = item.dataset.grid.split(',');

        var tmpObj = {
          obj: item,
          row: Number(grid[0]),
          col: Number(grid[1]),
          putty: item.classList.contains('putty') };
        if (isSingle) {
          tmpObj.perWidth = 100 / this.cols;
        }
        return tmpObj;
      }
    }, {
      key: 'GenerateMatrix',
      value: function GenerateMatrix() {
        var marginRows = 10;
        var tmpMatrix = [];
        var i = 0;
        while (i < this.rows + marginRows) {
          var j = 0;
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
        var skipFlg = false;
        var dummyItem = true;
        var cnt = 0;
        var i = 0;
        while (i < this.matrix.length) {
          var j = 0;
          while (j < this.cols) {
            if (typeof items[cnt] === 'undefined') return;

            if (items[cnt].putty) {
              if (window.innerWidth <= this.liquid.maxWidth) {
                items[cnt].obj.style.display = 'none';
                cnt++;
                continue;
              } else {
                items[cnt].obj.style.display = 'block';
              }
            }
            if (this.matrix[i][j] === 0) {
              var nextMatrix = this.matrix[i][j + items[cnt].col - 1];
              if (typeof nextMatrix === 'undefined' || nextMatrix === 1) {
                skipFlg = true;
                break;
              }

              items[cnt].obj.style.width = this.singleGrid.perWidth * items[cnt].col + '%';

              var ratio = Math.round(this.singleGrid.obj.getBoundingClientRect().width / this.itemWidth * 100) / 100;
              var itemH = Math.round(this.itemHeight * ratio);

              items[cnt].obj.style.height = Math.round(itemH * items[cnt].row) + 'px';

              if (dummyItem) {
                dummyItem = false;
                cnt++;
                continue;
              }

              items[cnt].obj.style.position = 'absolute';
              items[cnt].obj.style.top = Math.round(i * itemH) + 'px';
              items[cnt].obj.style.left = j * this.singleGrid.perWidth + '%';

              var k = 0;
              while (k < items[cnt].row) {
                var l = 0;
                while (l < items[cnt].col) {
                  this.matrix[i + k][j + l] = 1;

                  if (this.verticalGridCnt < i + k) this.verticalGridCnt = i + k;
                  l++;
                }
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

    return StackBox;
  }();

  module.exports = StackBox;
  if (typeof window !== 'undefined') {
    !window.StackBox && (window.StackBox = StackBox);
  }
});