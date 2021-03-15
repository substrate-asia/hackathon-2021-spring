defmodule EvidenceDemo.Contract do
  use Ecto.Schema
  import Ecto.Changeset
  alias EvidenceDemo.{Chain, Contract, Evidence, EvidenceHandler}
  alias EvidenceDemo.Repo
  alias EvidenceDemo.Ethereum.ABI

  schema "contract" do
    field :addr, :string
    field :type, :string
    field :description, :string
    field :creater, :string
    field :init_params, :map
    field :abi, {:array, :map}
    belongs_to :chain, Chain
    has_many :evidence, Evidence
    timestamps()
  end

  def get_funcs(%{abi: abi}) do
    abi
    |> ABI.get_funcs()
    |> Enum.map(fn func ->
      struct_to_map(:func, func)
    end)
  end

  def get_events(%{abi: abi}) do
    abi
    |> ABI.get_events()
    |> Enum.map(fn event ->
      struct_to_map(:event, event)
    end)
  end

  def struct_to_map(:func, ele) do
    ele = Map.from_struct(ele)
    inputs = Enum.map(ele.inputs, fn arg ->
      Map.from_struct(arg)
    end)
    outputs = Enum.map(ele.outputs, fn arg ->
      Map.from_struct(arg)
    end)
    ele
    |> Map.put(:inputs, inputs)
    |> Map.put(:outputs, outputs)
  end

  def struct_to_map(:event, ele) do
    ele = Map.from_struct(ele)
    args = Enum.map(ele.args, fn arg ->
      Map.from_struct(arg)
    end)
    Map.put(ele, :args, args)
  end
  @doc """
    handle is the func when init
  """
  def handle(
    %{type: "Evidence", creater: creater, addr: addr} = contract) do
    %{chain: chain} =
      preload(contract)

    {:ok, signers} =
      EvidenceHandler.get_signers(chain, creater, addr)
    init_params =
      %{evidenceSigners: signers}
    contract
    |> Map.put(:init_params, init_params)
  end

  def preload(contract) do
    Repo.preload(contract, :chain)
  end

  def handle(contract, _init_params) do
    contract
    |> Map.put(:init_params, Poison.decode!(contract.init_params))
  end

  def get_all() do
    Repo.all(Contract)
  end
  def get_by_addr(addr) do
    Repo.get_by(Contract, addr: addr)
  end

  def get_by_id(id) do
    Repo.get_by(Contract, id: id)
  end
  def get_by_type(type) do
    Repo.all(Contract, type: type)
  end

  def get_by_description(item) do
    Repo.get_by(Contract, description: item)
  end

  def create(attrs \\ %{}) do
    %Contract{}
    |> Contract.changeset(attrs)
    |> Repo.insert()
  end

  def change(%Contract{} = ele, attrs) do
    ele
    |> changeset(attrs)
    |> Repo.update()
  end

  def changeset(%Contract{} = ele) do
    Contract.changeset(ele, %{})
  end

  @doc false
  def changeset(%Contract{} = contract, attrs) do
    contract
    |> cast(attrs, [:addr, :type, :description, :creater, :init_params, :abi, :chain_id])
    |> unique_constraint(:description)
  end
end
