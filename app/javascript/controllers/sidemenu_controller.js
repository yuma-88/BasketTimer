import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu"];

  toggle() {
    this.menuTarget.classList.toggle("hidden");
    this.menuTarget.classList.toggle("-translate-x-full");
    this.playClickSound();
  }

  playClickSound() {
    const gameTimerController = this.application.controllers.find(controller => controller.identifier === 'game_timer');
    if (gameTimerController) {
      gameTimerController.playClickSound();
    }
  }
}
