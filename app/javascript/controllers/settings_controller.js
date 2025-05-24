import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "mainTime", "breakTime", "halfTime",
    "endless", "showMainTimer", "showScore",
    "show24Timer", "sync24Timer", "enableAudio",
    "countdownVoice", "memberChangeVoice", "teamIdenfication"
  ];

  connect() {
    this.initializeTimeSelectors();
    this.loadSettings();
    this.updateAudioSettings();
  }

  initializeTimeSelectors() {
    const targets = [this.mainTimeTarget, this.breakTimeTarget, this.halfTimeTarget];

    targets.forEach(target => {
      const minutesSelect = target.querySelector(".minutes-select");
      const secondsSelect = target.querySelector(".seconds-select");

      if (!minutesSelect || !secondsSelect) return;

      minutesSelect.innerHTML = "";
      secondsSelect.innerHTML = "";

      for (let i = 0; i <= 30; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i.toString().padStart(2, "0");
        minutesSelect.appendChild(option);
      }

      for (let i = 0; i < 60; i++) {
        const option = document.createElement("option");
        option.value = i.toString().padStart(2, "0");
        option.textContent = i.toString().padStart(2, "0");
        secondsSelect.appendChild(option);
      }
    });
  }

  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    const applyTime = (target, key, fallback = "10:00") => {
      const time = savedSettings[key] || fallback;
      const [min, sec] = time.split(":");

      const minSelect = target.querySelector(".minutes-select");
      const secSelect = target.querySelector(".seconds-select");

      if (minSelect && secSelect) {
        minSelect.value = parseInt(min).toString();
        secSelect.value = parseInt(sec).toString().padStart(2, "0");
      }
    };

    applyTime(this.mainTimeTarget, "mainTime", "10:00");
    applyTime(this.breakTimeTarget, "breakTime", "1:00");
    applyTime(this.halfTimeTarget, "halfTime", "15:00");

    // enableAudioは保存値 or 初期true
    const enableAudio = savedSettings.enableAudio ?? true;
    this.enableAudioTarget.checked = enableAudio;

    // countdownVoiceはenableAudioがONなら保存値 or true、OFFならfalse
    this.countdownVoiceTarget.checked = enableAudio
      ? (savedSettings.countdownVoice ?? true)
      : false;

    // memberChangeVoiceはenableAudioがONなら保存値 or false、OFFならfalse
    this.memberChangeVoiceTarget.checked = enableAudio
      ? (savedSettings.memberChangeVoice ?? false)
      : false;

    // disabled設定もenableAudioに合わせる
    this.countdownVoiceTarget.disabled = !enableAudio;
    this.memberChangeVoiceTarget.disabled = !enableAudio;

    // その他の設定
    this.endlessTarget.checked = savedSettings.endless ?? false;
    this.sync24TimerTarget.checked = savedSettings.sync24Timer ?? false;
    this.teamIdenficationTarget.checked = savedSettings.teamIdenfication ?? false;
  }

  saveTime(event) {
    const wrapper = event.target.closest("[data-settings-target]");
    const key = wrapper.dataset.settingsTargetKey;

    const min = wrapper.querySelector(".minutes-select")?.value || "0";
    const sec = wrapper.querySelector(".seconds-select")?.value || "00";

    const time = `${parseInt(min)}:${sec.padStart(2, "0")}`;

    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings[key] = time;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    window.dispatchEvent(new Event("settings:updated"));
  }

  saveSettings(event) {
    const target = event.target;
    const settingName = target.dataset.settingsTarget;
    const settingValue = target.checked;

    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings[settingName] = settingValue;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    window.dispatchEvent(new Event("settings:updated"));

    if (settingName === "enableAudio") {
      this.handleEnableAudioChange(settingValue);
    }
  }

  handleEnableAudioChange(enableAudio) {
    if (enableAudio && !this.countdownVoiceTarget.checked) {
      this.countdownVoiceTarget.checked = true; // enableAudioがONならcountdownもONに強制
    }
    if (!enableAudio) {
      this.countdownVoiceTarget.checked = false;
      this.memberChangeVoiceTarget.checked = false;
    }

    this.countdownVoiceTarget.disabled = !enableAudio;
    this.memberChangeVoiceTarget.disabled = !enableAudio;

    // 設定を保存
    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    settings.enableAudio = enableAudio;
    settings.countdownVoice = this.countdownVoiceTarget.checked;
    settings.memberChangeVoice = this.memberChangeVoiceTarget.checked;
    sessionStorage.setItem("gameSettings", JSON.stringify(settings));

    // 設定変更イベントを通知
    window.dispatchEvent(new CustomEvent("audio:setting-changed", {
      detail: {
        enableAudio,
        countdownVoice: this.countdownVoiceTarget.checked,
        memberChangeVoice: this.memberChangeVoiceTarget.checked,
      }
    }));
  }

  updateAudioSettings() {
    const enableAudio = this.enableAudioTarget.checked;
    this.countdownVoiceTarget.disabled = !enableAudio;
    this.memberChangeVoiceTarget.disabled = !enableAudio;
  }

  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playSwichSound();
    }
  }
}
