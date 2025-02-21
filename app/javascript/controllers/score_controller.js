import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["teamAScore", "teamBScore"]

  connect() {
    this.teamAScoreValue = parseInt(this.teamAScoreTarget.textContent) || 0
    this.teamBScoreValue = parseInt(this.teamBScoreTarget.textContent) || 0
  }

  increaseTeamAScore() {
    this.teamAScoreValue++
    this.updateScore("teamAScore", this.teamAScoreValue)
  }

  decreaseTeamAScore() {
    if (this.teamAScoreValue > 0) {
      this.teamAScoreValue--
      this.updateScore("teamAScore", this.teamAScoreValue)
    }
  }

  increaseTeamBScore() {
    this.teamBScoreValue++
    this.updateScore("teamBScore", this.teamBScoreValue)
  }

  decreaseTeamBScore() {
    if (this.teamBScoreValue > 0) {
      this.teamBScoreValue--
      this.updateScore("teamBScore", this.teamBScoreValue)
    }
  }

  updateScore(target, value) {
    this[target + "Target"].textContent = value
  }
}
