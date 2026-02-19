import { useAtomValue, useSetAtom } from "jotai";
import { ask } from "@tauri-apps/plugin-dialog";
import {
  repositoriesSuspenseAtom,
  selectedRepositoryIdAtom,
  deleteRepositoryAtom,
} from "../../stores/repositoryAtoms";
import type { Repository } from "../../types/repository";
import { Button } from "../ui/Button";

type RepositoryItemProps = {
  repository: Repository;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

const RepositoryItem = ({
  repository,
  isSelected,
  onSelect,
  onDelete,
}: RepositoryItemProps) => {
  const handleDelete = async () => {
    const confirmed = await ask(
      `リポジトリ「${repository.owner}/${repository.name}」を削除しますか？`,
      { title: "削除確認", kind: "warning" }
    );
    if (confirmed) {
      onDelete(repository.id);
    }
  };

  const handleSelect = () => {
    onSelect(repository.id);
  };

  return (
    <div
      className={`flex items-center justify-between rounded px-3 py-2 ${
        isSelected ? "bg-gray-700" : "hover:bg-gray-700"
      }`}
    >
      <button
        onClick={handleSelect}
        className="flex-1 text-left text-sm text-gray-300"
      >
        <div className="font-medium">{repository.full_name}</div>
        <div className="truncate text-xs text-gray-500">
          {repository.local_path}
        </div>
      </button>
      <Button
        variant="ghost"
        className="ml-2 p-1 text-gray-500 hover:bg-gray-600 hover:text-red-400"
        onClick={handleDelete}
        title="削除"
        aria-label={`${repository.name}を削除`}
      >
        ×
      </Button>
    </div>
  );
};

export const useRepositoryListState = () => {
  const repositories = useAtomValue(repositoriesSuspenseAtom);
  const selectedId = useAtomValue(selectedRepositoryIdAtom);
  const deleteRepository = useSetAtom(deleteRepositoryAtom);
  const setSelectedId = useSetAtom(selectedRepositoryIdAtom);

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleDelete = (id: string) => {
    void deleteRepository(id);
  };

  return {
    repositories,
    selectedId,
    handleSelect,
    handleDelete,
  };
};

export const RepositoryList = () => {
  const { repositories, selectedId, handleSelect, handleDelete } =
    useRepositoryListState();

  if (repositories.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        リポジトリがありません
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {repositories.map((repo) => (
        <RepositoryItem
          key={repo.id}
          repository={repo}
          isSelected={selectedId === repo.id}
          onSelect={handleSelect}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
