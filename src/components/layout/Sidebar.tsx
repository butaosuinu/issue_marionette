import { Link } from "@tanstack/react-router";

export const Sidebar = () => (
  <aside className="flex w-60 flex-col border-r border-gray-700 bg-gray-800">
      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 [&.active]:bg-gray-700 [&.active]:text-gray-100"
          >
            <span>📋</span>
            <span>カンバン</span>
          </Link>
          <Link
            to="/settings"
            className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-gray-100 [&.active]:bg-gray-700 [&.active]:text-gray-100"
          >
            <span>⚙️</span>
            <span>設定</span>
          </Link>
        </nav>
      </div>
      <div className="border-t border-gray-700 p-2">
        <div className="px-3 py-2 text-xs text-gray-500">
          リポジトリ未選択
        </div>
      </div>
  </aside>
);
