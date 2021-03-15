defmodule  EvidenceDemo.Ethereum.Function do
  alias __MODULE__
  alias EvidenceDemo.Ethereum.Argument
  @type t :: %Function{name: String.t(), inputs: list(Argument.t()), outputs: list(Argument.t())}
  defstruct [:name, :inputs, :outputs]

  def signature(%Function{name: name, inputs: inputs}) do
    hash =
      "#{name}(#{inputs |> Enum.map(&Argument.canonical_type_of(&1.type)) |> Enum.join(",")})"
      |> Crypto.keccak_256sum()
      |> String.downcase()
      |> String.slice(0, 8)

    "0x" <> hash
  end
end
