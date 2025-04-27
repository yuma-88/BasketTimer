class GeminiChatService
  include HTTParty
  base_uri "https://generativelanguage.googleapis.com/v1beta"

  def initialize
    @api_key = Rails.application.credentials.dig(:gemini, :api_key)
  end

  def chat(prompt)
    body = {
      model: "models/gemini-1.5-flash",  # 確認した無料版のモデルを指定
      contents: [ { parts: [ { text: prompt } ] } ]
    }

    Rails.logger.debug "Sending request to Gemini API with body: #{body.to_json}"

    # Gemini APIリクエストを送信
    response = self.class.post("/models/gemini-1.5-flash:generateContent?key=#{@api_key}",
                               headers: { "Content-Type" => "application/json" },
                               body: body.to_json)

    Rails.logger.debug "Received response: #{response.body}"

    if response.success?
      parsed = JSON.parse(response.body)
      response_text = parsed.dig("candidates", 0, "content", "parts", 0, "text") || "No response"
    else
      response_text = "Error: Could not get a response from the API."
    end

    response_text
  end
end
