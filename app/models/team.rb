class Team < ApplicationRecord
  has_many :home_game_records, class_name: 'GameRecord', foreign_key: 'home_team_id'
  has_many :away_game_records, class_name: 'GameRecord', foreign_key: 'away_team_id'
end
