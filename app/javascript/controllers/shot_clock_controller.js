import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time"];
  static values = {
    running: Boolean,
    seconds: Number
  };

  connect() {
    this.runningValue = false;
    this.secondsValue = 24; // 初期値を24秒に設定
    this.timer = null;
    this.updateDisplay();
  }

  updateDisplay() {
    this.timeTarget.textContent = this.secondsValue; // 画面に秒数を表示
  }

  toggleShotClock() {
    if (this.runningValue) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (this.runningValue) return;
    this.runningValue = true;
    this.timer = setInterval(() => {
      if (this.secondsValue > 0) {
        this.secondsValue--;
        this.updateDisplay();
      } else {
        this.stop();
      }
    }, 1000);
  }

  stop() {
    this.runningValue = false;
    clearInterval(this.timer);
  }

  reset() {
    this.secondsValue = 24; // 初期状態に戻す（24秒）
    this.updateDisplay();
  }

  setTwentyFour() {
    // ストップ状態の場合は、24秒に設定して停止
    if (!this.runningValue) {
      this.secondsValue = 24; // 24秒に設定
      this.updateDisplay(); // 画面に表示
    } else {
      // 動作中の場合は、24秒に設定してすぐに再開
      this.secondsValue = 24; // 24秒に設定
      this.updateDisplay(); // 画面に表示
      this.start(); // 再開
    }
  }

  setFourteen() {
    if (!this.runningValue) {
      this.secondsValue = 14;
      this.updateDisplay();
    } else {
      this.secondsValue = 14;
      this.updateDisplay();
      this.start();
    }
  }

  setTimeout() {
    this.stop();
    this.secondsValue = 60; // 60秒に変更
    this.updateDisplay();
    this.start();
  }

  increase() {
    this.secondsValue++;
    this.updateDisplay();
  }

  decrease() {
    if (this.secondsValue > 0) {
      this.secondsValue--;
      this.updateDisplay();
    }
  }
}
