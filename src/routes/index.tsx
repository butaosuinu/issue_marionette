import { createFileRoute } from "@tanstack/react-router";
import { Suspense } from "react";
import { ErrorBoundary } from "../components/error/ErrorBoundary";
import { KanbanBoard } from "../components/kanban/KanbanBoard";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const KanbanBoardLoading = () => (
  <div className="flex h-full items-center justify-center text-gray-400">
    読み込み中...
  </div>
);

function HomePage() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <ErrorBoundary>
        <Suspense fallback={<KanbanBoardLoading />}>
          <KanbanBoard />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
