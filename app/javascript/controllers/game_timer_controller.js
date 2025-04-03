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

    // キーボードのイベントをリッスン（Enterキーやスペースキーでスタート/ストップ）
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  disconnect() {
    // イベントリスナーを削除
    window.removeEventListener("settings:updated", () => this.loadSettings());
    document.removeEventListener("keydown", this.handleKeydown.bind(this)); // キーボードイベントのリスナーを削除
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
    
    this.mainTime = mainTime;
    this.breakTime = breakTime;
    this.halfTime = halfTime;

    this.endless = savedSettings.endless || false;
    // endless モードがオンの場合、select を無効化
    this.toggleSelectAvailability();

    // 音声設定の読み込み
    this.memberChangeVoice = savedSettings.memberChangeVoice ?? false;

    this.updateDisplay();
  }

  toggleSelectAvailability() {
    if (this.endless) {
      this.selectTarget.disabled = true; // endless がオンなら select を無効化
    } else {
      this.selectTarget.disabled = false; // endless がオフなら select を有効化
    }
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
      const [periodMinutes, periodSeconds] = this.mainTime.split(":").map(Number);
      this.minutesValue = periodMinutes;
      this.secondsValue = periodSeconds;
    }
    
    this.updateDisplay();
    this.playSwichSound();
  }

  // キーボードのキーを監視
  handleKeydown(event) {
    if (this.endless && ['1', '2', '3', '4', '5', '6', 'h', 'H', 'i', 'I'].includes(event.key)) {
      event.preventDefault(); // デフォルトの動作を無効にする
      return; // それ以上の処理をしない
    }

    // エンターキー (Enter) または スペースキー (Space) が押されたとき
    if (event.key === "Enter") {
      this.toggleTimer(); // タイマーのスタート/ストップを切り替え
    }

    // Rキーが押されたときにresetAllを呼び出す
    if (event.key === "r" || event.key === "R") {
      this.resetAll(); // resetAllメソッドを呼び出す
    }

    if (event.key === "1") {
      this.selectTarget.value = "P1";
      this.resetTime();
    }

    if (event.key === "2") {
      this.selectTarget.value = "P2";
      this.resetTime();
    }

    if (event.key === "3") {
      this.selectTarget.value = "P3";
      this.resetTime();
    }

    if (event.key === "4") {
      this.selectTarget.value = "P4";
      this.resetTime();
    }

    if (event.key === "5" || event.key === "h" || event.key === "H") {
      this.selectTarget.value = "ハーフ";
      this.resetTime();
    }

    if (event.key === "6" || event.key === "i" || event.key === "I") {
      this.selectTarget.value = "インターバル";
      this.resetTime();
    }
  }

  toggleTimer() {
    if (this.runningValue) {
      this.stop();
    } else {
      this.start();
    }
    this.playSwichSound();
  }

  start() {
    if (!this.runningValue) {
      this.runningValue = true;
      this.timer = setInterval(() => this.countdown(), 100); // 100ミリ秒でカウントダウン
    }
  }

  stop() {
    this.runningValue = false;
    clearInterval(this.timer);
  }

  resetTime() {
    if (!this.isResetAll) {
        this.playSwichSound(); // タイマーリセット時に音を鳴らす
    }
    this.stop(); // タイマーを停止

    // 現在選択されているモードに応じた時間にリセット
    const selectedOption = this.selectTarget.value;

    if (selectedOption === "インターバル") {
        // インターバル時間にリセット
        const [breakMinutes, breakSeconds] = this.breakTime.split(":").map(Number);
        this.minutesValue = breakMinutes;
        this.secondsValue = breakSeconds;
    } else if (selectedOption === "ハーフ") {
        // ハーフタイム時間にリセット
        const [halfMinutes, halfSeconds] = this.halfTime.split(":").map(Number);
        this.minutesValue = halfMinutes;
        this.secondsValue = halfSeconds;
    } else if (selectedOption === "P1" || selectedOption === "P2" || selectedOption === "P3" || selectedOption === "P4") {
        // ピリオド時間（メインタイマー）にリセット
        const [periodMinutes, periodSeconds] = this.mainTime.split(":").map(Number);
        this.minutesValue = periodMinutes;
        this.secondsValue = periodSeconds;
    }

    // 設定を再読み込み
    this.updateDisplay();
  }

  countdown() {
    // 秒数が0になったらタイマーを止め、終了音を鳴らす
    if (this.minutesValue === 0 && this.secondsValue <= 0) {
      this.stop();  // タイマーを停止
      this.playEndSound();  // 終了音を鳴らす
    
      if (this.endless) {
        // endlessがオンの場合、インターバルタイマーを開始
        this.startIntervalTimer();
      }
      return;
    }
  
    // 秒数が0になった場合、分を1減らして秒数を59.9秒に設定
    if (this.secondsValue <= 0) {
      if (this.minutesValue > 0) {
        this.minutesValue -= 1;
        this.secondsValue = 59.9;
      } else {
        this.secondsValue = 0; // 負の秒数を防ぐ
      }
    } else {
      // 秒数を0.1秒ずつ減少
      this.secondsValue -= 0.1;
    }

    // 秒数が0未満にならないように調整
    if (this.secondsValue < 0) {
      this.secondsValue = 0;
    }
  
    // 秒数を更新
    this.updateDisplay();
  
    // インターバルやハーフタイムの場合、カウントダウン音声を再生しない
    if (this.preventCountdownSound) return;

    // メンバーチェンジの処理を呼び出す
    this.handleMemberChange();
  
    // 1分00秒で音声を再生
    if (this.minutesValue === 1 && this.secondsValue <= 0.1) {
      this.playCountdownSound(60);
    }
  
    // 1秒間隔でカウントダウン音声を再生
    if ([30, 15, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].includes(Math.floor(this.secondsValue)) && this.minutesValue === 0) {
      this.playCountdownSound(Math.floor(this.secondsValue));
    }
  }

  // インターバルタイマー開始
  startIntervalTimer() {
    if (this.isIntervalRunning) return; // すでにインターバルが動いている場合、処理を中断
  
    this.isIntervalRunning = true; // インターバルが実行中であることを示す
    this.preventCountdownSound = true;
  
    // インターバルタイマーの開始
    const [breakMinutes, breakSeconds] = this.breakTime.split(":").map(Number);
    this.minutesValue = breakMinutes;
    this.secondsValue = breakSeconds;
  
    // インターバルのカウントダウンを開始
    setInterval(() => {
      if (this.minutesValue === 0 && this.secondsValue <= 0) {
        // インターバル終了時に自動的にゲーム時間に戻す
        this.resetToGame();
      }
    }, 1000);  // 1秒ごとに確認
  
    // インターバルタイマーを開始
    setTimeout(() => {
      this.selectTarget.value = "インターバル";  // selectをインターバルに変更
      this.start(); // インターバルタイマーを開始
    }, 3000); // インターバル開始時に3秒の遅延
  }
  
  // 試合時間に戻す処理
  resetToGame() {
    this.isIntervalRunning = false; // インターバルが終了したことを示す

    // P1の試合時間に戻す処理
    const [gameMinutes, gameSeconds] = this.mainTime.split(":").map(Number);
    this.minutesValue = gameMinutes;
    this.secondsValue = gameSeconds;
    setTimeout(() => {
      this.selectTarget.value = "P1"; // P1に戻す
      this.updateDisplay();
      this.stop();
    }, 1000);
  }

  updateDisplay() {
    // 秒数を整数に切り捨て
    const secondsInt = Math.floor(this.secondsValue);
  
    // 分が1桁の場合はそのまま表示、二桁の場合はゼロ埋め
    const minutesFormatted = `${this.minutesValue}`;
    const secondsFormatted = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
  
    // 秒数が1分未満の場合は小数点を含む表示に切り替える
    if (this.minutesValue < 1) {
      this.timeTarget.textContent = `${this.secondsValue.toFixed(1)}`;
    } else {
      this.timeTarget.textContent = `${minutesFormatted}:${secondsFormatted}`;
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
