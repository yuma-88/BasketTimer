import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "mainTime", "breakTime", "halfTime",
    "endless", "showMainTimer", "showScore",
    "show24Timer", "sync24Timer", "enableAudio",
    "countdownVoice", "memberChangeVoice"
  ];

  connect() {
    this.loadSettings();
    this.updateAudioSettings();  // 初期状態の音声設定を反映
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown.bind(this));
  }

  // 設定を読み込む
  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    this.mainTimeTarget.textContent = savedSettings.mainTime || "10:00";
    this.breakTimeTarget.textContent = savedSettings.breakTime || "1:00";
    this.halfTimeTarget.textContent = savedSettings.halfTime || "10:00";
    this.endlessTarget.checked = savedSettings.endless ?? false;

    this.sync24TimerTarget.checked = savedSettings.sync24Timer || false;

    this.enableAudioTarget.checked = savedSettings.enableAudio ?? true;
    this.countdownVoiceTarget.checked = savedSettings.countdownVoice ?? true;
    this.memberChangeVoiceTarget.checked = savedSettings.memberChangeVoice ?? false;
  }

  // 音声設定を更新する
  updateAudioSettings() {
    const enableAudio = this.enableAudioTarget.checked;
  
    // `enableAudio` がオフの場合、音声関連の設定もオフにし、無効にする
    if (!enableAudio) {
      this.countdownVoiceTarget.checked = false;  // カウントダウン音声をオフ
      this.memberChangeVoiceTarget.checked = false;  // メンバーチェンジ音声をオフ
      this.countdownVoiceTarget.disabled = true;  // カウントダウン音声のチェックボックスを無効にする
      this.memberChangeVoiceTarget.disabled = true;  // メンバーチェンジ音声のチェックボックスを無効にする
  
      // 設定をsessionStorageに保存（音声設定を無効化）
      const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
      settings["enableAudio"] = false;
      settings["countdownVoice"] = false;
      settings["memberChangeVoice"] = false;
      sessionStorage.setItem("gameSettings", JSON.stringify(settings));
    } else {
      this.countdownVoiceTarget.disabled = false;  // カウントダウン音声のチェックボックスを有効にする
      this.memberChangeVoiceTarget.disabled = false;  // メンバーチェンジ音声のチェックボックスを有効にする
  
      // `enableAudio` がオンの場合、セッションストレージで音声設定をオンにする
      const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
      settings["enableAudio"] = true;
      sessionStorage.setItem("gameSettings", JSON.stringify(settings));
    }
  }

  // 設定を保存する
  saveSettings(event) {
    const target = event.target;
    const settingName = target.dataset.settingsTarget;
    const settingValue = target.checked;

    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings[settingName] = settingValue;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    // 設定更新イベントを発火
    window.dispatchEvent(new Event("settings:updated"));

    // 音声設定を更新
    if (settingName === "enableAudio") {
      this.updateAudioSettings();  // `enableAudio` が変更された場合は音声設定を再評価
    }
  }

  // Bキーが押されたときに画面遷移する処理
  handleKeydown(event) {
    if (event.key === "b" || event.key === "B") {
      const timersPath = document.getElementById('backButton').dataset.timersPath;
      window.location = timersPath;
    }
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
