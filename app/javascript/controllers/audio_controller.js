import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [];

  connect() {
    // 音声オブジェクトの作成（1回だけ作成）
    this.endSound = new Audio("/sounds/end.mp3");
    this.buzzerSound = new Audio("/sounds/buzzer.mp3");

    // 各カウントダウン音声ファイルの作成
    this.countdownSounds = {
      60: new Audio("/sounds/countdown_60.mp3"),
      30: new Audio("/sounds/countdown_30.mp3"),
      15: new Audio("/sounds/countdown_15.mp3"),
      9: new Audio("/sounds/countdown_10.mp3"),
      8: new Audio("/sounds/countdown_9.mp3"),
      7: new Audio("/sounds/countdown_8.mp3"),
      6: new Audio("/sounds/countdown_7.mp3"),
      5: new Audio("/sounds/countdown_6.mp3"),
      4: new Audio("/sounds/countdown_5.mp3"),
      3: new Audio("/sounds/countdown_4.mp3"),
      2: new Audio("/sounds/countdown_3.mp3"),
      1: new Audio("/sounds/countdown_2.mp3"),
      0: new Audio("/sounds/countdown_1.mp3"),
    };

    // 音声設定をロード
    this.loadAudioSettings();
  }

  // 音声設定をロード
  loadAudioSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    const enableAudio = savedSettings.enableAudio ?? true; // 初期状態で音声を有効
    const countdownVoice = savedSettings.countdownVoice ?? true; // 初期状態でカウントダウン音声を有効

    if (!enableAudio) {
      this.disableAudio(); // 音声が無効の場合、音声を無効にする
    }

    if (!countdownVoice) {
      this.disableCountdownVoice(); // countdownVoiceが無効の場合、カウントダウン音声を無効にする
    }
  }

  // 音声を無効にする
  disableAudio() {
    // すべての音声オブジェクトを無効にする
    this.endSound = null;
  }

  // カウントダウン音声を無効にする
  disableCountdownVoice() {
    // カウントダウン音声だけを無効にする
    this.countdownSounds = {};
  }

  // 音声を再生するメソッド（音声設定が有効な場合のみ）
  playClickSound() {
    if (this.endSound) { // 音声設定が有効な場合のみ再生
      const clickSound = new Audio("/sounds/click.mp3");
      clickSound.play();
    }
  }

  playBuzzerSound() {
      this.buzzerSound.loop = true; // ループ再生を設定
      if (this.buzzerSound.paused) {
        this.buzzerSound.play();
      }
  }

  stopBuzzerSound() {
    if (!this.buzzerSound.paused) {
      this.buzzerSound.pause();
      this.buzzerSound.currentTime = 0; // 再生位置をリセット
    }
  }

  playEndSound() {
    if (this.endSound) { // 音声設定が有効な場合のみ再生
      this.endSound.play();
    }
  }

  // カウントダウン音声を再生
  playCountdownSound(seconds) {
    if (this.countdownSounds[seconds]) {
      this.countdownSounds[seconds].play();
    }
  }
}
