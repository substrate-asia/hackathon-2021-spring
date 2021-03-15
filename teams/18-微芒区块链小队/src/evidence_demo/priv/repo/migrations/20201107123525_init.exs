defmodule EvidenceDemo.Repo.Migrations.CreateUser do
  use Ecto.Migration

  def change do
    create table :user  do
      add :username, :string
      add :encrypted_password, :string
      add :group, :integer
      timestamps()
    end

    create unique_index(:user, [:username])

    create table :chain do
      add :name, :string
      add :min_height, :integer
      add :is_enabled, :boolean
      add :adapter, :string
      add :config, :map
      add :height_now, :integer
      timestamps()
    end

    create table :block do
      add :chain_id, :integer
      add :block_height, :integer
      add :block_hash, :string
      timestamps()
    end

    create table :tx do
      add :block_id, :integer
      add :contract_id, :integer

      add :tx_hash, :string
      add :from, :string
      add :to, :string
      timestamps()
    end

    create table :contract do
      add :chain_id, :integer

      add :addr, :string
      add :type, :string
      add :creater, :string
      add :init_params, :map
      add :description, :string
      add :abi, {:array, :map}
      timestamps()
    end

    create table :event do
      add :tx_id, :integer

      add :address, :string
      add :log_index, :integer

      add :topics, {:array, :string}
      add :data, :text
      add :block_height, :integer
      timestamps()
    end

    create table :evidence do
      add :contract_id, :integer

      add :tx_hash, :string
      add :key, :string
      add :value, :text
      add :owners, {:array, :string}
      add :signers, {:array, :string}
      add :description, :string

      timestamps()
    end
  end
end
