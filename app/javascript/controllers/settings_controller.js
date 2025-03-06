import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "mainTime", "breakTime", "halfTime",
    "endless", "showMainTimer", "showScore",
    "show24Timer", "sync24Timer", "enableAudio", "countdownVoice"
  ];

  connect() {
    this.loadSettings();
  }

  // 設定を読み込む
  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    this.mainTimeTarget.textContent = savedSettings.mainTime || "10:00";
    this.breakTimeTarget.textContent = savedSettings.breakTime || "1:00";
    this.halfTimeTarget.textContent = savedSettings.halfTime || "10:00";

    this.endlessTarget.checked = savedSettings.endless || false;
    this.showScoreTarget.checked = savedSettings.showScore || false;
    this.show24TimerTarget.checked = savedSettings.show24Timer || false;
    this.sync24TimerTarget.checked = savedSettings.sync24Timer || false;
    this.enableAudioTarget.checked = savedSettings.enableAudio || false;
    this.countdownVoiceTarget.checked = savedSettings.countdownVoice || false;
  }

  // 時間を編集モードにする
  editTime(event) {
    const target = event.target;
    target.contentEditable = "true";
    target.focus();
  }

  // 時間を保存する
  saveTime(event) {
    const target = event.target;
    const newTime = target.innerText.trim();

    // 時間形式チェック (MM:SS)
    if (!/^\d{1,2}:\d{2}$/.test(newTime)) {
      alert("正しい時間形式（MM:SS）で入力してください！");
      this.loadSettings(); // 無効な場合は元に戻す
      return;
    }

    target.contentEditable = "false"; // 編集モードを終了

    // 設定を保存
    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings[target.dataset.settingsTarget] = newTime;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    // 設定更新イベント発火
    window.dispatchEvent(new Event("settings:updated"));
  }

  // Enterキーで確定
  handleEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur(); // フォーカスを外して確定
    }
  }
}
