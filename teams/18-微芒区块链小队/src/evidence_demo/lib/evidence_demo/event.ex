defmodule EvidenceDemo.Event do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query, warn: false
  alias EvidenceDemo.Repo
  alias EvidenceDemo.{Tx, Event}

  schema "event" do
    field :topics, {:array, :string}
    field :data, :string
    field :address, :string
    field :block_height, :integer
    field :log_index, :integer
    belongs_to :tx, Tx
    timestamps()
  end

  def list(current_page, per_page) do
    Repo.all(
      from e in Event,
        order_by: [desc: e.block_height],
        offset: ^((current_page - 1) * per_page),
        limit: ^per_page
    )
  end

  def get_all() do
    Repo.all(Event)
  end
  def get_by_id(ele) do
    Repo.get_by(Event, id: ele)
  end
  def get_by_addr(ele) do
    Repo.get_by(Event, address: ele)
  end
  def preload(ele) do
    Repo.preload(ele, :tx)
  end

  def create_event(attrs \\ %{}) do
    %Event{}
    |> changeset(attrs)
    |> Repo.insert()
  end

  @doc false
  def changeset(%Event{} = ele, attrs) do
    ele
    |> cast(attrs, [:topics, :data, :tx_id, :address, :log_index, :block_height])
  end
end
