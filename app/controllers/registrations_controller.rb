class RegistrationsController < Devise::RegistrationsController
  def create
    super do |resource|
      if resource.errors.any? # もしエラーがあれば
        flash[:alert] = I18n.t("devise.registrations.failure") # カスタムメッセージを設定
      end
    end
  end
end
