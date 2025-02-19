class GameRecord < ApplicationRecord
  belongs_to :user
  belongs_to :home_team, class_name: "Team", foreign_key: "home_team_id", optional: true
  belongs_to :away_team, class_name: "Team", foreign_key: "away_team_id", optional: true

  validates :date, presence: true
  validates :home_team_name, presence: true
  validates :away_team_name, presence: true

  # 仮想的な属性を定義
  attr_accessor :home_team_name, :away_team_name

  # enumでゲームタイプを定義（日本語）
  enum game_type: { 練習: "練習", 交流: "交流", 大会: "大会", 公式: "公式" }

  # 保存前にチームを作成
  before_save :create_teams
  before_save :remove_time_from_date

  private

  def create_teams
    # ホームチームが未設定なら作成
    if home_team.nil?
      self.home_team = Team.find_or_create_by(name: home_team_name)
    end

    # アウェイチームが未設定なら作成
    if away_team.nil?
      self.away_team = Team.find_or_create_by(name: away_team_name)
    end
  end

  def remove_time_from_date
    # 日付フィールドに時間があれば切り捨て
    self.date = date.to_date if date.present?
  end
end
