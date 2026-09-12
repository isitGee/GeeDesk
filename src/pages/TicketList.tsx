import { useGame } from "../game/store";
import { scenarios } from "../data/scenarios";
import { TicketCard } from "../components/TicketCard";

export function TicketList() {
  const { progress } = useGame();

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">Ticket queue</h1>
        <p className="mt-1 text-[13.5px] text-[var(--color-text-secondary)]">
          {scenarios.length} open ticket{scenarios.length === 1 ? "" : "s"}. Pick one and start investigating.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((s) => (
          <TicketCard key={s.id} scenario={s} record={progress.completedTickets[s.id]} />
        ))}
      </div>
    </div>
  );
}
