import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu"];

  connect() {
    document.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  disconnect() {
    document.removeEventListener("keydown", this.handleKeydown.bind(this)); // キーボードイベントのリスナーを削除
  }

  // キーボードのキーを監視
  handleKeydown(event) {
    if (event.key === "m" || event.key === "M") {
      this.toggle();
    }
  }

  toggle() {
    this.menuTarget.classList.toggle("hidden");
    this.menuTarget.classList.toggle("-translate-x-full");
    this.playSwichSound();
  }

  playSwichSound() {
    const gameTimerController = this.application.controllers.find(controller => controller.identifier === 'game_timer');
    if (gameTimerController) {
      gameTimerController.playSwichSound();
    }
  }
}
