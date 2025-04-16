class ApplicationController < ActionController::Base
  # Only allow modern browsers supporting webp images, web push, badges, import maps, CSS nesting, and CSS :has.
  allow_browser versions: :modern
  before_action :configure_permitted_parameters, if: :devise_controller?

  def after_sign_up_path_for(resource)
    game_records_path
  end

  def after_sign_in_path_for(resource)
    game_records_path # ログイン後に試合記録一覧ページへ遷移
  end

  def after_sign_out_path_for(resource_or_scope)
    menus_path
  end

  protected

  def configure_permitted_parameters
    # /users/sign_up
    devise_parameter_sanitizer.permit(:sign_up, keys: [ :username, :email ])
    devise_parameter_sanitizer.permit(:sign_in, keys: [ :login ])
  end
end
