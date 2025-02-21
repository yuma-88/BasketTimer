require "test_helper"

class TimersControllerTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      email: "test_#{SecureRandom.uuid}@example.com",
      password: "password",
      password_confirmation: "password"
    )
  end

  test "should get show" do
    get timers_show_url
    assert_response :success
  end
end
