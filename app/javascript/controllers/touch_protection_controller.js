import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // 右クリックメニュー（長押し含む）を無効化
    document.addEventListener("contextmenu", this.preventContextMenu)

    // iOSの共有メニューや選択防止（CSSで対応）
    this.injectCSS()
  }

  disconnect() {
    document.removeEventListener("contextmenu", this.preventContextMenu)
  }

  preventContextMenu(event) {
    event.preventDefault()
  }

  injectCSS() {
    const style = document.createElement("style")
    style.textContent = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
      }

      img {
        -webkit-user-drag: none !important;
        pointer-events: none;
      }
    `
    document.head.appendChild(style)
  }
}
