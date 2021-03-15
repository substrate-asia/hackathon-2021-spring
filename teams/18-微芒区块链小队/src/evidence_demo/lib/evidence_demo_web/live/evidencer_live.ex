defmodule EvidenceDemoWeb.EvidencerLive do

  use Phoenix.LiveView
  alias EvidenceDemoWeb.EvidencerView
  alias EvidenceDemo.{User, Contract, EvidenceHandler}

  def render(assigns) do
    EvidencerView.render("evidencer.html", assigns)
  end

  def mount(_params, %{
    "current_user_id" => id
  }, socket) do
    user = User.get_by_user_id(id)
    contracts =
      "Evidence"
      |> Contract.get_by_type()

    socket
    |> do_mount(contracts, user)
  end

  def mount(_params, _, socket) do
    {:ok,
    socket
    |> redirect(to: "/")
    }
  end

  def do_mount(socket, [], %{group: 1}) do
    {:ok,
      socket
      |> assign(form: :payloads)
      |> assign(contracts: nil)
      |> assign(signers: nil)
    }
  end

  def do_mount(socket, contracts,  %{group: 1}) do
    contracts_des =
      contracts
      |> Enum.map(fn c->
        c.description
      end)

    signers =
      contracts
      |> Enum.fetch!(0)
      |> get_evidence_signers()
    {:ok,
    socket
    |> assign(form: :payloads)
    |> assign(contracts: contracts_des)
    |> assign(signers: signers)
  }
  end

  def mount(_params, _, socket) do
    {:ok,
    socket
    |> redirect(to: "/")
  }
  end

  @doc """
    it's only single now
  """
  def handle_event("up_to_chain", payloads, socket) do
    payloads
    |> StructTranslater.to_atom_struct()
    |> do_handle_event(socket)
  end


  def handle_event("change", %{
    "_target"=>  ["payloads", "contract"],
    "payloads" => %{
      "contract" => contract_des
    }
  }, socket) do

    contract = Contract.get_by_description(contract_des)
    signers =
      get_evidence_signers(contract)

    {
      :noreply,
      socket
      |> assign(:signers, signers)
    }
  end


  def handle_event(_sth, _payload, socket) do
    {:noreply, socket}
  end

  def do_handle_event(%{
    payloads:
    %{
      contract: contract_des,
      data_load_to_chain: data,
      signer: signer,

    }
  }, socket) do
    %{chain: chain}
      = contract
      = contract_des
      |> Contract.get_by_description()
      |> Contract.preload()

    {:ok, evi} =
    EvidenceHandler.new_evidence(
      chain,
      signer,
      contract,
      data
    )
    IO.puts "abcxe"

    {:noreply,
    socket
    |> assign(evidence_info: data)
    |> put_flash("info_A", "up to chain!successfully")
    |> put_flash("info_B", "key: #{evi.key}")
    }
  end

  def get_evidence_signers(contract) do
    contract
    |> Map.get(:init_params)
    |> Map.get("evidenceSigners")
  end
end
