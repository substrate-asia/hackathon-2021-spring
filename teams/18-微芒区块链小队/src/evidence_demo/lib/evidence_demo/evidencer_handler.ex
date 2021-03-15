defmodule EvidenceDemo.EvidenceHandler do
  @moduledoc """
    handle with Evidence Contract
  """
  alias EvidenceDemo.{Evidence}
  alias EvidenceDemo.Ethereum.EventLog

  @evi_bin FileHandler.read(:bin, "contract/evidence/evidence_fac.bin")
  @evi_fac_abi FileHandler.read(:json, "contract/evidence/evidence_fac.abi")
  @evi_abi FileHandler.read(:json, "contract/evidence/evidence.abi")
  @evi_full_abi @evi_fac_abi ++ @evi_abi
  @func %{
    new_evi: "newEvidence",
    get_evi: "getEvidence",
    add_sig: "addSignatures",
    get_signers: "getSigners",
  }

  def new_evidence(chain, signer, contract, evidence) do
    {:ok, key, tx_hash} =
      do_new_evidence(
        chain,
        signer,
        contract.addr,
        evidence
      )

    Evidence.create(%{
      key: key,
      tx_hash: tx_hash,
      value: evidence,
      owners: [signer],
      contract_id: contract.id,
      signers: [signer]
    })
  end
  def add_signatures(chain, signer_addr, evi) do
    evi_preloaded = Evidence.preload(evi)
    WeBaseInteractor.handle_tx(
      chain,
      signer_addr,
      evi_preloaded.contract.addr,
      @func.add_sig,
      [evi.key],
      @evi_full_abi
    )
  end

  def get_evidence_on_chain(chain, caller_addr, evi) do
    evi_preloaded = Evidence.preload(evi)
    WeBaseInteractor.handle_tx(
      chain,
      caller_addr,
      evi_preloaded.contract.addr,
      @func.get_evi,
      [evi.key],
      @evi_full_abi
    )
  end

  def do_new_evidence(chain, deployer_addr, contract_addr, evidence) do
    {:ok, %{"transactionHash" => tx_hash, "logs" => logs}} =
      WeBaseInteractor.handle_tx(
        chain,
        deployer_addr,
        contract_addr,
        @func.new_evi,
        [evidence],
        @evi_full_abi
      )
    key =
      logs
      |> Enum.fetch!(0)
      |> Map.get("address")
    {:ok, key, tx_hash}
  end

  def get_signers(chain, deployer_addr, contract_addr) do
    {:ok, [signer_list]} =
      WeBaseInteractor.handle_tx(
        chain,
        deployer_addr,
        contract_addr,
        @func.get_signers,
        [],
        @evi_full_abi
      )
    {:ok, signer_list}
  end

  def deploy(chain, deployer_addr, signer_list) do
    WeBaseInteractor.deploy(
      chain,
      deployer_addr,
      @evi_bin,
      @evi_full_abi,
      [signer_list]
    )
  end

  def decode_event(%{
    data: data,
    topics: topics
  }) do
    EventLog.decode(@evi_full_abi, topics, data)
  end
end
