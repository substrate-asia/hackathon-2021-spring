defmodule EvidenceDemo.Ethereum.EventLog do
  alias EvidenceDemo.Ethereum.ABI
  alias EvidenceDemo.Ethereum.{Event, Argument}
  alias __MODULE__

  @type t :: %EventLog{event: Event.t(), args: %{required(String.t()) => any()}}
  defstruct [:event, :args]

  def decode(abi, topics, unindexed_data) when is_list(topics) do
    [event_signature | indexed_values] = topics
    event = ABI.find_event(:sig, abi, event_signature)
    indexed_args = Event.indexed_args(event)
    unindexed_args = Event.unindexed_args(event)

    indexed_args =
      [indexed_args, indexed_values]
      |> Enum.zip()
      |> Enum.map(fn {arg, value} -> {arg.name, Argument.decode_arg(arg.type, value)} end)
      |> Enum.into(%{})

    unindexed_types = unindexed_args |> Enum.map(& &1.type)
    unindexed_names = unindexed_args |> Enum.map(& &1.name)
    unindexed_values = Argument.decode_args(unindexed_types, unindexed_data)
    unindexed_args = [unindexed_names, unindexed_values] |> Enum.zip() |> Enum.into(%{})

    %EventLog{event: event, args: Map.merge(indexed_args, unindexed_args)}
  end

  def encode(%EventLog{event: event, args: args}) do
    event_signature = Event.get_signature(event)
    indexed_args = Event.indexed_args(event)
    unindexed_args = Event.unindexed_args(event)

    encoded_indexed_args =
      indexed_args
      |> Enum.map(&Argument.encode_arg(&1.type, args[&1.name]))

    encoded_unindexed_args =
      unindexed_args
      |> Enum.map(&(Argument.encode_arg(&1.type, args[&1.name]) |> String.replace("0x", "")))
      |> Enum.join()

    topics = [event_signature] ++ encoded_indexed_args
    {topics, "0x" <> encoded_unindexed_args}
  end
end
