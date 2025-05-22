import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    // iOSの共有メニューや選択防止（CSSで対応）
    this.injectCSS()

    // タップイベントのリスナーを追加
    this.lastTap = 0; // 最後のタップ時間を記録
    this.doubleTapThreshold = 100; // ダブルタップの間隔（ミリ秒）
    document.addEventListener("touchstart", this.handleDoubleTap.bind(this), { passive: false });

    // ピンチズーム（2本指）を防止
    document.addEventListener('gesturestart', this.preventGestureZoom.bind(this), { passive: false });
  }

  disconnect() {
    document.removeEventListener("touchstart", this.handleDoubleTap.bind(this));
    document.removeEventListener('gesturestart', this.preventGestureZoom.bind(this));
  }

  injectCSS() {
    const style = document.createElement("style")
    style.textContent = `
      * {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        user-select: none !important;
        -webkit-tap-highlight-color: rgba(0,0,0,0) !important;
        touch-action: pan-y !important;
      }

      img {
        -webkit-user-drag: none !important;
        pointer-events: none;
      }
    `
    document.head.appendChild(style)
  }

  handleDoubleTap(event) {
    const currentTime = new Date().getTime(); // 現在の時刻（ミリ秒）

    // ダブルタップ間隔内にタップがあれば、ダブルタップとして処理
    if (currentTime - this.lastTap <= this.doubleTapThreshold) {
      this.handleDoubleTapAction();
      event.preventDefault();  // 共有メニューやズームを防ぐためにデフォルトの動作をキャンセル
    }
    
    this.lastTap = currentTime; // 最後のタップ時間を更新
  }

  handleDoubleTapAction() {
    console.log("ダブルタップが検出されました！");
    // ダブルタップ時のアクションをここに追加できます
  }

  preventGestureZoom(event) {
    event.preventDefault();  // ピンチズームを防止
  }
}
