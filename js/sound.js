
/**
 * サンプルレート
 */
const SampleRate = 44100;

/**
 * 再生時間(秒)
 */
const PlaySec = 1;

/**
 * 再生中の波形データ
 */
let bufferSource = null;

/**
 * サウンド再生処理
 * 参考: https://developer.mozilla.org/ja/docs/Web/API/BaseAudioContext/createBuffer
 * @param {*} func 波形関数
 */
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
    let playWaveData = channelData;

    // play sound.
    bufferSource = audioCtx.createBufferSource();
    bufferSource.buffer = buffer;
    bufferSource.connect(audioCtx.destination);
    bufferSource.start();

    return playWaveData;
}
