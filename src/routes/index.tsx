import { createFileRoute } from "@tanstack/react-router";
import { KanbanBoard } from "../components/kanban/KanbanBoard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <KanbanBoard />
    </div>
  );
}
