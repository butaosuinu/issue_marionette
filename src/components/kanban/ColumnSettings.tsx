import { useAtom, useSetAtom } from "jotai";
import { useState } from "react";
import {
  columnsAtom,
  addColumnAtom,
  removeColumnAtom,
  updateColumnAtom,
} from "../../stores";

type Props = {
  onClose: () => void;
};

export const ColumnSettings = ({ onClose }: Props) => {
  const [columns] = useAtom(columnsAtom);
  const addColumn = useSetAtom(addColumnAtom);
  const removeColumn = useSetAtom(removeColumnAtom);
  const updateColumn = useSetAtom(updateColumnAtom);

  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#6B7280");

  const handleAddColumn = () => {
    if (newColumnTitle.trim() === "") {
      return;
    }

    const id = `custom-${Date.now()}`;
    addColumn({
      id,
      title: newColumnTitle.trim(),
      isDefault: false,
      color: newColumnColor,
    });
    setNewColumnTitle("");
  };

  const sortedColumns = [...columns].toSorted((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-gray-800 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-100">
            カラム設定
          </h2>
          <button
            onClick={onClose}
            aria-label="閉じる"
            className="rounded p-1 text-gray-400 hover:bg-gray-700 hover:text-gray-100"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 max-h-80 space-y-3 overflow-y-auto">
          {sortedColumns.map((column) => (
            <div
              key={column.id}
              className="flex items-center gap-3 rounded border border-gray-700 p-3"
            >
              <input
                type="color"
                value={column.color}
                onChange={(e) =>
                  { updateColumn({
                    columnId: column.id,
                    updates: { color: e.target.value },
                  }); }
                }
                className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
              />
              <input
                type="text"
                value={column.title}
                onChange={(e) =>
                  { updateColumn({
                    columnId: column.id,
                    updates: { title: e.target.value },
                  }); }
                }
                className="flex-1 rounded bg-gray-900 px-3 py-2 text-sm text-gray-100"
              />
              {!column.isDefault && (
                <button
                  onClick={() => { removeColumn(column.id); }}
                  className="rounded p-1 text-red-400 hover:bg-gray-700 hover:text-red-300"
                >
                  削除
                </button>
              )}
              {column.isDefault && (
                <span className="text-xs text-gray-500">デフォルト</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-gray-700 pt-4">
          <h3 className="mb-2 text-sm font-medium text-gray-300">
            新しいカラムを追加
          </h3>
          <div className="flex gap-3">
            <input
              type="color"
              value={newColumnColor}
              onChange={(e) => { setNewColumnColor(e.target.value); }}
              className="h-10 w-10 cursor-pointer rounded border-0 bg-transparent"
            />
            <input
              type="text"
              value={newColumnTitle}
              onChange={(e) => { setNewColumnTitle(e.target.value); }}
              placeholder="カラム名を入力"
              className="flex-1 rounded bg-gray-900 px-3 py-2 text-sm text-gray-100"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddColumn();
                }
              }}
            />
            <button
              onClick={handleAddColumn}
              disabled={newColumnTitle.trim() === ""}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              追加
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
