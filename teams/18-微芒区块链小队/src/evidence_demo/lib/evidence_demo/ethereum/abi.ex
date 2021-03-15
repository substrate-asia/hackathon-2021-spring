defmodule EvidenceDemo.Ethereum.ABI do
  alias EvidenceDemo.Ethereum.{Function, Event, Argument}

  @abi_type %{event: "event", function: "function"}

  def get_events(abi) do
    abi
    |> StructTranslater.to_atom_struct()
    |> Enum.filter(fn %{type: type} ->
      type == @abi_type.event
    end)
    |> Enum.map(fn ele ->
      %Event{
        name: ele.name,
        args:
          ele.inputs
          |> Enum.map(&%Argument{name: &1.name, type: :"#{&1.type}", indexed: &1.indexed})
      }
    end)
  end

  def get_funcs(abi) do
    abi
    |> StructTranslater.to_atom_struct()
    |> Enum.filter(fn %{type: type} ->
      type == @abi_type.function
    end)
    |> Enum.map(fn ele ->
    %Function{
        name: ele.name,
        inputs:
          ele.inputs |> Enum.map(&%Argument{name: &1.name, type: :"#{&1.type}"}),
        outputs:
          ele.outputs |> Enum.map(&%Argument{name: &1.name, type: :"#{&1.type}"})
      }
    end)
  end

  def find_event(find_by, abi, ele) do
    abi
    |> get_events()
    |> Enum.find(fn event ->
      handle_event_ele(find_by, event) == ele
    end)
  end

  def handle_event_ele(:sig, event) do
    Event.get_signature(event)
  end
  def handle_event_ele(:name, event) do
    event.name
  end

  def find_func(find_by, abi, ele) do
    abi
    |> get_funcs()
    |> Enum.find(fn func ->
      handle_func_ele(find_by, func) == ele
    end)
  end

  def handle_func_ele(:sig, func) do
    Event.get_signature(func)
  end
  def handle_func_ele(:name, func) do
    func.name
  end
end
