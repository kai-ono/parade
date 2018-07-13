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

  var REF = {
    load: ''
  };

  var Parade = function () {
    function Parade(args) {
      _classCallCheck(this, Parade);

      this.args = typeof args !== 'undefined' ? args : {};
      this.node = typeof this.args.elm !== 'undefined' ? this.args.elm : document.querySelectorAll('.' + REF.clss);
      this.Init();
    }

    _createClass(Parade, [{
      key: 'Init',
      value: function Init() {}
    }]);

    return Parade;
  }();

  ;

  module.exports = Parade;
  if (typeof window !== 'undefined') {
    !window.Parade && (window.Parade = Parade);
  }
});