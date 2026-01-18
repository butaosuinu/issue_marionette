import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  repositoriesSuspenseAtom,
  selectedRepositoryAtom,
  selectedRepositoryIdAtom,
} from "../../stores/repositoryAtoms";
import type { Repository } from "../../types/repository";

const LISTBOX_ID = "repository-listbox";

const useClickOutside = (
  ref: React.RefObject<HTMLDivElement | null>,
  isOpen: boolean,
  onClose: () => void
) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        ref.current !== null &&
        event.target instanceof Node &&
        !ref.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, isOpen, onClose]);
};

type RepositoryOptionProps = {
  repo: Repository;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

const RepositoryOption = ({
  repo,
  isSelected,
  onSelect,
}: RepositoryOptionProps) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect(repo.id);
    }
  };

  return (
    <div
      role="option"
      tabIndex={0}
      aria-selected={isSelected}
      onClick={() => {
        onSelect(repo.id);
      }}
      onKeyDown={handleKeyDown}
      className={`block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-700 ${
        isSelected ? "bg-gray-700 text-gray-100" : "text-gray-300"
      }`}
    >
      {repo.full_name}
    </div>
  );
};

type DropdownListProps = {
  repositories: Repository[];
  selectedId: string | undefined;
  onSelect: (id: string) => void;
};

const DropdownList = ({
  repositories,
  selectedId,
  onSelect,
}: DropdownListProps) => {
  if (repositories.length === 0) {
    return (
      <div
        id={LISTBOX_ID}
        role="listbox"
        aria-label="リポジトリ一覧"
        className="absolute bottom-full left-0 mb-1 w-full rounded border border-gray-600 bg-gray-800 p-3 text-center text-sm text-gray-500 shadow-lg"
      >
        リポジトリがありません
      </div>
    );
  }

  return (
    <div
      id={LISTBOX_ID}
      role="listbox"
      aria-label="リポジトリ一覧"
      className="absolute bottom-full left-0 mb-1 w-full rounded border border-gray-600 bg-gray-800 shadow-lg"
    >
      {repositories.map((repo) => (
        <RepositoryOption
          key={repo.id}
          repo={repo}
          isSelected={selectedId === repo.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export const useRepositorySelectorState = () => {
  const repositories = useAtomValue(repositoriesSuspenseAtom);
  const selectedRepository = useAtomValue(selectedRepositoryAtom);
  const setSelectedId = useSetAtom(selectedRepositoryIdAtom);

  return {
    repositories,
    selectedRepository,
    setSelectedId,
  };
};

export const RepositorySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { repositories, selectedRepository, setSelectedId } =
    useRepositorySelectorState();

  useClickOutside(dropdownRef, isOpen, () => {
    setIsOpen(false);
  });

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
  };

  const displayText = selectedRepository?.full_name ?? "リポジトリ未選択";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={LISTBOX_ID}
        className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
      >
        <span className="truncate">{displayText}</span>
        <span aria-hidden="true" className="ml-2">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && (
        <DropdownList
          repositories={repositories}
          selectedId={selectedRepository?.id}
          onSelect={handleSelect}
        />
      )}
    </div>
  );
};
