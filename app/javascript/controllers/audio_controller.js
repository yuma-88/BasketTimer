import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [];

  connect() {
    this.initializeAudio();
    this.loadAudioSettings();

    document.addEventListener("keydown", this.handleKeydown.bind(this));
    document.addEventListener("keyup", this.handleKeyup.bind(this));

    // カスタムイベントでリアルタイム切り替えを受け取る
    window.addEventListener("audio:setting-changed", this.handleAudioSettingChanged.bind(this));
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown.bind(this));
    document.removeEventListener("keyup", this.handleKeyup.bind(this));
    window.removeEventListener("audio:setting-changed", this.handleAudioSettingChanged.bind(this));
  }

  initializeAudio() {
    this.endSound = new Audio("/sounds/end.mp3");
    this.buzzerSound = new Audio("/sounds/buzzer.mp3");
    this.memberChangeSound = new Audio("/sounds/member_change.mp3");
    this.clickSound = new Audio("/sounds/toggle.mp3");
    this.swichSound = new Audio("/sounds/swich.mp3");

    this.countdownSounds = {
      60: new Audio("/sounds/countdown_60.mp3"),
      30: new Audio("/sounds/countdown_30.mp3"),
      15: new Audio("/sounds/countdown_15.mp3"),
      10: new Audio("/sounds/countdown_10.mp3"),
      9: new Audio("/sounds/countdown_9.mp3"),
      8: new Audio("/sounds/countdown_8.mp3"),
      7: new Audio("/sounds/countdown_7.mp3"),
      6: new Audio("/sounds/countdown_6.mp3"),
      5: new Audio("/sounds/countdown_5.mp3"),
      4: new Audio("/sounds/countdown_4.mp3"),
      3: new Audio("/sounds/countdown_3.mp3"),
      2: new Audio("/sounds/countdown_2.mp3"),
      1: new Audio("/sounds/countdown_1.mp3"),
    };
  }

  loadAudioSettings() {
    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    const enableAudio = settings.enableAudio ?? true;
    const countdownVoice = settings.countdownVoice ?? true;

    if (!enableAudio) {
      this.disableAudio();
    }

    if (!countdownVoice) {
      this.disableCountdownVoice();
    }
  }

  stopAllSounds() {
    this.playingAudios.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.playingAudios = [];
  }

  handleAudioSettingChanged(event) {
    const { enableAudio } = event.detail;

    if (enableAudio) {
      this.initializeAudio();
    } else {
      this.disableAudio();
    }
  }

  disableAudio() {
    this.endSound = null;
    this.memberChangeSound = null;
    this.clickSound = null;
    this.swichSound = null;
    this.countdownSounds = {};
  }

  disableCountdownVoice() {
    this.countdownSounds = {};
  }

  handleKeydown(event) {
    if (event.key === " ") {
      this.playBuzzerSound();
    }
  }

  handleKeyup(event) {
    if (event.key === " ") {
      this.stopBuzzerSound();
    }
  }

  playSwichSound() {
    if (this.swichSound) {
      const s = new Audio("/sounds/swich.mp3");
      s.volume = 0.3;
      s.play();
    }
  }

  playToggleSound() {
    if (this.clickSound) {
      const t = new Audio("/sounds/toggle.mp3");
      t.volume = 0.3;
      t.play();
    }
  }

  playBuzzerSound() {
    this.buzzerSound.loop = true; // ループ再生を設定
    if (this.buzzerSound.paused) {
      this.buzzerSound.play();
    }
  }

  stopBuzzerSound() {
    if (this.buzzerSound && !this.buzzerSound.paused) {
      this.buzzerSound.pause();
      this.buzzerSound.currentTime = 0;
    }
  }

  playMemberChangeBuzzerSound() {
    if (this.buzzerSound) {
      this.buzzerSound.play();
    }
  }

  playEndSound() {
    if (this.endSound) {
      this.endSound.play();
    }
  }

  playCountdownSound(seconds) {
    const sound = this.countdownSounds[seconds];
    if (sound) {
      sound.play();
    }
  }

  playMemberChangeSound() {
    if (this.memberChangeSound) {
      this.memberChangeSound.play();
    }
  }
}
