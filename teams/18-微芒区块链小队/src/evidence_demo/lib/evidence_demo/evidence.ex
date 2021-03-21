defmodule EvidenceDemo.Evidence do
  use Ecto.Schema
  import Ecto.Changeset
  alias EvidenceDemo.{Evidence, Contract}
  alias EvidenceDemo.Repo

  schema "evidence" do
    field :key, :string
    field :value, :string
    field :description, :string
    field :tx_hash, :string
    field :owners, {:array, :string}
    field :signers, {:array, :string}
    belongs_to :contract, Contract
    timestamps()
  end

  # +--------------+
  # | database ops |
  # +--------------+

  def update(ele, attrs) do
    ele
    |> changeset(attrs)
    |> Repo.update
  end

  def preload(evi) do
    Repo.preload(evi, :contract)
  end

  def get_by_key(key) do
    Repo.get_by(Evidence, key: key)
  end

  def create(attrs \\ %{}) do
    %Evidence{}
    |> Evidence.changeset(attrs)
    |> Repo.insert()
  end

  def changeset(%Evidence{} = evi) do
    Evidence.changeset(evi, %{})
  end

  @doc false
  def changeset(%Evidence{} = evi, attrs) do
    evi
    |> cast(attrs, [:key, :value, :description, :contract_id, :tx_hash, :owners, :signers])
  end
end
