'use strict';
// 年齢が13歳と15歳のデータを取得

/**
 * Node.jsに用意されたモジュールの呼び出し
 * モジュール：何かの部品
 * オブジェクト：クラスやインスタンスなどの物をまとめて表現
 */
const fs = require('fs'); // fs：FileSystemの略。ファイルを扱うための機能が使えるようになる。
const readline = require('readline'); // readlineはファイルを一行ずつ読み取る機能が使えるようになる。

/**
 * ファイルサイズが大きいから、Streamで処理したい。
 * Stream：非同期で情報を取り扱う。流れを作って先頭から読んでいく。
 */
const rs = fs.ReadStream('./popu-pref.csv'); // 読み取りたいpopu-pref.csvファイルからReadStream(読み込み情報)を作る。ストリームの生成。

const rl = readline.createInterface({ 'input': rs, 'output': {} }); // input：上で作ったReadStreamを一行ずつ読み取る
// output：readlineデータを書き出すためのもの
/**
 * readline.createInterfaceは引数にオブジェクト { 'input': rs, 'output': {} }を渡し、このオブジェクトの'input'の値のStream(変数rs)を元にファイルを一行づつ読み取っている
 */
const prefectureDataMap = new Map(); // key: 都道府県 value: 集計データのオブジェクト


/**
 * イベント駆動型プログラミング：なにか一行読み渡った（イベント）ら、関数を実行する。
 * 
 * rl オブジェクトで line というイベントが発生したらこの無名関数を呼んでください、という意味です。
 * 無名関数の処理の中で console.log を使っているので、line イベントが発生したタイミングで、コンソールに引数 lineString の内容が出力されることになります。この lineString には、読み込んだ 1 行の文字列が入っています。
 * 
 * lineString：引数。自由なものを使って良い
 * rl.on：イベントの監視する
 * line：（イベント）一行読み終わる
 */
rl.on('line', (lineString) => {
  const columns = lineString.split(','); // 文字列をカンマで分割して配列に入れる。
  const year = parseInt(columns[0]); // 集計年を数値に変換する
  const prefecture = columns[2]; // 県名
  const popu = parseInt(columns[7]); // 人口を数値に変換
  /**
   * 連想配列 prefectureDataMap からデータを取得する
   * 
   */
  if (year === 2010 || year === 2015) {
    let value = prefectureDataMap.get(prefecture);
    if (!value) { // value が Falsy の場合に、valuleに初期値となるオブジェクトを代入する
      value = {
        popu10: 0,
        popu15: 0,
        change: null
      };
    }
    if (year === 2010) {
      value.popu10 += popu;
    }
    if (year === 2015) {
      value.popu15 += popu;
    }
    // オブジェクトのプロパティを更新して連想配列に保存する
    prefectureDataMap.set(prefecture, value); // 
  }
});
rl.resume(); // 読み始め

// 変化率の計算
rl.on('close', () => { // close： 全ての行を読み終わった際に呼び出し
  // for (変数 of 配列) 配列の値を一つずつ変数へ代入する
  for (let [key, value] of prefectureDataMap) {
    // 変化率を value.change に入れて変数へ代入する
    value.change = value.popu15 / value.popu10;
  }
  // Array.from(prefectureDataMap) 連想配列を普通の配列に変換
  const rankingArray = Array.from(prefectureDataMap).sort((pair1, pair2) => {
    // sort：pair2 - pair1：降順にする
    return pair2[1].change - pair1[1].change;
  });
  // map関数：Mapのキーと値が要素になった配列を要素、[key,value]として受け取りその各要素に関数を適用し、新しい配列を作る
  const rankingStrings = rankingArray.map(([key, value]) => {
    return key + ': ' + value.popu10 + '=>' + value.popu15 + ' 変化率：' + value.change;
  });
  console.log(rankingStrings);
});