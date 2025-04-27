Rails.application.routes.draw do
  get "timers/show"
  devise_for :users, controllers: {
    registrations: "registrations",
    passwords: "passwords",
    omniauth_callbacks: "users/omniauth_callbacks"
  }
  resources :game_records, only: [ :index, :new, :create, :show, :edit, :update, :destroy ]
  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/*
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  # Defines the root path route ("/")
  # root "posts#index"
  root "top#index"

  get "/menus", to: "menus#index"
  get "/timers", to: "timers#show"
  get "/settings", to: "settings#index"
  get "/game_records", to: "game_records#index"
  get "/chats", to: "chats#index"
  post "/chats", to: "chats#create"

  mount LetterOpenerWeb::Engine, at: "/letter_opener" if Rails.env.development?
end
