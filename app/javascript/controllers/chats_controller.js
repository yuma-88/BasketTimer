import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "responseBox"]

  connect() {
    console.log("Chat controller connected")
  }

  async sendMessage(event) {
    event.preventDefault()

    const prompt = this.inputTarget.value
    if (!prompt) return

    this.inputTarget.value = ''

    // ユーザーのメッセージを表示
    this.addMessage('user', prompt)

    // 「考え中...」を一時的に表示
    const botMessageEl = this.addMessage('bot', '考え中...')

    const roleBasedPrompt = `あなたは優秀なバスケットボールコーチです。以下の質問にコーチとして簡潔に答えてください： ${prompt}`

    try {
      const res = await fetch("/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": document.querySelector("meta[name=csrf-token]").content,
        },
        body: JSON.stringify({ prompt: roleBasedPrompt })
      })

      const data = await res.json()
      const responseText = data.response || "エラーが発生しました"

      // 「考え中...」を消してタイピングアニメーションで返答表示
      botMessageEl.textContent = ''
      this.typeText(botMessageEl, responseText)
    } catch (error) {
      botMessageEl.textContent = "エラーが発生しました"
      console.error("APIエラー:", error)
    }
  }

  addMessage(sender, message) {
    const messageDiv = document.createElement("div")
    messageDiv.classList.add("flex", "flex-col", "space-y-2")

    const messageContent = document.createElement("div")
    messageContent.classList.add(sender === 'user' ? "bg-zinc-100" : "bg-orange-500")
    messageContent.classList.add(sender === 'user' ? "text-zinc-700" : "text-white")
    messageContent.classList.add("p-3", "mb-3", "rounded-lg", "max-w-[70%]")

    if (sender === 'user') {
      messageContent.classList.add("self-end")
    }

    messageContent.textContent = message
    messageDiv.appendChild(messageContent)
    this.responseBoxTarget.appendChild(messageDiv)

    return messageContent
  }

  typeText(element, text, speed = 30) {
    let index = 0
    const interval = setInterval(() => {
      element.textContent += text[index]
      index++
      this.responseBoxTarget.scrollTop = this.responseBoxTarget.scrollHeight

      if (index >= text.length) {
        clearInterval(interval)
      }
    }, speed)
  }
}
