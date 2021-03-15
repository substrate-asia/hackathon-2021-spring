defmodule EvidenceDemoWeb.EventLive do

  use Phoenix.LiveView
  alias EvidenceDemoWeb.EventView
  alias EvidenceDemo.{Event, Repo, EventHandler}

  @page_first "1"
  @default_page_size "10"

  def render(assigns) do
    EventView.render("event.html", assigns)
  end

  def mount(_params, _session, socket) do
    # events =
    #   Event.get_all()
    #   |> Enum.map(fn event ->
    #     event
    #     |> Repo.preload(tx: :contract)
    #     |> EventHandler.handle_event_by_contract()
    #   end)
    {:ok,
      socket
      # |> assign(events: events)
      |> assign(page: 1)
      |> assign(per_page: 10)
    }
  end

  def handle_params(params, _url, socket) do
    {page, ""} = Integer.parse(params["page"] || @page_first)
    {per_page, ""} = Integer.parse(params["per_page"] || @default_page_size)
    payload = fetch(page, per_page)
    {
      :noreply,
      socket
      |> assign(page: page)
      |> assign(payload)
    }
  end

  defp fetch(page, per_page) do
    events =
      page
      |> Event.list(per_page)
      |> Enum.map(fn event ->
        event
        |> Repo.preload(tx: [:contract, :block])
        |> EventHandler.handle_event_by_contract()
      end)
    %{
      events: events,
      page_title: "Listing Events – Page #{page}"
    }
  end

end
