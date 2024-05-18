# p5js-math-sound-fourier
* 学習用、波形の再生やFFTライブラリを使用せずにフーリエ変換を行うサンプルです。
  * メインの処理は <a href="/js/sketch.js">/js/sketch.js</a> になります。

## 波形の種類
### ノイズ波形
![screenshot 2024-05-11 22 29 54](https://github.com/plasmo310/p5js-math-sound-fourier/assets/77447256/77d237cf-65d0-41a8-966d-b5a29e3dd1ba)
```
/**
 * 波形: ノイズ
 * @param {number} t 時間 
 */
function waveNoiseFunc(t) {
  return Math.random() * 2 - 1;
}

/**
 * ノイズ音再生ボタン押下
 */
function pushNoisePlayButton() {
  playSoundAndCheckFourier(waveNoiseFunc);
}
```

### sin波
![screenshot 2024-05-11 22 30 01](https://github.com/plasmo310/p5js-math-sound-fourier/assets/77447256/d4397f36-4cbe-4707-ad6c-937223627a86)
```
/**
 * 波形: sin(2πft)
 * @param {number} t 時間
 * @param {number} freq 周波数 
 */
function waveSin2npiFunc(t, freq) {
  return Math.sin(2 * Math.PI * freq * t);
}

/**
 * sin波再生ボタン押下
 */
function pushSinPlayButton() {
  playSoundAndCheckFourier((t) => waveSin2npiFunc(t, 441));
}
```

### フーリエ関数による波形
![screenshot 2024-05-11 22 30 14](https://github.com/plasmo310/p5js-math-sound-fourier/assets/77447256/916c0539-0897-49ab-bee8-24ba29d5ba89)
```
/**
 * 波形: フーリエ級数
 * @param {number} t 時間
 * @param {number} a0 定数関数
 * @param {number[]} aArray cos関数の定数項
 * @param {number[]} bArray sin関数の定数項
 * @param {number[]} baseFreq 計算のベースとする周波数
 */
function waveFoorierSeriesFunc(t, a0, aArray, bArray, baseFreq = 441) {
  // cos値の計算
  let cosValues = [];
  for (let n = 0; n < aArray.length; n++) {
    const an = aArray[n];
    const freq = (n + 1) * baseFreq;
    cosValues.push(an * waveCos2npiFunc(t, freq));
  }
  // sin値の計算
  let sinValues = [];
  for (let n = 0; n < bArray.length; n++) {
    const bn = bArray[n];
    const freq = (n + 1) * baseFreq;
    sinValues.push(bn * waveSin2npiFunc(t, freq));
  }
  // フーリエ級数の形で計算して返却
  const cosSum = cosValues.length == 0 ? 0 : cosValues.reduce((sum, x) => sum + x, 0);
  const sinSum = sinValues.length == 0 ? 0 : sinValues.reduce((sum, x) => sum + x, 0);
  return a0 / 2 + cosSum + sinSum;
}

/**
 * フーリエ波形再生ボタン押下
 */
function pushFoorierPlayButton() {
  playSoundAndCheckFourier((t) => waveFoorierSeriesFunc(t, 0, [1, 2, 3], [1]));
}
```

### 短形波(フーリエ関数によるもの)
![screenshot 2024-05-11 22 30 08](https://github.com/plasmo310/p5js-math-sound-fourier/assets/77447256/a8be1fe9-4488-41e3-9fcb-9d02921be84f)
```
/**
 * 短形波再生ボタン押下
 */
function pushRectPlayButton() {
  let bArray = [];
  const bCount = 30; // この数を上げるほど短形波に近づく
  for (let n = 1; n <= bCount; n++) {
    let b = n % 2 != 0 ? (4 / (n * Math.PI)) : 0;
    bArray.push(b);
  }
  playSoundAndCheckFourier((t) => waveFoorierSeriesFunc(t, 0, [], bArray));
}
```

## フーリエ解析処理
```
/**
 * フーリエ解析
 * @param {(t: number) => number} f 波形関数
 * @param {number} N 解析する定数項の数
 * @param {number[]} baseFreq 計算のベースとする周波数
 * @param {number} dotN 内積を行う回数(数値を上げると精度が向上する)
 * @returns a0, aArray, bArray
 */
function fourierCoefficients(f, N, baseFreq = 441, dotN = 100) {
  // 関数同士の内積
  // 2 * ∮[0→1]f(t)g(t)
  function dot_function(f, g, N) {
    const dt = 1 / N;
    let array = [];
    for (let t = 0; t < 1; t += dt) {
      array.push(f(t) * g(t) * dt);
    }
    return 2 * array.reduce((sum, x) => sum + x, 0);
  }

  // sin、cos関数との内積結果から係数を求める
  let a0 = dot_function(f, (t) => 1 / 2, dotN);
  let anArray = [];
  let bnArray = [];
  for (let n = 0; n < N; n++) {
    const freq = (n + 1) * baseFreq;
    anArray.push(dot_function(f, (t) => waveCos2npiFunc(t, freq), dotN));
    bnArray.push(dot_function(f, (t) => waveSin2npiFunc(t, freq), dotN));
  }
  return {a0, anArray, bnArray};
}
```
