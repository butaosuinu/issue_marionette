import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <div className="flex-1 p-6">
      <h1 className="text-2xl font-bold text-gray-100">設定</h1>
      <p className="mt-2 text-gray-400">アプリケーション設定</p>
    </div>
  );
}
