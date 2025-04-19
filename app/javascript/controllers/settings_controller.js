import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "mainTime", "breakTime", "halfTime",
    "endless", "showMainTimer", "showScore",
    "show24Timer", "sync24Timer", "enableAudio",
    "countdownVoice", "memberChangeVoice", "teamIdenfication"
  ];

  connect() {
    this.loadSettings();
    this.updateAudioSettings();  // 初期状態の音声設定を反映
  }

  // 設定を読み込む
  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    this.mainTimeTarget.textContent = savedSettings.mainTime || "10:00";
    this.breakTimeTarget.textContent = savedSettings.breakTime || "1:00";
    this.halfTimeTarget.textContent = savedSettings.halfTime || "10:00";
    this.endlessTarget.checked = savedSettings.endless ?? false;

    this.sync24TimerTarget.checked = savedSettings.sync24Timer ?? false;
    this.teamIdenficationTarget.checked = savedSettings.teamIdenfication ?? false;

    this.enableAudioTarget.checked = savedSettings.enableAudio ?? true;
    this.countdownVoiceTarget.checked = savedSettings.countdownVoice ?? true;
    this.memberChangeVoiceTarget.checked = savedSettings.memberChangeVoice ?? false;
  }

  // 設定を保存する
  saveSettings(event) {
    const target = event.target;
    const settingName = target.dataset.settingsTarget;
    const settingValue = target.checked;

    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings[settingName] = settingValue;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    // 設定更新イベント
    window.dispatchEvent(new Event("settings:updated"));

    // 音声設定が変わったとき
    if (settingName === "enableAudio") {
      this.updateAudioSettings();
    }
  }

  // 音声設定を更新する（リアルタイム通知）
  updateAudioSettings() {
    const enableAudio = this.enableAudioTarget.checked;

    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    settings["enableAudio"] = enableAudio;
    settings["countdownVoice"] = enableAudio ? this.countdownVoiceTarget.checked : false;
    settings["memberChangeVoice"] = enableAudio ? this.memberChangeVoiceTarget.checked : false;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    this.countdownVoiceTarget.disabled = !enableAudio;
    this.memberChangeVoiceTarget.disabled = !enableAudio;

    if (!enableAudio) {
      this.countdownVoiceTarget.checked = false;
      this.memberChangeVoiceTarget.checked = false;
    }

    // カスタムイベントで通知
    window.dispatchEvent(new CustomEvent("audio:setting-changed", {
      detail: { enableAudio: enableAudio }
    }));
  }

  editTime(event) {
    const target = event.target;
    target.contentEditable = "true";
    target.focus();
  }

  saveTime(event) {
    const target = event.target;
    const newTime = target.innerText.trim();

    if (!/^\d{1,2}:\d{2}$/.test(newTime)) {
      alert("正しい時間形式（MM:SS）で入力してください！");
      this.loadSettings();
      return;
    }

    target.contentEditable = "false";

    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings[target.dataset.settingsTarget] = newTime;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    window.dispatchEvent(new Event("settings:updated"));
  }

  handleEnter(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      event.target.blur();
    }
  }

  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playSwichSound();
    }
  }
}
