import { useAtomValue, useSetAtom } from "jotai";
import { ask } from "@tauri-apps/plugin-dialog";
import {
  repositoriesAtom,
  selectedRepositoryIdAtom,
  deleteRepositoryAtom,
  repositoryErrorAtom,
  isLoadingAtom,
} from "../../stores";
import type { Repository } from "../../types";

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
      <button
        onClick={handleDelete}
        className="ml-2 rounded p-1 text-gray-500 hover:bg-gray-600 hover:text-red-400"
        title="削除"
        aria-label={`${repository.name}を削除`}
      >
        ×
      </button>
    </div>
  );
};

const useRepositoryListState = () => {
  const repositories = useAtomValue(repositoriesAtom);
  const selectedId = useAtomValue(selectedRepositoryIdAtom);
  const repositoryError = useAtomValue(repositoryErrorAtom);
  const isLoading = useAtomValue(isLoadingAtom);
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
    repositoryError,
    isLoading,
    handleSelect,
    handleDelete,
  };
};

export const RepositoryList = () => {
  const {
    repositories,
    selectedId,
    repositoryError,
    isLoading,
    handleSelect,
    handleDelete,
  } = useRepositoryListState();

  if (isLoading) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">読み込み中...</div>
    );
  }

  if (repositoryError !== undefined) {
    return (
      <div className="p-4 text-center text-sm text-red-400">
        {repositoryError}
      </div>
    );
  }

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
