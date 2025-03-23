import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [];

  connect() {
    // 音声オブジェクトの作成（1回だけ作成）
    this.endSound = new Audio("/assets/sounds/end.mp3");
    this.buzzerSound = new Audio("/assets/sounds/buzzer.mp3");
  }

  // 音声を再生するメソッド
  playClickSound() {
    const clickSound = new Audio("/assets/sounds/click.mp3");
    clickSound.play();
  }

  playBuzzerSound() {
    if (!this.buzzerSound.paused) {
      this.buzzerSound.pause();
      this.buzzerSound.currentTime = 0; // 再生位置をリセット
    }
    this.buzzerSound.play();
  }

  playEndSound() {
    if (this.endSound) {
      this.endSound.play();
    }
  }
}
