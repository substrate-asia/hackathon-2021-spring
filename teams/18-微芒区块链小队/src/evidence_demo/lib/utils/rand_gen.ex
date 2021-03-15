defmodule RandGen do
  @moduledoc """
    Generate many Rands.
    gen_num/gen_hex/gen_bytes.
  """
  def gen_num(len) do
    len
    |> gen_hex()
    |> String.to_integer(16)
  end

  def gen_hex(len) do
    len
    |> gen_bytes()
    |> Base.encode16(case: :lower)
  end

  def gen_bytes(len) do
    len
    |> :crypto.strong_rand_bytes()
    |> Kernel.<>(:binary.encode_unsigned(:os.system_time(100)))
  end
end
