import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu", "overlay"];

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
    const menu = this.menuTarget;

    // サイドメニューをスライド表示（translate-x-full → translate-x-0）
    menu.classList.toggle("-translate-x-full");  // メニューを画面外にスライド
    menu.classList.toggle("translate-x-0");      // メニューをスライドイン
    this.overlayTarget.classList.toggle("hidden");  // オーバーレイの表示/非表示
    this.playSwichSound();
  }

  close() {
    this.menuTarget.classList.add("-translate-x-full");  // メニューを非表示（スライドアウト）
    this.menuTarget.classList.remove("translate-x-0");  // メニューを非表示（スライドアウト）
    this.overlayTarget.classList.add("hidden");  // オーバーレイを非表示
  }

  playSwichSound() {
    const gameTimerController = this.application.controllers.find(controller => controller.identifier === 'game_timer');
    if (gameTimerController) {
      gameTimerController.playSwichSound();
    }
  }
}
