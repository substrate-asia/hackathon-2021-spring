defmodule FileHandler do
  def read(:json, path) do
    path
    |> File.read!()
    |> Poison.decode!()
    |> StructTranslater.to_atom_struct()
  end

  def read(:bin, path) do
    path
    |> File.read!()
    |> String.replace("\n", "")
  end
end
