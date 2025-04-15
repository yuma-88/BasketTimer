import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time1", "time2"]; // 複数のターゲットを追加
  static values = {
    running: Boolean,
    seconds: Number
  };

  connect() {
    this.runningValue = false;
    this.secondsValue = 24.0; // 初期値を24.0秒に設定
    this.timer = null;
    this.updateDisplay();
  }

  updateDisplay() {
    // secondsValueが0未満にならないようにする
    const displayValue = Math.max(0, Math.floor(this.secondsValue)); // 0未満にならないように
    this.time1Target.textContent = displayValue; // time1に表示
    this.time2Target.textContent = displayValue; // time2に表示
  }

  toggleShotClock() {
    if (this.runningValue) {
      this.stop();
    } else {
      this.start();
    }
    this.playSwichSound();
  }

  start() {
    if (this.runningValue) return;
    this.runningValue = true;
    this.timer = setInterval(() => {
      if (this.secondsValue > 0) {
        this.secondsValue -= 0.1; // 0.1秒ずつ減少
        this.updateDisplay();
      } else {
        this.stop();
        this.playEndSound();
        const gameTimerController = this.application.controllers.find(controller => controller.identifier === 'game_timer');
        if (gameTimerController) {
          gameTimerController.stop();
        }
      }
    }, 100); // 100msごとにカウントダウン（0.1秒ごと）
  }

  stop() {
    this.runningValue = false;
    clearInterval(this.timer);
  }

  reset() {
    this.stop();
    this.secondsValue = 24.0; // 初期状態に戻す（24.0秒）
    this.updateDisplay();
  }

  setTwentyFour() {
    if (!this.runningValue) {
      this.secondsValue = 24.0; // 24.0秒に設定
      this.updateDisplay();
    } else {
      this.secondsValue = 24.0; // 24.0秒に設定
      this.updateDisplay();
      this.start();
    }
    this.playSwichSound();
  }

  setFourteen() {
    if (!this.runningValue) {
      this.secondsValue = 14.0;
      this.updateDisplay();
    } else {
      this.secondsValue = 14.0;
      this.updateDisplay();
      this.start();
    }
    this.playSwichSound();
  }

  setTimeout() {
    this.stop();
    this.secondsValue = 60.0; // 60秒に変更
    this.updateDisplay();
    this.start();
    this.playSwichSound();
  }

  increase() {
    this.secondsValue += 1; // 1秒増加
    this.updateDisplay();
    this.playSwichSound();
  }

  decrease() {
    if (this.secondsValue > 0) {
      this.secondsValue -= 1; // 1秒減少
      this.updateDisplay();
      this.playSwichSound();
    }
  }

  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playSwichSound();
    }
  }

  playEndSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playEndSound();
    }
  }
}
