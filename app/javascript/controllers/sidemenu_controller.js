import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menu"];

  toggle() {
    this.menuTarget.classList.toggle("hidden");
    this.menuTarget.classList.toggle("-translate-x-full");
  }

  close() {
    this.menuTarget.classList.toggle("hidden");
    this.menuTarget.classList.toggle("-translate-x-full");
  }
}
