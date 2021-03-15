defmodule EvidenceDemo.Chain do
  use Ecto.Schema
  import Ecto.Changeset
  alias EvidenceDemo.Repo
  alias EvidenceDemo.{Contract, Chain}
  schema "chain" do
    field :name, :string
    field :min_height, :integer
    field :is_enabled, :boolean
    field :adapter, :string
    field :config, :map
    field :height_now, :integer
    has_many :contract, Contract
    timestamps()
  end

  def get_height_now(%{height_now: height}) do
    do_get_height_now(height)
  end
  def do_get_height_now(nil), do: 0
  def do_get_height_now(height), do: height

  def get_default_chain() do
    Chain
    |> Repo.all()
    |> Enum.fetch!(0)
  end
  def preload(ele) do
    ele
    |> Repo.preload([:contract])
  end

  def get_all() do
    Repo.all(Chain)
  end

  def get_by_name(ele) do
    try do
      Repo.get_by(Chain, name: ele)
    rescue
      _ ->
      {:error, "get by failed"}
    end
  end

  def get_by_id(ele) do
    try do
      Repo.get_by(Chain, id: ele)
    rescue
      _ ->
      {:error, "get by failed"}
    end
  end

  def create(attrs \\ %{}) do
    %Chain{}
    |> changeset(attrs)
    |> Repo.insert()
  end

  def change(%Chain{} = ele, attrs) do
    ele
    |> changeset(attrs)
    |> Repo.update()
  end

  def changeset(%Chain{} = ele) do
    changeset(ele, %{})
  end

  @doc false
  def changeset(%Chain{} = ele, attrs) do
    ele
    |> cast(attrs, [:name, :min_height, :is_enabled, :adapter, :config, :height_now])
  end
end
