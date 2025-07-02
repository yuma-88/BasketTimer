import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["teamAScore", "teamBScore"]
  static values = { selectedTeam: String }

  connect() {
    this.loadSettings()
    this.loadScores();

    this.updateScoreColors()
    this.selectedTeamValue = "A"

    if (window.matchMedia("(min-width: 640px)").matches) {
      this.updateSelection()
    }

    document.addEventListener("keydown", this.handleKeydownBind = this.handleKeydown.bind(this))
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydownBind)
  }

  loadSettings() {
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {}
    this.teamIdentification = savedSettings.teamIdenfication ?? false
  }

  loadScores() {
    const stored = JSON.parse(sessionStorage.getItem("scoreData"));
    if (stored) {
      this.teamAScoreValue = stored.teamAScore;
      this.teamBScoreValue = stored.teamBScore;
    } else {
      this.teamAScoreValue = this.parseScore("teamAScore");
      this.teamBScoreValue = this.parseScore("teamBScore");
    }

    this.updateScore("teamAScore", this.teamAScoreValue);
    this.updateScore("teamBScore", this.teamBScoreValue);
  }

  saveScores() {
    const data = {
      teamAScore: this.teamAScoreValue,
      teamBScore: this.teamBScoreValue
    };
    sessionStorage.setItem("scoreData", JSON.stringify(data));
  }

  parseScore(targetName) {
    const el = this[`${targetName}Targets`][0]
    return parseInt(el?.textContent) || 0
  }

  handleKeydown(event) {
    switch (event.key) {
      case "ArrowLeft":
      case "ArrowRight":
        this.toggleSelectedTeam()
        break
      case "ArrowUp":
        this.increaseScore()
        break
      case "ArrowDown":
        this.decreaseScore()
        break
      case "s":
      case "S":
        this.resetScores()
        break
      case "c":
      case "C":
        this.swapScores()
        break
    }
  }

  toggleSelectedTeam() {
    this.selectedTeamValue = this.selectedTeamValue === "A" ? "B" : "A"
    this.updateSelection()
  }

  updateSelection() {
    const isDesktop = window.matchMedia("(hover: hover)").matches
    if (!isDesktop) return

    this.teamAScoreTargets.forEach(el =>
      el.classList.toggle("border-b-2", this.selectedTeamValue === "A")
    )
    this.teamBScoreTargets.forEach(el =>
      el.classList.toggle("border-b-2", this.selectedTeamValue === "B")
    )

    this.teamAScoreTargets.forEach(el =>
      el.classList.toggle("border-red-800", this.selectedTeamValue === "A")
    )
    this.teamBScoreTargets.forEach(el =>
      el.classList.toggle("border-red-800", this.selectedTeamValue === "B")
    )
  }

  updateScoreColors() {
    if (!this.teamIdentification) return

    this.teamAScoreTargets.forEach(el => el.classList.add("!text-white"))
    this.teamBScoreTargets.forEach(el => el.classList.add("!text-blue-500"))
  }

  updateScore(targetName, value) {
    this[`${targetName}Targets`].forEach(el => {
      el.textContent = value
    })
  }

  increaseTeamAScore() {
    this.teamAScoreValue++
    this.updateScore("teamAScore", this.teamAScoreValue)
    this.saveScores();
    this.playSwichSound()
  }

  decreaseTeamAScore() {
    if (this.teamAScoreValue > 0) {
      this.teamAScoreValue--
      this.updateScore("teamAScore", this.teamAScoreValue)
      this.saveScores();
      this.playSwichSound()
    }
  }

  increaseTeamBScore() {
    this.teamBScoreValue++
    this.updateScore("teamBScore", this.teamBScoreValue)
    this.saveScores();
    this.playSwichSound()
  }

  decreaseTeamBScore() {
    if (this.teamBScoreValue > 0) {
      this.teamBScoreValue--
      this.updateScore("teamBScore", this.teamBScoreValue)
      this.saveScores();
      this.playSwichSound()
    }
  }

  increaseScore() {
    if (this.selectedTeamValue === "A") {
      this.increaseTeamAScore()
    } else {
      this.increaseTeamBScore()
    }
  }

  decreaseScore() {
    if (this.selectedTeamValue === "A") {
      this.decreaseTeamAScore()
    } else {
      this.decreaseTeamBScore()
    }
  }

  swapScores() {
    [this.teamAScoreValue, this.teamBScoreValue] = [this.teamBScoreValue, this.teamAScoreValue]

    this.updateScore("teamAScore", this.teamAScoreValue)
    this.updateScore("teamBScore", this.teamBScoreValue)

    if (this.teamIdentification) {
      this.swapScoreColors()
    }

    this.saveScores();
    this.playSwichSound()
  }

  swapScoreColors() {
    const aIsBlue = this.teamAScoreTargets[0]?.classList.contains("!text-blue-500")

    this.teamAScoreTargets.forEach(el => {
      el.classList.toggle("!text-white", aIsBlue)
      el.classList.toggle("!text-blue-500", !aIsBlue)
    })

    this.teamBScoreTargets.forEach(el => {
      el.classList.toggle("!text-white", !aIsBlue)
      el.classList.toggle("!text-blue-500", aIsBlue)
    })
  }

  resetScores() {
    this.teamAScoreValue = 0
    this.teamBScoreValue = 0
    this.updateScore("teamAScore", 0)
    this.updateScore("teamBScore", 0)
    this.saveScores();
    this.playSwichSound()
  }

  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === "audio")
    if (audioController) {
      audioController.playSwichSound()
    }
  }
}
