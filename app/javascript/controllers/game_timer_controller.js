import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time", "select"];

  static values = { running: Boolean, minutes: Number, seconds: Number }

  connect() {
    this.runningValue = false;
    this.loadSettings(); // 設定を読み込む
    this.timer = null;
    this.updateDisplay();

    // 設定更新イベントをリッスン
    window.addEventListener("settings:updated", () => this.loadSettings());

    // <select>の変更イベントを追加
    this.selectTarget.addEventListener("change", (event) => this.handleSelectChange(event));
  }

  disconnect() {
    // イベントリスナーを削除
    window.removeEventListener("settings:updated", () => this.loadSettings());
  }

  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    
    // 各タイマーの時間を設定
    const mainTime = savedSettings.mainTime || "10:00";
    const breakTime = savedSettings.breakTime || "1:00";  // インターバル時間
    const halfTime = savedSettings.halfTime || "10:00";  // ハーフ時間
    
    // メインタイマーの時間を設定
    const [minutes, seconds] = mainTime.split(":").map(Number);
    this.minutesValue = minutes;
    this.secondsValue = seconds;
    
    // インターバルやハーフタイムの時間も保持
    this.breakTime = breakTime;
    this.halfTime = halfTime;
    
    // P1, P2, P3, P4の時間設定（ここに仮の時間を設定）
    this.p1Time = savedSettings.p1Time || "10:00";
    this.p2Time = savedSettings.p2Time || "10:00";
    this.p3Time = savedSettings.p3Time || "10:00";
    this.p4Time = savedSettings.p4Time || "10:00";

    this.updateDisplay();
  }

  handleSelectChange(event) {
    const selectedOption = event.target.value;

    // 選択に応じた時間を設定
    if (selectedOption === "インターバル") {
      // インターバル時間を設定
      const [breakMinutes, breakSeconds] = this.breakTime.split(":").map(Number);
      this.minutesValue = breakMinutes;
      this.secondsValue = breakSeconds;
    } else if (selectedOption === "ハーフ") {
      // ハーフタイムを設定
      const [halfMinutes, halfSeconds] = this.halfTime.split(":").map(Number);
      this.minutesValue = halfMinutes;
      this.secondsValue = halfSeconds;
    } else if (selectedOption === "P1") {
      // P1時間を設定
      const [p1Minutes, p1Seconds] = this.p1Time.split(":").map(Number);
      this.minutesValue = p1Minutes;
      this.secondsValue = p1Seconds;
    } else if (selectedOption === "P2") {
      // P2時間を設定
      const [p2Minutes, p2Seconds] = this.p2Time.split(":").map(Number);
      this.minutesValue = p2Minutes;
      this.secondsValue = p2Seconds;
    } else if (selectedOption === "P3") {
      // P3時間を設定
      const [p3Minutes, p3Seconds] = this.p3Time.split(":").map(Number);
      this.minutesValue = p3Minutes;
      this.secondsValue = p3Seconds;
    } else if (selectedOption === "P4") {
      // P4時間を設定
      const [p4Minutes, p4Seconds] = this.p4Time.split(":").map(Number);
      this.minutesValue = p4Minutes;
      this.secondsValue = p4Seconds;
    }
    
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

  resetTime() {
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

  resetAll() {
    // 試合時間のリセット
    this.resetTime();
  
    // ショットクロックのリセット
    const shotClockController = this.application.controllers.find(controller => controller.identifier === 'shot_clock');
    if (shotClockController) {
      shotClockController.reset();
    }
  
    // スコアのリセット
    const scoreController = this.application.controllers.find(controller => controller.identifier === 'score');
    if (scoreController) {
      scoreController.resetScores();
    }
  }  
}
