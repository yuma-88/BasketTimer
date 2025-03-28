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
    this.periodTime = savedSettings.mainTime || "10:00";

    this.mainTime = mainTime;

    // 音声設定の読み込み
    this.memberChangeVoice = savedSettings.memberChangeVoice ?? false;

    this.updateDisplay();
  }

  handleMemberChange() {
    // メインタイマー（mainTime）を基に試合の半分の時間を計算
    const [mainMinutes, mainSeconds] = this.mainTime.split(":").map(Number);  // メインタイマーの分と秒を取得
    const mainTimeInSeconds = (mainMinutes * 60) + mainSeconds; // メインタイムの総秒数
    const halfTimeInSeconds = mainTimeInSeconds / 2; // 試合時間の半分（秒単位）
  
    // 現在の時間を秒単位で計算
    const currentTimeInSeconds = this.minutesValue * 60 + this.secondsValue;
  
    // メンバーチェンジ音声が有効で、試合時間の半分に達した場合
    if (this.memberChangeVoice && currentTimeInSeconds === halfTimeInSeconds) {
      this.stop(); // タイマーを止める
      
      // 1回目のブザー音を鳴らす
      this.playMemberChangeBuzzerSound();
  
      // 1秒後に2回目のブザー音を鳴らす
      setTimeout(() => {
        this.playMemberChangeBuzzerSound();
  
        // 2回目のブザー音の後にメンバーチェンジ音を鳴らす
        setTimeout(() => {
          this.playMemberChangeSound(); // メンバーチェンジ音を鳴らす
        }, 1000); // 1秒後にメンバーチェンジ音を鳴らす
      }, 1000); // 1秒後に2回目のブザー音を鳴らす
    }
  }
  
  handleSelectChange(event) {
    const selectedOption = event.target.value;

    // インターバルやハーフタイムが選ばれた場合、カウントダウン音声を無効にするフラグを立てる
    this.preventCountdownSound = (selectedOption === "インターバル" || selectedOption === "ハーフ");

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
    } else if (selectedOption === "P1", "P2", "P3", "P4") {
      // ピリオド時間を設定
      const [periodMinutes, periodSeconds] = this.periodTime.split(":").map(Number);
      this.minutesValue = periodMinutes;
      this.secondsValue = periodSeconds;
    }
    
    this.updateDisplay();
    this.playClickSound();
  }

  toggleTimer() {
    if (this.runningValue) {
      this.stop();
    } else {
      this.start();
    }
    this.playClickSound();
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
    if (!this.isResetAll) {
      this.playClickSound(); // タイマーリセット時に音を鳴らす
    }
    this.stop();
    this.loadSettings(); // 設定から再読み込み
  }

  countdown() {
    if (this.minutesValue === 0 && this.secondsValue === 0) {
      this.stop();
      this.playEndSound();
      return;
    }
  
    if (this.secondsValue === 0) {
      this.minutesValue -= 1;
      this.secondsValue = 59;
    } else {
      this.secondsValue -= 1;
    }
    this.updateDisplay();
  
    // インターバルやハーフタイムの場合、カウントダウン音声を再生しない
    if (this.preventCountdownSound) return;
  
    // 1:00 (60秒) で音声を再生
    if (this.minutesValue === 1 && this.secondsValue === 0) {
      this.playCountdownSound(60);  // 60秒の音声を再生
    }
  
    // メンバーチェンジの処理を呼び出す
    this.handleMemberChange();
  
    // カウントダウン音声を再生
    if ([30, 15, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].includes(this.secondsValue) && this.minutesValue === 0) {
      this.playCountdownSound(this.secondsValue);
    }
  }

  increaseMinute() {
    this.minutesValue += 1;
    this.updateDisplay();
    this.playClickSound();
  }

  decreaseMinute() {
    if (this.minutesValue > 0) {
      this.minutesValue -= 1;
      this.updateDisplay();
      this.playClickSound();
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
    this.playClickSound();
  }

  decreaseSecond() {
    if (this.secondsValue > 0) {
      this.secondsValue -= 1;
    } else if (this.minutesValue > 0) {
      this.minutesValue -= 1;
      this.secondsValue = 59;
    }
    this.updateDisplay();
    this.playClickSound();
  }

  updateDisplay() {
    this.timeTarget.textContent = `${String(this.minutesValue).padStart(2, "0")}:${String(this.secondsValue).padStart(2, "0")}`;
  }

  playClickSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playClickSound();
    }
  }

  playEndSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playEndSound();
    }
  }

  playCountdownSound(seconds) {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playCountdownSound(seconds);
    }
  }

  playMemberChangeBuzzerSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playMemberChangeBuzzerSound();
    }
  }

  playMemberChangeSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playMemberChangeSound();
    }
  }

  resetAll() {
    this.isResetAll = true; // resetAllのフラグを立てる
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

    this.isResetAll = false; // 処理が終わったらフラグを戻す
  }  
}
