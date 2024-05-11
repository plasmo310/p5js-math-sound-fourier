
/**
 * 波形: ノイズ
 * @param {number} t 時間 
 */
function waveNoiseFunc(t) {
  return Math.random() * 2 - 1;
}

/**
 * 波形: sin(2πft)
 * @param {number} t 時間
 * @param {number} freq 周波数 
 */
function waveSin2npiFunc(t, freq) {
  return Math.sin(2 * Math.PI * freq * t);
}

/**
 * 波形: cos(2πft)
 * @param {number} t 時間
 * @param {number} freq 周波数
 */
function waveCos2npiFunc(t, freq) {
  return Math.cos(2 * Math.PI * freq * t);
}

/**
 * 波形: フーリエ級数
 * @param {number} t 時間
 * @param {number} a0 定数関数
 * @param {number[]} aArray cos関数の定数項
 * @param {number[]} bArray sin関数の定数項
 * @param {number[]} baseFreq 計算のベースとする周波数
 */
function waveFourierSeriesFunc(t, a0, aArray, bArray, baseFreq = 441) {
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
  return a0 * (1 / Math.sqrt(2)) + cosSum + sinSum;
}

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
  let a0 = dot_function(f, (t) => 1 / Math.sqrt(2), dotN);
  let anArray = [];
  let bnArray = [];
  for (let n = 0; n < N; n++) {
    const freq = (n + 1) * baseFreq;
    anArray.push(dot_function(f, (t) => waveCos2npiFunc(t, freq), dotN));
    bnArray.push(dot_function(f, (t) => waveSin2npiFunc(t, freq), dotN));
  }
  return {a0, anArray, bnArray};
}

/**
 * ボタン類
 */
let playNoiseButton;
let playSinButton;
let playRectButton;
let playFoorierButton;

/**
 * テキスト表示値
 */
let a0Value = 0;
let anValueArray = [];
let bnValueArray = [];

/**
 * 再生中の波形データ
 */
let playWaveData = [];

/**
 * ノイズ音再生ボタン押下
 */
function pushNoisePlayButton() {
  playSoundAndCheckFourier(waveNoiseFunc);
}

/**
 * sin波再生ボタン押下
 */
function pushSinPlayButton() {
  playSoundAndCheckFourier((t) => waveSin2npiFunc(t, 441));
}

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
  playSoundAndCheckFourier((t) => waveFourierSeriesFunc(t, 0, [], bArray));
}

/**
 * フーリエ波形再生ボタン押下
 */
function pushFoorierPlayButton() {
  playSoundAndCheckFourier((t) => waveFourierSeriesFunc(t, 0, [1, 2, 3], [1]));
}

/**
 * サウンド再生とフーリエ解析を行う
 * @param {(t: number) => number} waveFunc 波形関数
 */
function playSoundAndCheckFourier(waveFunc) {
  // サウンド再生
  playWaveData = playSound(waveFunc);
  
  // フーリエ級数を求める
  const checkFourierCount = 5;
  let result = fourierCoefficients(waveFunc, checkFourierCount);
  a0Value = result.a0;
  anValueArray = result.anArray;
  bnValueArray = result.bnArray;
}

/**
 * 初期化処理
 */
function setup() {
  createCanvas(ScreenWidth, ScreenHeight);
  // ボタン設定
  playNoiseButton = createButton("Play Noise");
  playNoiseButton.mousePressed(pushNoisePlayButton);
  playNoiseButton.position(ScreenWidth - (playNoiseButton.width), 20);
  playSinButton = createButton("Play Sin Wave");
  playSinButton.mousePressed(pushSinPlayButton);
  playSinButton.position(ScreenWidth - (playSinButton.width), 48);
  playRectButton = createButton("Play Rect Wave");
  playRectButton.mousePressed(pushRectPlayButton);
  playRectButton.position(ScreenWidth - (playRectButton.width), 76);
  playFoorierButton = createButton("Play Foorier Wave");
  playFoorierButton.mousePressed(pushFoorierPlayButton);
  playFoorierButton.position(ScreenWidth - (playFoorierButton.width), 102);
}

/**
 * 描画処理
 */
function draw() {
  background(255);
  drawGrid();
  drawWaveData(playWaveData);

  // テキスト描画
  noStroke()
  fill(0, 0, 0)
  textSize(18)
  text(`a0: ${Math.abs(a0Value).toFixed(1)}`, 20, 30)
  text(`a[]: ${anValueArray.map(x => Math.abs(x).toFixed(1)).join(', ')}`, 20, 56)
  text(`b[]: ${bnValueArray.map(x => Math.abs(x).toFixed(1)).join(', ')}`, 20, 82)
}
