import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["teamAScore", "teamBScore"]

  connect() {
    this.teamAScoreValue = parseInt(this.teamAScoreTarget.textContent) || 0
    this.teamBScoreValue = parseInt(this.teamBScoreTarget.textContent) || 0
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown.bind(this)); // キーボードイベントのリスナーを削除
  }

  // キーボードのキーを監視
  handleKeydown(event) {
    if (event.key === "s" || event.key === "S") {
      this.resetScores();
    }

    if (event.key === "c" || event.key === "C") {
      this.swapScores();
    }
  }

  increaseTeamAScore() {
    this.teamAScoreValue++
    this.updateScore("teamAScore", this.teamAScoreValue)
    this.playClickSound();
  }

  decreaseTeamAScore() {
    if (this.teamAScoreValue > 0) {
      this.teamAScoreValue--
      this.updateScore("teamAScore", this.teamAScoreValue)
      this.playClickSound();
    }
  }

  increaseTeamBScore() {
    this.teamBScoreValue++
    this.updateScore("teamBScore", this.teamBScoreValue)
    this.playClickSound();
  }

  decreaseTeamBScore() {
    if (this.teamBScoreValue > 0) {
      this.teamBScoreValue--
      this.updateScore("teamBScore", this.teamBScoreValue)
      this.playClickSound();
    }
  }

  updateScore(target, value) {
    this[target + "Target"].textContent = value
  }

  swapScores() {
    const temp = this.teamAScoreValue;
    this.teamAScoreValue = this.teamBScoreValue;
    this.teamBScoreValue = temp;

    this.updateScore("teamAScore", this.teamAScoreValue);
    this.updateScore("teamBScore", this.teamBScoreValue);
    this.playClickSound();
  }

  resetScores() {
    this.teamAScoreValue = 0
    this.teamBScoreValue = 0
    this.updateScore("teamAScore", this.teamAScoreValue)
    this.updateScore("teamBScore", this.teamBScoreValue)
    this.playClickSound();
  }

  playClickSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playClickSound();
    }
  }
}
