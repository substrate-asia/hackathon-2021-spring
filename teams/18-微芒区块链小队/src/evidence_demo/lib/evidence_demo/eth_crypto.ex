defmodule EvidenceDemo.EthCrypto do
  @moduledoc false
  # @base_recovery_id 27
  # @base_recovery_id_eip_155 35
  # def sign(privkey, tx, chain_id \\ nil) do
  #   {v, r, s} = sign_hash(privkey, tx, chain_id)
  #   %{tx | v: v, r: r, s: s}
  # end

  # @spec sign_hash(binary, binary, false | nil | number) ::
  #         {number, non_neg_integer, non_neg_integer}
  # def sign_hash(privkey, hash, chain_id \\ nil) do
  #   {:ok, <<r::size(256), s::size(256)>>, recovery_id} =
  #     :libsecp256k1.ecdsa_sign_compact(hash, privkey, :default, <<>>)

  #   # Fork Ψ EIP-155
  #   recovery_id =
  #     if chain_id do
  #       chain_id * 2 + @base_recovery_id_eip_155 + recovery_id
  #     else
  #       @base_recovery_id + recovery_id
  #     end

  #   {recovery_id, r, s}
  # end
end
