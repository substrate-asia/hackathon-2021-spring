defmodule EvidenceDemoWeb.IndexController do
  use EvidenceDemoWeb, :controller

  @payload %{
    name: "Highway Evidence Demo",
    slogan: "suit to multi-chain | save evidence speedly",
    changeset: nil,
    verify_result: nil
  }

  def index(conn, %{"login_out" => "yes"}) do
    conn
    |> clear_session()
    |> redirect(to: Routes.index_path(conn, :index))
  end

  def index(conn, _params) do
    render(conn, "index.html", payload: @payload)
  end




end
