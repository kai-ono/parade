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
      this.rows = 4;
      this.cols = 4;
      this.itemsData = [];
      this.Parade();
    }

    _createClass(Parade, [{
      key: 'Parade',
      value: function Parade() {
        if (this.items === '') return;

        this.matrix = this.GenerateMatrix();
        for (var index in this.items) {
          this.itemsData.push(this.SetData(this.items[index]));
        }
        this.SetToMatrix(this.itemsData);
        console.log(this.matrix);
      }
    }, {
      key: 'SetData',
      value: function SetData(item) {
        var itemBCR = item.getBoundingClientRect();
        return {
          obj: item,
          width: itemBCR.width,
          height: itemBCR.height,
          row: 0,
          col: 0
        };
      }
    }, {
      key: 'SetPos',
      value: function SetPos(item) {}
    }, {
      key: 'GenerateMatrix',
      value: function GenerateMatrix() {
        var tmpMatrix = [];
        var i = 0;
        var j = void 0;
        while (i < this.rows) {
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
        var imgH = void 0;
        while (i < this.rows) {
          j = 0;
          while (j < this.cols) {
            imgH = items[cnt].obj.children[0].getBoundingClientRect().height;
            items[cnt].obj.style.position = 'absolute';
            items[cnt].obj.style.top = i * imgH + 'px';
            items[cnt].obj.style.left = j * 25 + '%';
            j++;
            cnt++;
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