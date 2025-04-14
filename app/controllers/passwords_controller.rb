class PasswordsController < Devise::PasswordsController
  def update
    super do |resource|
      if resource.errors.any? # もしエラーがあれば
        flash[:alert] = I18n.t("devise.passwords.edit.failure") # カスタムメッセージを設定
      end
    end
  end
end
