defmodule EvidenceDemo.Chain.FiscoBcos do
  alias EvidenceDemo.{Block, Tx, Event, Repo, Contract}

  def get_best_block_height(chain) do
    WeBaseInteractor.get_block_number(chain)
  end

  def sync_block(chain, height) do
    {block_formatted, raw_txs} =
      chain
      |> WeBaseInteractor.get_block_by_number(height)
      |> handle_block(chain)

    txs_formatted =
      raw_txs
      |> handle_txs(chain)
      |> filter_txs()

    Repo.transaction(fn ->
      res =
        block_formatted
        |> Map.put(:tx, txs_formatted)
        |> Repo.insert()
      case res do
        {:error, payload} ->
          # error handler
            Repo.rollback("reason: #{inspect(payload)}")
          payload ->
            payload
      end
    end)

  end

  def handle_block({:ok, raw_block}, chain) do
    raw_block
    |> StructTranslater.to_atom_struct()
    |> do_handle_block(chain)
  end

  def do_handle_block(%{number: block_height, hash: block_hash, transactions: txs}, %{id: chain_id}) do
    block_formatted =
      block_height
      |> build_block(block_hash, chain_id)
    {block_formatted, txs}
  end

  def build_block(block_height, block_hash, chain_id) do
    %Block{
      block_height: block_height,
      block_hash: block_hash,
      chain_id: chain_id
    }
  end

  def handle_txs(txs, chain) do
    Enum.map(txs, fn %{hash: tx_hash} ->
      chain
      |> WeBaseInteractor.get_transaction_receipt(tx_hash)
      |> handle_receipt()
    end)
  end

  def filter_txs(txs) do
    contracts_local = Contract.get_all()
    txs
    # set contract_id of every tx
    |> Enum.map(fn tx ->
      contract_id = get_contract_id_of_tx(tx, contracts_local)
      Map.put(tx, :contract_id, contract_id)
    end)
    # eject the nil tx
    |> Enum.reject(fn %{contract_id: c_id} ->
      is_nil(c_id)
    end)
  end

  def get_contract_id_of_tx(%{from: from, to: to}, contracts) do
    contracts
    |> Enum.find(fn %{addr: addr} ->
      (addr == from) or (addr == to)
    end)
    |> case do
      nil ->
        nil
      c ->
        c.id
    end
  end

  def handle_receipt({:ok, raw_tx_receipt}) do
    raw_tx_receipt
    |> StructTranslater.to_atom_struct()
    |> do_handle_receipt()
  end
  def do_handle_receipt(%{from: from_addr, to: to_addr, transactionHash: tx_hash, logs: logs, blockNumber: block_height}) do
    tx = build_tx(from_addr, to_addr, tx_hash)
    events =
      Enum.map(logs, fn %{address: addr, data: data, logIndex: log_index,topics: topics} ->
        build_event(addr, data, log_index, topics, block_height)
      end)
    Map.put(tx, :event, events)
  end

  def build_tx(from, to, tx_hash) do
    %Tx{
      from: from,
      to: to,
      tx_hash: tx_hash
    }
  end

  def build_event(addr, data, log_index, topics, block_height) do
    %Event{
      address: addr,
      data: data,
      topics: topics,
      log_index: log_index,
      block_height: block_height
    }
  end

end
