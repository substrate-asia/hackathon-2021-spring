defmodule EvidenceDemo.Ethereum.Event do
  alias EvidenceDemo.Ethereum.Argument
  alias __MODULE__

  @type t :: %Event{name: String.t(), args: list(Argument.t())}
  defstruct [:name, :args]

  def get_signature(%Event{name: name, args: args}) do
    hash =
      "#{name}(#{args |> Enum.map(&Argument.canonical_type_of(&1.type)) |> Enum.join(",")})"
      |> Crypto.keccak_256sum()
      |> String.downcase()

    "0x" <> hash
  end

  def indexed_args(%Event{args: args}) do
    Enum.filter(args, & &1.indexed)
  end

  def unindexed_args(%Event{args: args}) do
    Enum.filter(args, &(!&1.indexed))
  end


end
