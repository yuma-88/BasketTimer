import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["time"]
  static values = { running: Boolean, minutes: Number, seconds: Number }

  connect() {
    this.runningValue = false;
    this.loadSettings(); // 設定を読み込む
    this.timer = null;
    this.updateDisplay();

    // 設定更新イベントをリッスン
    window.addEventListener("settings:updated", () => this.loadSettings());
  }

  disconnect() {
    // イベントリスナーを削除
    window.removeEventListener("settings:updated", () => this.loadSettings());
  }

  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    const mainTime = savedSettings.mainTime || "10:00";
    
    // メインタイマーの時間を設定
    const [minutes, seconds] = mainTime.split(":").map(Number);
    this.minutesValue = minutes;
    this.secondsValue = seconds;

    this.updateDisplay();
  }

  toggleTimer() {
    if (this.runningValue) {
      this.stop();
    } else {
      this.start();
    }
  }

  start() {
    if (!this.runningValue) {
      this.runningValue = true;
      this.timer = setInterval(() => this.countdown(), 1000);
    }
  }

  stop() {
    this.runningValue = false;
    clearInterval(this.timer);
  }

  reset() {
    this.stop();
    this.loadSettings(); // 設定から再読み込み
  }

  countdown() {
    if (this.minutesValue === 0 && this.secondsValue === 0) {
      this.stop();
      return;
    }

    if (this.secondsValue === 0) {
      this.minutesValue -= 1;
      this.secondsValue = 59;
    } else {
      this.secondsValue -= 1;
    }
    this.updateDisplay();
  }

  increaseMinute() {
    this.minutesValue += 1;
    this.updateDisplay();
  }

  decreaseMinute() {
    if (this.minutesValue > 0) {
      this.minutesValue -= 1;
      this.updateDisplay();
    }
  }

  increaseSecond() {
    if (this.secondsValue < 59) {
      this.secondsValue += 1;
    } else {
      this.minutesValue += 1;
      this.secondsValue = 0;
    }
    this.updateDisplay();
  }

  decreaseSecond() {
    if (this.secondsValue > 0) {
      this.secondsValue -= 1;
    } else if (this.minutesValue > 0) {
      this.minutesValue -= 1;
      this.secondsValue = 59;
    }
    this.updateDisplay();
  }

  updateDisplay() {
    this.timeTarget.textContent = `${String(this.minutesValue).padStart(2, "0")}:${String(this.secondsValue).padStart(2, "0")}`;
  }
}
