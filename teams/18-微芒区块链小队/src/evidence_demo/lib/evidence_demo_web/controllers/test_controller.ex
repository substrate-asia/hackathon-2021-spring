defmodule EvidenceDemoWeb.TestController do
  use EvidenceDemoWeb, :controller

  def index(conn, _params) do
    render(conn, "test.html")
  end
end
