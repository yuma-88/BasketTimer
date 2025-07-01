import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [];

  connect() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.audioBuffers = {}; // 再生のために一時的にメモリ上に読み込まれた音声データの格納
    this.loopingSources = {}; // ループ再生中のソースを追跡
    this.loadAudioSettings(); //

    this.boundAudioSettingChanged = this.handleAudioSettingChanged.bind(this);
    this.boundUserInteraction = this.unlockAudioContext.bind(this);

    window.addEventListener("audio:setting-changed", this.boundAudioSettingChanged);
    document.addEventListener("touchstart", this.boundUserInteraction);
    document.addEventListener("mousedown", this.boundUserInteraction);

    this.initializeAudio(); // 音声読み込みは最後
  }

  disconnect() {
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

    // カウントダウン音声の秒数だけ明示的に指定
    const countdownSeconds = [60, 30, 15, ...Array.from({ length: 10 }, (_, i) => 10 - i)];

    for (const sec of countdownSeconds) {
      soundFiles[`countdown_${sec}`] = `/sounds/countdown_${sec}.mp3`;
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
    if (options.volume !== undefined) {
      gainNode.gain.value = options.volume;
    } else if (name === "swich" || name === "toggle") {
      gainNode.gain.value = 0.5; // 小さめ
    } else {
      gainNode.gain.value = 2.0; // 大きめ（デフォルト）
    }

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

  navigateWithSound(event) {
    event.preventDefault();

    const anchor = event.target.closest('a');
    if (!anchor) {
      console.error("リンクタグが見つかりません");
      return;
    }

    const href = anchor.getAttribute("href");
    if (!href || href === "#") {
      console.error("無効なリンク先です:", href);
      return;
    }

    this.playSwichSound();

    setTimeout(() => {
      window.location.href = href;
    },80);
  }

  playToggleSound() {
    this.playSound("toggle");
  }

  playSwichSound() {
    this.playSound("swich");
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

    const soundName = `countdown_${seconds}`;

    // 同じ秒数を連続で再生しない
    if (this.lastCountdownPlayed === soundName) return;
    this.lastCountdownPlayed = soundName;

    this.playSound(soundName);
  }
}
