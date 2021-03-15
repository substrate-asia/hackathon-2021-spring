defmodule EvidenceDemo.Tx do
  use Ecto.Schema
  import Ecto.Changeset
  alias EvidenceDemo.Repo
  alias EvidenceDemo.{Block, Chain, Tx, Event, Contract}

  schema "tx" do
    field :tx_hash, :string
    field :from, :string
    field :to, :string
    belongs_to :block, Block
    belongs_to :contract, Contract
    has_many :event, Event
    timestamps()
  end

  def preload(ele) do
    Repo.preload(ele, :block)
  end

  def get_by_hash(ele) do
    Repo.get_by(Tx, tx_hash: ele)
  end

  def create_tx(attrs \\ %{}) do
    %Tx{}
    |> changeset(attrs)
    |> Repo.insert()
  end

  @doc false
  def changeset(%Tx{} = ele, attrs) do
    ele
    |> cast(attrs, [:from, :to, :block_id, :tx_hash, :contract_id])
  end
end
