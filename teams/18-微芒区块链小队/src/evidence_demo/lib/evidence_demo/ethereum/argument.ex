defmodule EvidenceDemo.Ethereum.Argument do
  # See: https://github.com/ethereum/wiki/wiki/Ethereum-Contract-ABI
  #
  # Supported types:
  #   - string
  #   - bytes
  #   - address
  #   - uint
  #   - int
  #   - uint<M>
  #   - int<M>
  #   - bool
  #   - T[M]
  #   - T[] # encode only
  # Unsupported types:
  #   - bytes<M>
  #   - fixed<M>x<N>
  #   - ufixed<M>x<N>
  #   - fixed
  #   - ufixed
  #   - function

  alias __MODULE__

  @int_types [:int] ++ (1..32 |> Enum.map(&:"int#{&1 * 8}"))
  @uint_types [:uint] ++ (1..32 |> Enum.map(&:"uint#{&1 * 8}"))
  @static_types @int_types ++ @uint_types ++ [:bool, :address]
  @dynamic_types [:string, :bytes, :"T[M]", :"T[]"]

  @type t :: %Argument{name: String.t(), type: atom(), indexed: boolean()}
  defstruct [:name, :type, :indexed]

  def canonical_type_of(type) do
    cond do
      type in @int_types -> :int256
      type in @uint_types -> :uint256
      true -> type
    end
  end

  def encode_arg(type, value) do
    encode_args([{type, value}])
  end

  def decode_arg(type, data) do
    [type] |> decode_args(data) |> List.first()
  end

  @spec encode_args(list({type :: any(), value :: any()})) :: binary()
  def encode_args(args) when is_list(args) do
    "0x" <> ({:"T[M]", args} |> enc() |> Base.encode16(case: :lower))
  end

  def decode_args(types, data) do
    data = data |> String.replace("0x", "") |> Base.decode16!(case: :mixed)

    types
    |> Enum.with_index()
    |> Enum.map(&parse_arg_at_index(&1, data))
  end

  defp parse_arg_at_index({type, index}, data) when type in @static_types do
    bin_data = binary_part(data, index * 32, 32)

    cond do
      type in @uint_types ->
        <<result::size(256)>> = bin_data
        result

      type in @int_types ->
        <<0xFF, result::size(240)>> = bin_data
        -result

      type in @int_types ->
        <<0x00, result::size(240)>> = bin_data
        result

      type == :bool ->
        <<result::size(256)>> = bin_data
        result == 1

      type == :address ->
        <<address::size(256)>> = bin_data
        "0x" <> Base.encode16(<<address::size(160)>>, case: :lower)
    end
  end

  defp parse_arg_at_index({type, index}, data) when type in @dynamic_types do
    <<tail_offset::size(256)>> = binary_part(data, index * 32, 32)
    tail_length = byte_size(data) - tail_offset
    tail_data = binary_part(data, tail_offset, tail_length)

    cond do
      type in [:string, :bytes] ->
        <<byte_length::size(256)>> = binary_part(tail_data, 0, 32)
        binary_part(tail_data, 32, byte_length)
    end
  end

  defp enc({:"T[M]", values}) do
    # tails_with_offset :: list({tail, offset})
    tails_with_offset =
      values
      |> Enum.map(&tail/1)
      |> Enum.reduce({[], 0}, fn t, {results, acc_length} ->
        {results ++ [{t, acc_length}], acc_length + byte_size(t)}
      end)
      |> elem(0)

    # every type is 256 bits now.
    heads_length = length(values) * byte_size(<<0::size(256)>>)

    heads =
      values
      |> Enum.with_index()
      |> Enum.map(fn {{type, value}, index} ->
        head({type, value}, heads_length + elem(Enum.at(tails_with_offset, index), 1))
      end)
      |> Enum.join()

    tails =
      tails_with_offset
      |> Enum.map(&Kernel.elem(&1, 0))
      |> Enum.join()

    heads <> tails
  end

  defp enc({:"T[]", values}) do
    enc({:uint, length(values)}) <> enc({"T[M]", values})
  end

  defp enc({:bytes, value}) do
    enc({:uint, byte_size(value)}) <> pad_right(value)
  end

  defp enc({:string, str}) do
    enc({:bytes, str})
  end

  defp enc({:address, addr}) do
    <<int_addr::size(160)>> = addr |> String.replace("0x", "") |> Base.decode16!(case: :mixed)
    enc({:uint, int_addr})
  end

  defp enc({uint_type, value}) when uint_type in @uint_types do
    <<value::size(256)>>
  end

  defp enc({int_type, value}) when int_type in @int_types do
    if value >= 0 do
      <<value::size(256)>>
    else
      <<0xFF, -value::size(240)>>
    end
  end

  defp enc({:bool, value}) do
    if value do
      <<1::size(256)>>
    else
      <<0::size(256)>>
    end
  end

  defp enc({:address, value}) do
    {int_address, _} = value |> String.replace("0x", "") |> Integer.parse(16)
    <<int_address::size(256)>>
  end

  defp head({type, value}, _tail_offset) when type in @static_types, do: enc({type, value})

  defp head(_, tail_offset) do
    enc({
      :uint,
      tail_offset
    })
  end

  defp tail({type, _value}) when type in @static_types, do: ""
  defp tail({type, value}), do: enc({type, value})

  def pad_right(data) do
    to_add = 32 - rem(byte_size(data), 32)
    data <> String.duplicate(<<0>>, to_add)
  end
end
