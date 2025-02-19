class CreateGameRecords < ActiveRecord::Migration[7.2]
  def change
    create_table :game_records do |t|
      t.references :user, foreign_key: true
      t.references :home_team, foreign_key: { to_table: :teams }
      t.references :away_team, foreign_key: { to_table: :teams }
      t.string :game_type
      t.integer :score_home_team
      t.integer :score_away_team
      t.datetime :date
      t.text :description

      t.timestamps
    end
  end
end
