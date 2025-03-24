import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [];

  connect() {
    // 音声オブジェクトの作成（1回だけ作成）
    this.endSound = new Audio("/sounds/end.mp3");
    this.buzzerSound = new Audio("/sounds/buzzer.mp3");
  }

  // 音声を再生するメソッド
  playClickSound() {
    const clickSound = new Audio("/sounds/click.mp3");
    clickSound.play();
  }

  playBuzzerSound() {
    // ボタンが押されている間、音を再生し続ける
    this.buzzerSound.loop = true; // ループ再生を設定
  
    // 音を開始する
    if (this.buzzerSound.paused) {
      this.buzzerSound.play();
    }
  }
  
  stopBuzzerSound() {
    // ボタンが離されたら、音を停止する
    if (!this.buzzerSound.paused) {
      this.buzzerSound.pause();
      this.buzzerSound.currentTime = 0; // 再生位置をリセット
    }
  }
  

  playEndSound() {
    if (this.endSound) {
      this.endSound.play();
    }
  }
}
