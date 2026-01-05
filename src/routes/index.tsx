import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-gray-100">
        issue_marionette
      </h1>
      <p className="mt-2 text-gray-400">
        GitHub issueをタスクとして扱うCoding Agentオーケストレーター
      </p>
    </div>
  );
}
