defmodule EvidenceDemo.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  @default_chain_name "FiscoBcos"

  use Application
  alias EvidenceDemo.Chain
  def start(_type, _args) do
    # add for worker
    import Supervisor.Spec
    children = [
      # Start the Ecto repository
      EvidenceDemo.Repo,
      # Start the Telemetry supervisor
      EvidenceDemoWeb.Telemetry,
      # Start the PubSub system
      {Phoenix.PubSub, name: EvidenceDemo.PubSub},
      # Start the Endpoint (http/https)
      EvidenceDemoWeb.Endpoint,
      # Start a worker by calling: EvidenceDemo.Worker.start_link(arg)
      # {EvidenceDemo.Worker, arg}

      # User ThInGs

      worker(EvidenceDemo.ChainSyncer, [@default_chain_name])
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: EvidenceDemo.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    EvidenceDemoWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
