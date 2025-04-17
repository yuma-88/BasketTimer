import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time", "select"];
  static values = { running: Boolean, minutes: Number, seconds: Number };

  connect() {
    this.runningValue = false;
    this.loadSettings(); // 設定を読み込む
    this.timer = null;
    this.updateDisplay();

    // 設定更新イベントをリッスン
    window.addEventListener("settings:updated", () => this.loadSettings());  // アロー関数を使用

    // 各 select に change イベントを設定
    this.selectTargets.forEach(select => {
      select.addEventListener("change", event => this.handleSelectChange(event)); // アロー関数を使用
    });

    // キーボードのイベントをリッスン（Enterキーやスペースキーでスタート/ストップ）
    document.addEventListener("keydown", event => this.handleKeydown(event)); // アロー関数を使用
  }

  disconnect() {
    window.removeEventListener("settings:updated", () => this.loadSettings());  // 同じくアロー関数を使用
    document.removeEventListener("keydown", event => this.handleKeydown(event)); // 同じくアロー関数を使用

    // イベントリスナー削除
    this.selectTargets.forEach(select => {
      select.removeEventListener("change", event => this.handleSelectChange(event)); // 同じくアロー関数を使用
    });
  }

  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    const mainTime = savedSettings.mainTime || "10:00";
    const breakTime = savedSettings.breakTime || "1:00";
    const halfTime = savedSettings.halfTime || "10:00";

    const [minutes, seconds] = mainTime.split(":").map(Number);
    this.minutesValue = minutes;
    this.secondsValue = seconds;

    this.mainTime = mainTime;
    this.breakTime = breakTime;
    this.halfTime = halfTime;
    this.endless = savedSettings.endless ?? false;
    this.toggleSelectAvailability();

    this.sync24Timer = savedSettings.sync24Timer ?? false;
    this.teamIdentification = savedSettings.teamIdenfication ?? false;
    this.memberChangeVoice = savedSettings.memberChangeVoice ?? false;

    this.updateDisplay();
  }

  toggleSelectAvailability() {
    this.selectTargets.forEach(select => {
      select.disabled = this.endless;
    });
  }

  get currentSelectValue() {
    // 複数セレクトの中から最初の有効な値を取得（1つをメインに使う想定）
    return this.selectTargets[0]?.value ?? "P1";
  }

  handleSelectChange(event) {
    const selectedOption = event.target.value;

    this.preventCountdownSound = (selectedOption === "インターバル" || selectedOption === "ハーフ");

    if (selectedOption === "インターバル") {
      const [breakMinutes, breakSeconds] = this.breakTime.split(":").map(Number);
      this.minutesValue = breakMinutes;
      this.secondsValue = breakSeconds;
    } else if (selectedOption === "ハーフ") {
      const [halfMinutes, halfSeconds] = this.halfTime.split(":").map(Number);
      this.minutesValue = halfMinutes;
      this.secondsValue = halfSeconds;
    } else if (["P1", "P2", "P3", "P4"].includes(selectedOption)) {
      const [periodMinutes, periodSeconds] = this.mainTime.split(":").map(Number);
      this.minutesValue = periodMinutes;
      this.secondsValue = periodSeconds;
    }

    this.updateDisplay();
    this.playSwichSound();
  }

  handleKeydown(event) {
    if (this.endless && ['1','2','3','4','5','6','h','H','i','I'].includes(event.key)) {
      event.preventDefault();
      return;
    }

    if (event.key === "Enter") this.toggleTimer();
    if (event.key === "r" || event.key === "R") this.resetAll();
    if (event.key === "t" || event.key === "T") this.resetTime();

    const keyToValueMap = {
      "1": "P1", "2": "P2", "3": "P3", "4": "P4",
      "5": "ハーフ", "h": "ハーフ", "H": "ハーフ",
      "6": "インターバル", "i": "インターバル", "I": "インターバル"
    };

    if (keyToValueMap[event.key]) {
      this.selectTargets.forEach(select => select.value = keyToValueMap[event.key]);
      this.resetTime();
    }
  }

  toggleTimer() {
    this.runningValue ? this.stop() : this.start();
    this.playSwichSound();
  }

  start() {
    if (!this.runningValue) {
      this.runningValue = true;
      this.timer = setInterval(() => this.countdown(), 100);
    }

    if (["インターバル", "ハーフ"].includes(this.currentSelectValue)) return;

    if (this.sync24Timer) {
      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot_clock');
      if (shotClockController) {
        const totalSeconds = this.minutesValue * 60 + this.secondsValue;
        if (totalSeconds > shotClockController.secondsValue) {
          shotClockController.start();
        }
      }
    }
  }

  stop() {
    this.runningValue = false;
    clearInterval(this.timer);

    if (["インターバル", "ハーフ"].includes(this.currentSelectValue)) return;

    if (this.sync24Timer) {
      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot_clock');
      if (shotClockController) {
        const totalSeconds = this.minutesValue * 60 + this.secondsValue;
        if (totalSeconds > shotClockController.secondsValue) {
          shotClockController.stop();
        }
      }
    }
  }

  resetTime() {
    if (!this.isResetAll) this.playSwichSound();
    this.stop();

    const option = this.currentSelectValue;

    if (option === "インターバル") {
      [this.minutesValue, this.secondsValue] = this.breakTime.split(":").map(Number);
    } else if (option === "ハーフ") {
      [this.minutesValue, this.secondsValue] = this.halfTime.split(":").map(Number);
    } else {
      [this.minutesValue, this.secondsValue] = this.mainTime.split(":").map(Number);
    }

    this.updateDisplay();
  }

  resetAll() {
    // 確認ダイアログを表示
    const confirmation = window.confirm("ゲームをリセットしますか？");
  
    // ユーザーが「OK」をクリックした場合にのみリセット処理を実行
    if (confirmation) {
      this.isResetAll = true;
      this.selectTargets.forEach(select => (select.value = "P1"));
      this.resetTime();
  
      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot_clock');
      if (shotClockController) shotClockController.reset();
  
      const scoreController = this.application.controllers.find(c => c.identifier === 'score');
      if (scoreController) scoreController.resetScores();
  
      this.hasPlayedMemberChange = false;
      this.preventCountdownSound = false;
      this.isResetAll = false;
    }
  }

  countdown() {
    if (this.minutesValue === 0 && this.secondsValue <= 0) {
      this.stop();
      this.playEndSound();

      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot_clock');
      if (shotClockController) shotClockController.reset();

      if (this.endless) {
        if (this.currentSelectValue === "P1") {
          this.startIntervalTimer();
        } else if (this.currentSelectValue === "インターバル") {
          this.resetToGame();
        }
      }

      this.hasPlayedMemberChange = false;
      return;
    }

    if (this.secondsValue <= 0) {
      if (this.minutesValue > 0) {
        this.minutesValue--;
        this.secondsValue = 59.9;
      } else {
        this.secondsValue = 0;
      }
    } else {
      this.secondsValue -= 0.1;
    }

    if (this.secondsValue < 0) this.secondsValue = 0;

    this.updateDisplay();
    if (this.preventCountdownSound) return;

    this.handleMemberChange();
    this.handleCountdownSound();
  }

  handleCountdownSound() {
    const sec = this.secondsValue.toFixed(1);
    if (this.minutesValue === 1 && sec <= "0.1") {
      this.playCountdownSound(60);
    }

    const targets = ["30.0", "15.0", "10.0", "9.0", "8.0", "7.0", "6.0", "5.0", "4.0", "3.0", "2.0", "1.0"];
    if (this.minutesValue === 0 && targets.includes(sec)) {
      this.playCountdownSound(Number(sec));
    }
  }

  handleMemberChange() {
    const [mainMinutes, mainSeconds] = this.mainTime.split(":").map(Number);
    const mainTimeSec = mainMinutes * 60 + mainSeconds;
    const currentSec = this.minutesValue * 60 + this.secondsValue;

    if (this.memberChangeVoice && Math.abs(currentSec - mainTimeSec / 2) <= 1 && !this.hasPlayedMemberChange) {
      this.hasPlayedMemberChange = true;
      this.stop();
      this.playMemberChangeBuzzerSound();
      setTimeout(() => {
        this.playMemberChangeBuzzerSound();
        setTimeout(() => this.playMemberChangeSound(), 1000);
      }, 1300);
    }
  }

  startIntervalTimer() {
    setTimeout(() => {
      this.selectTargets.forEach(select => (select.value = "インターバル"));
      this.preventCountdownSound = true;
      this.resetTime();
      this.start();
    }, 2000);
  }

  resetToGame() {
    setTimeout(() => {
      this.preventCountdownSound = false;
      this.selectTargets.forEach(select => (select.value = "P1"));
      this.resetTime();
    }, 2000);
  }

  updateDisplay() {
    const secondsInt = Math.floor(this.secondsValue);
    const minutesFormatted = `${this.minutesValue}`;
    const secondsFormatted = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;

    if (this.minutesValue < 1) {
      this.timeTarget.textContent = `${this.secondsValue.toFixed(1)}`;
    } else {
      this.timeTarget.textContent = `${minutesFormatted}:${secondsFormatted}`;
    }

    if (this.teamIdentification) {
      this.timeTarget.classList.add("text-yellow-400");
    } else {
      this.timeTarget.classList.remove("text-yellow-400");
    }
  }

  increaseMinute() {
    this.minutesValue += 1;
    this.updateDisplay();
    this.playSwichSound();
  }

  decreaseMinute() {
    if (this.minutesValue > 0) {
      this.minutesValue -= 1;
      this.updateDisplay();
      this.playSwichSound();
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
    this.playSwichSound();
  }

  decreaseSecond() {
    if (this.secondsValue > 0) {
      this.secondsValue -= 1;
    } else if (this.minutesValue > 0) {
      this.minutesValue -= 1;
      this.secondsValue = 59;
    }
    this.updateDisplay();
    this.playSwichSound();
  }

  playSwichSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playSwichSound();
  }

  playEndSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playEndSound();
  }

  playCountdownSound(seconds) {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playCountdownSound(seconds);
  }

  playMemberChangeBuzzerSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playMemberChangeBuzzerSound();
  }

  playMemberChangeSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playMemberChangeSound();
  }
}
