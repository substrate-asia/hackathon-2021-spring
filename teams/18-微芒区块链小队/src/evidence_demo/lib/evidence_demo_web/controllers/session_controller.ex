defmodule EvidenceDemoWeb.SessionController do
  use EvidenceDemoWeb, :controller
  alias EvidenceDemo.User

  def new(conn, _params) do
    render(conn, "sign_in.html")
  end

  def create(conn, %{"session" => auth_params}) do
    user = User.get_by_user_name(auth_params["username"])

    case Comeonin.Bcrypt.check_pass(user, auth_params["password"]) do
      {:ok, user} ->
        conn
        |> put_session(:current_user_id, user.id)
        # |> put_flash(:info, "Signed in successfully.")
        |> redirect(to: Routes.index_path(conn, :index))

      {:error, _} ->
        conn
        |> put_flash(:error, "There was a problem with your username/password")
        |> render("sign_in.html")
    end
  end

  def delete(conn, _params) do
    conn
    |> delete_session(:current_user_id)
    # |> put_flash(:info, "Signed out successfully.")
    |> redirect(to: Routes.index_path(conn, :index))
  end
end
