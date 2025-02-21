import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["time"]
  static values = { running: Boolean, minutes: Number, seconds: Number }

  connect() {
    this.runningValue = false;
    this.minutesValue = 10; // 初期値を10分に設定
    this.secondsValue = 0;
    this.timer = null;
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
    this.minutesValue = 10;
    this.secondsValue = 0;
    this.updateDisplay();
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
