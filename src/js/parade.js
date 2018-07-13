'use strict'

const REF = {
  load: ''
}

class Parade {
  /**
     * コンストラクタ
     * @param {Object} args object型の引数。
     */
  constructor (args) {
    this.args = (typeof args !== 'undefined') ? args : {}
    this.node = (typeof this.args.elm !== 'undefined') ? this.args.elm : document.querySelectorAll('.' + REF.clss)
    this.Init()
  }

  Init () {
  }
};

module.exports = Parade
if (typeof window !== 'undefined') {
  !window.Parade && (window.Parade = Parade)
}
