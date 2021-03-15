defmodule EvidenceDemo.Repo do
  use Ecto.Repo,
    otp_app: :evidence_demo,
    adapter: Ecto.Adapters.Postgres
end
