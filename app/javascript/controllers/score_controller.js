import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["teamAScore", "teamBScore"]
  static values = { selectedTeam: String }

  connect() {
    this.loadSettings();
    this.updateScoreColors(); // 初期状態でスコアの色を変更
    this.teamAScoreValue = parseInt(this.teamAScoreTarget.textContent) || 0
    this.teamBScoreValue = parseInt(this.teamBScoreTarget.textContent) || 0
    this.selectedTeamValue = "A"; // 初期選択はチームA
    this.updateSelection(); // 初期選択状態を更新
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown.bind(this));
  }

  loadSettings() {
    // sessionStorage から設定を読み込む
    const savedSettings = JSON.parse(sessionStorage.getItem("gameSettings")) || {};

    // teamIdenfication 設定を読み込み
    this.teamIdentification = savedSettings.teamIdenfication ?? false;
  }

  // キーボード操作でチームを選択
  handleKeydown(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      this.toggleSelectedTeam();
    } else if (event.key === "ArrowUp") {
      this.increaseScore();
    } else if (event.key === "ArrowDown") {
      this.decreaseScore();
    }

    if (event.key === "s" || event.key === "S") {
      this.resetScores();
    }

    if (event.key === "c" || event.key === "C") {
      this.swapScores();
    }
  }

  // チーム選択を切り替える
  toggleSelectedTeam() {
    if (this.selectedTeamValue === "A") {
      this.selectedTeamValue = "B";
    } else {
      this.selectedTeamValue = "A";
    }
    this.updateSelection();
  }

  // チーム選択状態を強調表示
  updateSelection() {
    if (!this.teamAScoreTarget || !this.teamBScoreTarget) {
      return;
    }

    // Tailwindで条件付きクラスの切り替え
    if (this.selectedTeamValue === "A") {
      this.teamAScoreTarget.classList.add("border-b-2", "border-red-800");
      this.teamBScoreTarget.classList.remove("border-b-2", "border-red-800");
    } else {
      this.teamBScoreTarget.classList.add("border-b-2", "border-red-800");
      this.teamAScoreTarget.classList.remove("border-b-2", "border-red-800");
    }
  }

  updateScoreColors() {
    if (!this.teamAScoreTarget || !this.teamBScoreTarget) {
        return;
    }

    // teamIdentification がオンの場合、スコアAを白、スコアBを青に設定
    if (this.teamIdentification) {
      this.teamAScoreTarget.classList.add("!text-white");
      this.teamBScoreTarget.classList.add("!text-blue-500");
    }
  }

  increaseTeamAScore() {
    this.teamAScoreValue++
    this.updateScore("teamAScore", this.teamAScoreValue)
    this.playSwichSound();
  }

  decreaseTeamAScore() {
    if (this.teamAScoreValue > 0) {
      this.teamAScoreValue--
      this.updateScore("teamAScore", this.teamAScoreValue)
      this.playSwichSound();
    }
  }

  increaseTeamBScore() {
    this.teamBScoreValue++
    this.updateScore("teamBScore", this.teamBScoreValue)
    this.playSwichSound();
  }

  decreaseTeamBScore() {
    if (this.teamBScoreValue > 0) {
      this.teamBScoreValue--
      this.updateScore("teamBScore", this.teamBScoreValue)
      this.playSwichSound();
    }
  }

  // スコアの増加
  increaseScore() {
    if (this.selectedTeamValue === "A") {
      this.teamAScoreValue++;
      this.updateScore("teamAScore", this.teamAScoreValue);
    } else {
      this.teamBScoreValue++;
      this.updateScore("teamBScore", this.teamBScoreValue);
    }
    this.playSwichSound();
  }

  // スコアの減少
  decreaseScore() {
    if (this.selectedTeamValue === "A" && this.teamAScoreValue > 0) {
      this.teamAScoreValue--;
      this.updateScore("teamAScore", this.teamAScoreValue);
    } else if (this.selectedTeamValue === "B" && this.teamBScoreValue > 0) {
      this.teamBScoreValue--;
      this.updateScore("teamBScore", this.teamBScoreValue);
    }
    this.playSwichSound();
  }

  // スコアの更新
  updateScore(target, value) {
    this[target + "Target"].textContent = value;
  }

  // チームスコアの交換
  swapScores() {
    const temp = this.teamAScoreValue;
    this.teamAScoreValue = this.teamBScoreValue;
    this.teamBScoreValue = temp;

    this.updateScore("teamAScore", this.teamAScoreValue);
    this.updateScore("teamBScore", this.teamBScoreValue);

    // teamIdentification がオンの場合、色も交換
    if (this.teamIdentification) {
      // スコアAとスコアBの色を入れ替え
      if (this.teamAScoreTarget.classList.contains("!text-blue-500")) {
        // スコアAが青色であれば、スコアAを白に、スコアBを青色に
        this.teamAScoreTarget.classList.remove("!text-blue-500");
        this.teamAScoreTarget.classList.add("!text-white");
        this.teamBScoreTarget.classList.remove("!text-white");
        this.teamBScoreTarget.classList.add("!text-blue-500");
      } else {
        // それ以外（スコアAが白）なら逆にする
        this.teamAScoreTarget.classList.remove("!text-white");
        this.teamAScoreTarget.classList.add("!text-blue-500");
        this.teamBScoreTarget.classList.remove("!text-blue-500");
        this.teamBScoreTarget.classList.add("!text-white");
      }
    }

    this.playSwichSound();
  }

  // スコアリセット
  resetScores() {
    this.teamAScoreValue = 0;
    this.teamBScoreValue = 0;
    this.updateScore("teamAScore", this.teamAScoreValue);
    this.updateScore("teamBScore", this.teamBScoreValue);
    this.playSwichSound();
  }

  // サウンド再生
  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playSwichSound();
    }
  }
}
