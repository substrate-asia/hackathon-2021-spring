defmodule Directive do
  @moduledoc false

  def schema do
    quote do
      use Ecto.Schema
      alias __MODULE__
      import Ecto.{Query, Queryable, Changeset}
      import EctoEnum, only: [defenum: 2]

      def validate_one_off(changeset, fields) do
        fields
        |> Enum.reduce(changeset, fn
          :address, acc ->
            if !is_nil(get_change(changeset, :address)) and !is_nil(Map.get(acc.data, :address)) do
              addr = Map.get(acc.data, :address)

              if addr == "temp" or String.starts_with?(addr, "o:") do
                acc
              else
                acc |> add_error(:address, "address is one-off field")
              end
            else
              acc
            end

          field, acc ->
            if !is_nil(changeset |> get_change(field)) and !is_nil(acc.data |> Map.get(field)) do
              acc |> add_error(field, "#{field} is one-off field")
            else
              acc
            end
        end)
      end
    end
  end

  defmacro __using__(which) when is_atom(which) do
    apply(__MODULE__, which, [])
  end
end
