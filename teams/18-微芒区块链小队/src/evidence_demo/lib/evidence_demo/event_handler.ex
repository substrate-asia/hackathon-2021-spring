defmodule EvidenceDemo.EventHandler do
  alias EvidenceDemo.Ethereum.EventLog
  alias EvidenceDemo.Event
  alias EvidenceDemo.Repo

  def handle_event_by_contract(%Event{} = event) do
    event
    |> Repo.preload(tx: :contract)
    |> do_handle_event_by_contract()
  end

  @doc """
    event_log exp:
    %EvidenceDemo.Ethereum.EventLog{
      args: %{
        "addr" => "0x38d3e8318c86511f89e546796e1bb2fb346d6bae",
        "evi" => "1234"
      },
      event: %EvidenceDemo.Ethereum.Event{
        args: [
          %EvidenceDemo.Ethereum.Argument{indexed: false, name: "evi", type: :string},
          %EvidenceDemo.Ethereum.Argument{
            indexed: false,
            name: "addr",
            type: :address
          }
        ],
        name: "newSignaturesEvent"
      }
    }
  """
  def do_handle_event_by_contract(event_preloaded) do
    abi = event_preloaded.tx.contract.abi
    obvious_event = EventLog.decode(
      abi,
      event_preloaded.topics,
      event_preloaded.data
      )

    Map.put(event_preloaded, :obvious_event, obvious_event)
  end
end
