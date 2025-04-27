class ChatsController < ApplicationController
  def index
    # GETリクエストに対してビューを返す
  end

  def create
    prompt = params[:prompt]  # フォームから送られるメッセージ
    service = GeminiChatService.new
    response = service.chat(prompt)  # GeminiChatServiceでAPIを呼び出してレスポンスを取得

    render json: { response: response }  # JSON形式で応答を返す
  end
end
