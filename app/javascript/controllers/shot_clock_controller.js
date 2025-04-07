import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time"];
  static values = {
    running: Boolean,
    seconds: Number
  };

  connect() {
    this.runningValue = false;
    this.secondsValue = 24.0; // 内部では小数点を扱う（初期値を24.0秒に設定）
    this.timer = null;
    this.updateDisplay();
  }

  updateDisplay() {
    this.timeTarget.textContent = Math.floor(this.secondsValue); // 画面に秒数を整数として表示
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
    // ストップ状態の場合は、24秒に設定して停止
    if (!this.runningValue) {
      this.secondsValue = 24.0; // 24.0秒に設定
      this.updateDisplay(); // 画面に表示
    } else {
      // 動作中の場合は、24秒に設定してすぐに再開
      this.secondsValue = 24.0; // 24.0秒に設定
      this.updateDisplay(); // 画面に表示
      this.start(); // 再開
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
    this.secondsValue += 1; // 0.1秒増加
    this.updateDisplay();
    this.playSwichSound();
  }

  decrease() {
    if (this.secondsValue > 0) {
      this.secondsValue -= 1; // 0.1秒減少
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
