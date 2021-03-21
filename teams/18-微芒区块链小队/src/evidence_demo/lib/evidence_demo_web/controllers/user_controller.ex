defmodule EvidenceDemoWeb.UserController do
  use EvidenceDemoWeb, :controller
  alias EvidenceDemo.User
  alias EvidenceDemo.Repo

  @spec new(Plug.Conn.t(), any) :: Plug.Conn.t()
  def new(conn, _params) do

    user_changeset =
      %User{}
      |> User.changeset()

    render(
      conn,
      "sign_up.html",
      %{
        changeset: user_changeset
      })
  end

  def create(conn, %{"user" => user_params}) do
    changeset =
      User.changeset(%User{}, user_params)

    Repo.transaction(fn ->
      user_params
      |> put_group()
      |> do_create()
      |> case do
        {:error, payload} ->
        # error handler
          Repo.rollback("reason: #{inspect(payload)}")
        payload ->
          payload
      end
    end)
    |> handle_create_result(conn, changeset)
  end

  def put_group(user_params) do
    Map.put(user_params, "group", 0)
  end
  def do_create(user_params_restructured) do
    with {:ok, _user} <- User.create_user(user_params_restructured) do
        {:ok, "user_create_finished"}
    else
      {:error, error_payload} ->
        {:error, error_payload}
    end
  end

  def handle_create_result({:ok, _payload}, conn, _) do
    conn
    |> put_flash(:info, "Signed up successfully.")
    |> redirect(to: Routes.index_path(conn, :index))
  end
  def handle_create_result({:error, %Ecto.Changeset{}}, conn, changeset) do
    conn
    |> put_flash(:error, "Signed up failed with dateabase problem")
    |> render("sign_up.html", changeset: changeset)
  end
  def handle_create_result({:error, others}, conn, changeset) do
    conn
    |> put_flash(:error, "Signed up failed with #{inspect(others)} problem")
    |> render("sign_up.html", changeset: changeset)
  end

  def index(conn, _) do
    user_id = get_session(conn, :current_user_id)
    if user_id do
      user =
        user_id
        |> User.get_by_user_id()

      render(conn, "user.html", %{login?: true, user: user})
    else
      redirect(conn, to: Routes.user_path(conn, :new))
    end
  end
end
