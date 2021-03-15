defmodule WeBaseInteractor do
  @handle_tx_body_struct %{
    user: nil,
    contractAddress: nil,
    funcName: nil,
    contractAbi: nil,
    funcParam: nil,
    groupId: nil
  }

  @deploy_body_struct %{
    groupId: nil,
    user: nil,
    bytecodeBin: nil,
    abiInfo: nil,
    funcParam: nil
  }

  @webase_front "/WeBASE-Front"
  @web3 "/1/web3"
  @url %{
    handle_tx: @webase_front <> "/trans/handle",
    deploy:  @webase_front <> "/contract/deploy",
    create_account: @webase_front <> "/privateKey/import",
    web3: %{
      block_num: @webase_front <> @web3 <> "/blockNumber",
      block_by_number: @webase_front <> @web3 <> "/blockByNumber",
      tx_receipt:  @webase_front <> @web3 <> "/transactionReceipt"
    }
  }

  # +---------+
  # |  web3   |
  # +---------+
  def get_block_number(chain) do
    node = get_webase_node(chain)
    Http.get(node <> @url.web3.block_num)
  end

  def get_block_by_number(chain, number) do
    node = get_webase_node(chain)
    Http.get(node <> @url.web3.block_by_number <> "/#{number}")
  end

  def get_transaction_receipt(chain, tx_hash) do
    node = get_webase_node(chain)
    Http.get(node <> @url.web3.tx_receipt <> "/#{tx_hash}")
  end

  # +---------+
  # | others  |
  # +---------+
  def create_account(chain, priv_key, user_name) do
    node = get_webase_node(chain)

    url =
      node
      |> Kernel.<>(@url.create_account)
      |> Kernel.<>("?privateKey=#{priv_key}")
      |> Kernel.<>("&userName=#{user_name}")
      |> URI.encode()
    {:ok, %{
      "address" => addr
    }} = Http.get(url)
    {:ok, addr}
  end

  def handle_tx(chain, user_addr, contract_addr, func_name, func_param, contract_abi) do
    handle_tx(chain, user_addr,
     contract_addr, func_name, func_param, contract_abi, 1)
  end

  def handle_tx(chain, user_addr, contract_addr, func_name, func_param, contract_abi, group_id) do
    node = get_webase_node(chain)

    body =
      @handle_tx_body_struct
      |> Map.put(:user, user_addr)
      |> Map.put(:contractAddress, contract_addr)
      |> Map.put(:funcName, func_name)
      |> Map.put(:funcParam, func_param)
      |> Map.put(:contractAbi, contract_abi)
      |> Map.put(:groupId, group_id)

    Http.post(node <> @url.handle_tx, body)
  end

  def deploy(chain, sign_user_id, contract_bin, abi, func_param) do
    deploy(chain, sign_user_id, contract_bin, abi, func_param, 1)
  end

  def deploy(chain, sign_user_id, contract_bin, abi, func_param, group_id) do
    node = get_webase_node(chain)

    body =
      @deploy_body_struct
      |> Map.put(:user, sign_user_id)
      |> Map.put(:funcParam, func_param)
      |> Map.put(:bytecodeBin, contract_bin)
      |> Map.put(:abiInfo, abi)
      |> Map.put(:groupId, group_id)

    Http.post(node <> @url.deploy, body)
  end

  def get_webase_node(%{config: %{"webase" => node}}), do: node
  def get_webase_node(_else), do: :error
end
