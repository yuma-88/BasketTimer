import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu", "overlay"]; // スライド開閉・背景黒

  connect() {
    this.boundHandleKeydown = this.handleKeydown.bind(this);
    // 最初に画面外に追い出し・透明・操作不可
    this.menuTarget.classList.add("-translate-x-full", "opacity-0", "pointer-events-none");
    this.menuTarget.classList.remove("translate-x-0");
    // オーバーレイ非表示
    this.overlayTarget.classList.add("hidden");
    // Mキーで開閉
    document.addEventListener("keydown", this.boundHandleKeydown);
  }

  disconnect() {
    document.removeEventListener("keydown", this.boundHandleKeydown);
  }

  handleKeydown(event) {
    if (event.key === "m" || event.key === "M") {
      this.toggle();
    }
  }

  toggle() {
    const isHidden = this.menuTarget.classList.contains("-translate-x-full");
    isHidden ? this.showMenu() : this.hideMenu();
    this.playSwichSound();
  }

  showMenu() {
    // 画面外を外す
    this.menuTarget.classList.remove("opacity-0", "pointer-events-none", "-translate-x-full");
    this.menuTarget.classList.add("translate-x-0"); // スライドイン
    this.overlayTarget.classList.remove("hidden");
  }

  hideMenu() {
    // スライドアウトを開始（アニメーション）
    this.menuTarget.classList.add("-translate-x-full"); // スライドアウト
    this.menuTarget.classList.remove("translate-x-0");

    this.overlayTarget.classList.add("hidden");

    // アニメーション完了後に完全に非表示化
    this.menuTarget.addEventListener("transitionend", this.onHideTransitionEnd, { once: true });
  }

  // アニメが終了した後に発火。透明・操作不可
  onHideTransitionEnd = () => {
    this.menuTarget.classList.add("opacity-0", "pointer-events-none");
  }

  // オーバーレイをクリックした際に閉じる
  close() {
    this.hideMenu();
    this.playSwichSound();
  }

  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playSwichSound();
    }
  }
}
