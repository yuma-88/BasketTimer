import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [];

  connect() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioBuffers = {};
    this.loopingSources = {};
    this.loadAudioSettings();

    this.boundKeydown = this.handleKeydown.bind(this);
    this.boundKeyup = this.handleKeyup.bind(this);
    this.boundAudioSettingChanged = this.handleAudioSettingChanged.bind(this);
    this.boundUserInteraction = this.unlockAudioContext.bind(this);

    document.addEventListener("keydown", this.boundKeydown);
    document.addEventListener("keyup", this.boundKeyup);
    window.addEventListener("audio:setting-changed", this.boundAudioSettingChanged);
    document.addEventListener("touchstart", this.boundUserInteraction);
    document.addEventListener("mousedown", this.boundUserInteraction);

    this.initializeAudio(); // 音声読み込みは最後
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundKeydown);
    document.removeEventListener("keyup", this.boundKeyup);
    window.removeEventListener("audio:setting-changed", this.boundAudioSettingChanged);
    document.removeEventListener("touchstart", this.boundUserInteraction);
    document.removeEventListener("mousedown", this.boundUserInteraction);
  }

  async unlockAudioContext() {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
    document.removeEventListener("touchstart", this.boundUserInteraction);
    document.removeEventListener("mousedown", this.boundUserInteraction);
  }

  async initializeAudio() {
    const soundFiles = {
      end: "/sounds/end.mp3",
      buzzer: "/sounds/buzzer.mp3",
      memberChange: "/sounds/member_change.mp3",
      toggle: "/sounds/toggle.mp3",
      swich: "/sounds/swich.mp3",
    };

    for (let i = 60; i >= 1; i--) {
      soundFiles[`countdown_${i}`] = `/sounds/countdown_${i}.mp3`;
    }

    const promises = Object.entries(soundFiles).map(([key, url]) =>
      this.loadAudioBuffer(key, url)
    );

    await Promise.all(promises);
  }

  async loadAudioBuffer(name, url) {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.audioBuffers[name] = audioBuffer;
    } catch (error) {
      console.warn(`Failed to load sound: ${url}`, error);
    }
  }

  loadAudioSettings() {
    const settings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};
    this.enableAudio = settings.enableAudio ?? true;
    this.countdownVoice = settings.countdownVoice ?? true;
    this.memberChangeVoice = settings.memberChangeVoice ?? false;
  }

  handleAudioSettingChanged(event) {
    const { enableAudio, countdownVoice, memberChangeVoice } = event.detail;

    this.enableAudio = enableAudio;
    this.countdownVoice = countdownVoice;
    this.memberChangeVoice = memberChangeVoice;

    if (!enableAudio) {
      this.stopAllSounds();
    } else {
      this.initializeAudio(); // 再読み込み
    }
  }

  playSound(name, options = {}) {
    if (!this.enableAudio) return;

    const buffer = this.audioBuffers[name];
    if (!buffer) return;

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;

    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = options.volume ?? 1.0;

    source.connect(gainNode).connect(this.audioContext.destination);
    source.loop = options.loop ?? false;
    source.start(0);

    if (options.loop) {
      this.loopingSources[name] = source;
    }
  }

  stopSound(name) {
    if (this.loopingSources[name]) {
      try {
        this.loopingSources[name].stop();
      } catch (e) {
        console.error("Failed to stop sound:", name, e);
      }
      delete this.loopingSources[name];
    }
  }

  stopAllSounds() {
    for (const name in this.loopingSources) {
      this.stopSound(name);
    }
  }

  // ========= 操作系メソッド ===========

  playBuzzerSound() {
    if (this.isBuzzerPlaying) return; // 既に鳴っている場合は再度鳴らさない
    this.isBuzzerPlaying = true;  // ブザーが鳴っている状態に設定
    this.playSound("buzzer", { loop: true }); // ループを有効にして、鳴り続けるように
  }

  stopBuzzerSound() {
    if (this.isBuzzerPlaying) {
      this.stopSound("buzzer");  // ブザーを停止
      this.isBuzzerPlaying = false;  // ブザーが止まった状態に設定
    }
  }

  playToggleSound() {
    this.playSound("toggle", { volume: 0.3 });
  }

  playSwichSound() {
    this.playSound("swich", { volume: 0.3 });
  }

  playEndSound() {
    this.playSound("end");
  }

  playMemberChangeSound() {
    if (this.memberChangeVoice) {
      this.playSound("memberChange");
    }
  }

  playMemberChangeBuzzerSound() {
    this.playSound("buzzer");
  }

  playCountdownSound(seconds) {
    if (!this.countdownVoice) return;
    this.playSound(`countdown_${seconds}`);
  }

  // ========= キー操作 ===========

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
}
