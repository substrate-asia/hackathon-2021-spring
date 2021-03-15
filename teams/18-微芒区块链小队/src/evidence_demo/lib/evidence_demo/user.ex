defmodule EvidenceDemo.User do
  use Ecto.Schema
  import Ecto.Changeset
  alias Comeonin.Bcrypt
  alias EvidenceDemo.User
  alias EvidenceDemo.Repo

  schema "user" do
    field :encrypted_password, :string
    field :username, :string

    field :group, :integer
    # group: 1 - admin, 0 - normal
    timestamps()
  end

  def get_by_user_name(username) when is_nil(username) do
    nil
  end

  def get_by_user_name(username) do
    Repo.get_by(User, username: username)
  end

  def get_by_user_id(id) do
    Repo.get_by(User, id: id)
  end

  def create_user(attrs \\ %{}) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  def change(%User{} = ele, attrs) do
    ele
    |> changeset(attrs)
    |> Repo.update()
  end

  def changeset(%User{} = ele) do
    User.changeset(ele, %{})
  end

  @doc false
  def changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:username, :encrypted_password, :group])
    |> unique_constraint(:username)
    |> validate_required([:username, :encrypted_password])
    |> update_change(:encrypted_password, &Bcrypt.hashpwsalt/1)
  end
end
