## Demo
https://kai-ono.github.io/stackbox/dest/

## Specs
パネルの位置判定のためにmatrixを生成し、それをもとにアイテムの位置を調整する。

## Option
* baseWidth: number  // 基準となる幅
* itemWidth: number  // baseWidthに対してのパネル幅
* itemHeight: number // baseWidthに対してのパネル高さ
* cols: number       // カラム数
* liquid: object     // アイテム幅を%指定の時、ブレイクポイントを設ける場合に指定する
  * maxWidth: number // ブレイクポイント
  * cols: number     // maxWidth以下になった時のカラム数
* onLoad: function(stackbox) // StackBoxの初期化が終わったあとに実行されるコールバック関数、引数には実行中のstackbox本体のDOMElementが渡される
```
{
      baseWidth: 1920,
      itemWidth: 480,
      itemHeight: 274,
      cols: 4,
      liquid: {
            maxWidth: 1440,
            cols: 3
      },
      onLoad: (stackbox) => {
            // do something
      }
}
```