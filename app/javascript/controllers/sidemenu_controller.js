import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu", "overlay"];

  connect() {
    this.hideMenu();
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
    const menu = this.menuTarget;
    const overlay = this.overlayTarget;
  
    const isHidden = menu.classList.contains("-translate-x-full");
  
    if (isHidden) {
      this.showMenu();
    } else {
      this.hideMenu();
    }
  
    this.playSwichSound();
  }
  
  showMenu() {
    this.menuTarget.classList.remove("-translate-x-full", "opacity-0", "pointer-events-none");
    this.menuTarget.classList.add("translate-x-0");
    this.overlayTarget.classList.remove("hidden");
  }
  
  hideMenu() {
    this.menuTarget.classList.add("-translate-x-full", "opacity-0", "pointer-events-none");
    this.menuTarget.classList.remove("translate-x-0");
    this.overlayTarget.classList.add("hidden");
  }
  
  close() {
    this.hideMenu();
  }

  playSwichSound() {
    const gameTimerController = this.application.controllers.find(controller => controller.identifier === 'game_timer');
    if (gameTimerController) {
      gameTimerController.playSwichSound();
    }
  }
}
