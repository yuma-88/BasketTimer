import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["time", "select"];
  static values = { running: Boolean, minutes: Number, seconds: Number };

  connect() {
    this.runningValue = false;
    this.loadSettings();
    this.timer = null;
    this.updateDisplay();

    this.endlessSequence = ["P1", "インターバル", "P2", "ハーフ", "P3", "インターバル", "P4", "ハーフ"];
    this.currentStepIndex = 0;

    this._handleSettingsUpdated = this.loadSettings.bind(this);
    this._handleKeydown = this.handleKeydown.bind(this);
    this._handleKeyup = this.handleKeyup.bind(this);
    this._handleSelectChange = event => this.handleSelectChange(event);

    window.addEventListener("settings:updated", this._handleSettingsUpdated);
    document.addEventListener("keydown", this._handleKeydown);
    document.addEventListener("keyup", this._handleKeyup);
    this.selectTargets.forEach(select =>
      select.addEventListener("change", this._handleSelectChange)
    );
  }

  disconnect() {
    window.removeEventListener("settings:updated", this._handleSettingsUpdated);
    document.removeEventListener("keydown", this._handleKeydown);
    this.selectTargets.forEach(select =>
      select.removeEventListener("change", this._handleSelectChange)
    );

    this.stop();
  }

  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    const mainTime = savedSettings.mainTime || "10:00";
    const breakTime = savedSettings.breakTime || "1:00";
    const halfTime = savedSettings.halfTime || "15:00";

    const [minutes, seconds] = mainTime.split(":").map(Number);
    this.minutesValue = minutes;
    this.secondsValue = seconds;

    this.mainTime = mainTime;
    this.breakTime = breakTime;
    this.halfTime = halfTime;
    this.endless = savedSettings.endless ?? false;

    this.sync24Timer = savedSettings.sync24Timer ?? false;
    this.teamIdentification = savedSettings.teamIdenfication ?? false;
    this.memberChangeVoice = savedSettings.memberChangeVoice ?? false;

    this.updateDisplay();
  }

  get currentSelectValue() {
    return this.selectTargets[0]?.value ?? "P1";
  }

  handleSelectChange(event) {
    const selectedOption = event.target.value;
    this.preventCountdownSound = (selectedOption === "インターバル" || selectedOption === "ハーフ");

    if (selectedOption === "インターバル") {
      [this.minutesValue, this.secondsValue] = this.breakTime.split(":").map(Number);
    } else if (selectedOption === "ハーフ") {
      [this.minutesValue, this.secondsValue] = this.halfTime.split(":").map(Number);
    } else if (["P1", "P2", "P3", "P4"].includes(selectedOption)) {
      [this.minutesValue, this.secondsValue] = this.mainTime.split(":").map(Number);
    }

    this.updateStepIndex(selectedOption);
    this.updateDisplay();
    this.playSwichSound();
  }

  updateStepIndex(value) {
    const currentIndex = this.currentStepIndex;
    const candidates = [];

    this.endlessSequence.forEach((val, i) => {
      if (val === value) {
        const diff = (i - currentIndex + this.endlessSequence.length) % this.endlessSequence.length;
        candidates.push({ index: i, diff });
      }
    });

    if (candidates.length > 0) {
      candidates.sort((a, b) => a.diff - b.diff);
      this.currentStepIndex = candidates[0].index;
    }
  }

  handleKeydown(event) {
    if (event.key === " ") {
      this.playBuzzerSound();
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
      this.selectTargets.forEach(select => {
        select.value = keyToValueMap[event.key];
        this.handleSelectChange({ target: select });
      });
      this.resetTime();
    }
  }

  handleKeyup(event) {
    if (event.key === " ") {
      this.stopBuzzerSound();
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
      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot-clock');
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
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    if (["インターバル", "ハーフ"].includes(this.currentSelectValue)) return;

    if (this.sync24Timer) {
      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot-clock');
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
    this.isResetAll = true;
    this.selectTargets.forEach(select => (select.value = "P1"));
    this.resetTime();

    const shotClockController = this.application.controllers.find(c => c.identifier === 'shot-clock');
    if (shotClockController) shotClockController.reset();

    const scoreController = this.application.controllers.find(c => c.identifier === 'score');
    if (scoreController) scoreController.resetScores();

    this.hasPlayedMemberChange = false;
    this.preventCountdownSound = false;
    this.isResetAll = false;
  }

  countdown() {
    if (this.minutesValue === 0 && this.secondsValue <= 0) {
      this.stop();
      this.playEndSound();

      const shotClockController = this.application.controllers.find(c => c.identifier === 'shot-clock');
      if (shotClockController) shotClockController.reset();

      if (this.endless) {
        this.currentStepIndex = (this.currentStepIndex + 1) % this.endlessSequence.length;
        const nextStep = this.endlessSequence[this.currentStepIndex];

        setTimeout(() => {
          this.selectTargets.forEach(select => (select.value = nextStep));
          this.handleSelectChange({ target: this.selectTargets[0] });

          if (["インターバル", "ハーフ"].includes(nextStep)) {
            this.start();
          }
        }, 2000);
      } else {
        setTimeout(() => {
          this.resetTime();
        }, 2000);
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
      }, 1000);
    }
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
    this.secondsValue = (Math.floor(this.secondsValue) + 1) % 60;
    this.updateDisplay();
    this.playSwichSound();
  }

  decreaseSecond() {
    this.secondsValue = (Math.floor(this.secondsValue) - 1 + 60) % 60;
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

  playMemberChangeSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playMemberChangeSound();
  }

  playMemberChangeBuzzerSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playMemberChangeBuzzerSound();
  }

  playBuzzerSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.playBuzzerSound();
  }

  stopBuzzerSound() {
    const audio = this.application.controllers.find(c => c.identifier === 'audio');
    if (audio) audio.stopBuzzerSound();
  }
}
