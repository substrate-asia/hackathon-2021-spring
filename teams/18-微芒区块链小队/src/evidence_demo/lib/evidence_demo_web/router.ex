defmodule EvidenceDemoWeb.Router do
  use EvidenceDemoWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, {EvidenceDemoWeb.LayoutView, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", EvidenceDemoWeb do
    pipe_through :browser

    # INDEX
    get "/", IndexController, :index
    post "/", IndexController, :index
    # NORMAL
    resources "/user/registrations", UserController, only: [:create, :new]
    get "/user/sign-in", SessionController, :new
    post "/user/sign-in", SessionController, :create
    get "/user", UserController, :index

    #LIVEVIEW
    live "/live/contract", ContractLive
    live "/live/evidence", EvidencerLive

    live "/live/event", EventLive

    # live "/", PageLive, :index
  end

  # Other scopes may use custom stacks.
  scope "/api/v1", EvidenceDemoWeb do
    pipe_through :api
  end

  # Enables LiveDashboard only for development
  #
  # If you want to use the LiveDashboard in production, you should put
  # it behind authentication and allow only admins to access it.
  # If your application does not have an admins-only section yet,
  # you can use Plug.BasicAuth to set up some basic authentication
  # as long as you are also using SSL (which you should anyway).
  if Mix.env() in [:dev, :test] do
    import Phoenix.LiveDashboard.Router

    scope "/" do
      pipe_through :browser
      live_dashboard "/dashboard", metrics: EvidenceDemoWeb.Telemetry
    end
  end
end
