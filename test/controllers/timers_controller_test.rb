require "test_helper"

class TimersControllerTest < ActionDispatch::IntegrationTest
  test "should get show" do
    get timers_show_url
    assert_response :success
  end
end
