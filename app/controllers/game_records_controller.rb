class GameRecordsController < ApplicationController
  before_action :set_game_record, only: [ :edit, :update, :show, :destroy ]

  def index
    @game_records = current_user.game_records.includes(:home_team, :away_team).order(date: :desc)
  end

  def new
    @game_record = GameRecord.new
  end

  def create
    # チーム名からチームを検索、なければ新規作成
    home_team = Team.find_or_create_by(name: params[:game_record][:home_team_name])
    away_team = Team.find_or_create_by(name: params[:game_record][:away_team_name])

    # ゲーム記録を作成
    @game_record = current_user.game_records.build(game_record_params)
    @game_record.home_team = home_team
    @game_record.away_team = away_team

    if @game_record.save
      redirect_to game_records_path, notice: "試合記録が作成されました！"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def show
  end

  def edit
  end

  def update
    home_team = Team.find_or_create_by(name: params[:game_record][:home_team_name])
    away_team = Team.find_or_create_by(name: params[:game_record][:away_team_name])

    if @game_record.update(game_record_params)
      @game_record.update(home_team_id: home_team.id, away_team_id: away_team.id)
      redirect_to game_records_path, notice: "試合記録が更新されました！"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @game_record.destroy!
    redirect_to game_records_path, notice: "試合記録が削除されました！"
  end

  private

  def set_game_record
    @game_record = GameRecord.find(params[:id])
  end

  def game_record_params
    params.require(:game_record).permit(:date, :game_type, :score_home_team, :score_away_team, :description, :home_team_name, :away_team_name)
  end
end
