import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["overlay", "modalBox"];

  connect() {
    this.overlayTarget.classList.add("hidden", "opacity-0", "transition-opacity", "duration-300");
    this.modalBoxTarget.classList.add("opacity-0", "scale-95", "transition-all", "duration-300");
  }

  open() {
    // 一旦表示してからアニメーション適用
    this.overlayTarget.classList.remove("hidden");
    this.overlayTarget.classList.add("flex"); // flex表示（中央寄せ用）

    requestAnimationFrame(() => {
      this.overlayTarget.classList.remove("opacity-0");
      this.overlayTarget.classList.add("opacity-100");

      this.modalBoxTarget.classList.remove("opacity-0", "scale-95");
      this.modalBoxTarget.classList.add("opacity-100", "scale-100");
    });

    this.playSwichSound();
  }

  close() {
    // アニメーションで非表示に
    this.overlayTarget.classList.remove("opacity-100");
    this.overlayTarget.classList.add("opacity-0");

    this.modalBoxTarget.classList.remove("opacity-100", "scale-100");
    this.modalBoxTarget.classList.add("opacity-0", "scale-95");

    // 完全に非表示にするのはトランジション終了後
    setTimeout(() => {
      this.overlayTarget.classList.remove("flex");
      this.overlayTarget.classList.add("hidden");
    }, 300); // duration-300 に合わせる

    this.playSwichSound();
  }

  playSwichSound() {
    const audioController = this.application.controllers.find(controller => controller.identifier === 'audio');
    if (audioController) {
      audioController.playSwichSound();
    }
  }
}
