// 画面設定
const ScreenWidth = 400;
const ScreenHeight = 400;

// 座標の表示範囲
const MinGridValueY = -1;
const MaxGridValueY = 1;
const MinGridValueX = 0;
const MaxGridValueX = 0.005;

// サンプルレート
const SampleRate = 44100;

// 再生時間(秒)
const PlaySec = 1;

// 再生中の波形データ
let playWaveData = [];
let bufferSource = null;

// サウンド再生
// 参考: https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/createBuffer
function playSound(func) {
  // stop playing sound.
  if (bufferSource) {
    bufferSource.stop();
  }

  // create context.
  let audioCtx = new AudioContext();
  audioCtx.sampleRate = SampleRate;

  // create mono channel buffer.
  let buffer = audioCtx.createBuffer(1, PlaySec * SampleRate, SampleRate);
  let channelData = buffer.getChannelData(0);
  for (var i = 0; i < buffer.length; i++) {
    let playSec = i / SampleRate;
    channelData[i] = func(playSec);
  }

  // set play wave data.
  playWaveData = channelData;

  // play sound.
  bufferSource = audioCtx.createBufferSource();
  bufferSource.buffer = buffer;
  bufferSource.connect(audioCtx.destination);
  bufferSource.start();
}

// 波形: ノイズ
function wave_noise_func(t) {
  return Math.random() * 2 - 1;
}

// 波形: sin(周波数 * 2πt)
function wave_sinusoid_func(t, freq) {
  return Math.sin(freq * 2 * Math.PI * t);
}

// 波形: フーリエ級数
function wave_foorier_series_func(t, freq, a0, a_array, b_array) {
  // TODO
}

// 再生ボタン
let playNoiseButton;
let playSinButton;

function pushNoisePlayButton() {
  playSound(wave_noise_func);
}

function pushSinPlayButton() {
  playSound((t) => wave_sinusoid_func(t, 441));
}

// 初期処理
function setup() {
  createCanvas(ScreenWidth, ScreenHeight);
  playNoiseButton = createButton("Play Noise");
  playNoiseButton.mousePressed(pushNoisePlayButton);
  playNoiseButton.position(ScreenWidth - (playNoiseButton.width), 20);
  playSinButton = createButton("Play Sin Wave");
  playSinButton.mousePressed(pushSinPlayButton);
  playSinButton.position(ScreenWidth - (playSinButton.width), 48);
}

// 更新処理
function draw() {
  background(255);
  drawGrid();
  drawPlayWaveData(playWaveData);
}

// グリッドの描画
function drawGrid() {
  strokeWeight(2);

  let dx = MaxGridValueX / 10;
  let dy = MaxGridValueY / 10;
  for (let x = MinGridValueX; x < MaxGridValueX; x+=dx) {
    for (let y = MinGridValueY; y < MaxGridValueY; y+=dy) {
      // 縦線
      stroke(240, 240, 240);
      drawLineCanvas(x+dx, y, x+dx, y+dy);
      // 横線
      stroke(180, 180, 180);
      drawLineCanvas(x, y+dy, x+dx, y+dy);
    }
  }

  // 中央線
  stroke(120, 120, 120);
  drawLineCanvas(MinGridValueX, 0, MaxGridValueX, 0);
  drawLineCanvas(0, MinGridValueY, 0, MaxGridValueY);
}

// 再生中の波形データを描画
function drawPlayWaveData(waveData) {
  strokeWeight(4);
  stroke(0, 0, 255);

  for (let i = 0; i < waveData.length; i++) {
    // 最大秒数を超えたらスキップ
    if (i / SampleRate > MaxGridValueX) {
      break;
    }
    if (i == waveData.length - 1) {
      break;
    }
    // 次のデータと繋げる
    let data = waveData[i];
    let time = i / SampleRate;
    let nextData = waveData[i + 1];
    let nextTime = (i + 1) / SampleRate;
    drawLineCanvas(time, data, nextTime, nextData);
  }
}

// 関数の描画
function drawFunc(func) {
  strokeWeight(4);
  stroke(0, 0, 255);
  let dx = MaxGridValueX / 100;
  for (let x = 0; x < MaxGridValueX; x+=dx) {
    drawLineCanvas(x, func(x), (x+dx), func(x+dx));
  }
}

// 受け取った座標位置で線を繋げて表示する
function drawLineCanvas(fromX, fromY, toX, toY) {
  fromX *= ScreenWidth/(MaxGridValueX-MinGridValueX);
  fromY *= ScreenHeight/(MaxGridValueY-MinGridValueY);
  toX *= ScreenWidth/(MaxGridValueX-MinGridValueX)
  toY *= ScreenHeight/(MaxGridValueY-MinGridValueY);
  let offset = [0, ScreenHeight/2]; // Y軸は反転させる
  line(fromX+offset[0], ScreenHeight-(fromY+offset[1]), toX+offset[0], ScreenHeight-(toY+offset[1]));
}
