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
    this.originalSeconds = null;
    this.autoResetTo24 = false;
    this.timer = null;
    this.updateDisplay();
  }

  disconnect() {
    this.stop();
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
        this.secondsValue -= 0.1;
        this.updateDisplay();
      } else {
        this.stop();
        this.playEndSound();
      
        if (this.autoResetTo24) {
          this.secondsValue = 24.0;         // ← 自動で24秒に戻す
          this.updateDisplay();
          this.autoResetTo24 = false;       // ← フラグをリセット
        }
      
        if (this.originalSeconds !== null) {
          this.secondsValue = this.originalSeconds;
          this.originalSeconds = null;
          this.updateDisplay();
        }
        
        const gameTimerController = this.application.controllers.find(controller => controller.identifier === 'game_timer');
        if (gameTimerController) {
          gameTimerController.stop();
        }
      }
    }, 100); // 100msごとにカウントダウン（0.1秒ごと）
  }

  stop() {
    this.runningValue = false;
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  reset() {
    this.stop();
    this.secondsValue = 24.0; // 初期状態に戻す（24.0秒）
    this.updateDisplay();
  }

  setTwentyFour() {
    this.autoResetTo24 = true; // ← 追加
    this.originalSeconds = null;
    this.secondsValue = 24.0;
    this.updateDisplay();
    if (this.runningValue) this.start();
    this.playSwichSound();
  }
  
  setFourteen() {
    this.autoResetTo24 = true; // ← 追加
    this.originalSeconds = null;
    this.secondsValue = 14.0;
    this.updateDisplay();
    if (this.runningValue) this.start();
    this.playSwichSound();
  }

  setTimeout() {
    this.stop();
  
    // すでに originalSeconds がセットされているなら上書きしない
    if (this.originalSeconds === null) {
      this.originalSeconds = this.secondsValue;
    }
  
    this.secondsValue = 60.0; // タイムアウトの秒数
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
