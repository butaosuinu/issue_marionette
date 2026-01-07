import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  repositoriesAtom,
  selectedRepositoryAtom,
  selectedRepositoryIdAtom,
} from "../../stores";

export const RepositorySelector = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const repositories = useAtomValue(repositoriesAtom);
  const selectedRepository = useAtomValue(selectedRepositoryAtom);
  const setSelectedId = useSetAtom(selectedRepositoryIdAtom);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current !== null &&
        event.target instanceof Node &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent, id: string) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelect(id);
    }
  };

  const displayText =
    selectedRepository === undefined
      ? "リポジトリ未選択"
      : selectedRepository.full_name;

  const listboxId = "repository-listbox";

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        className="flex w-full items-center justify-between rounded px-3 py-2 text-sm text-gray-300 hover:bg-gray-700"
      >
        <span className="truncate">{displayText}</span>
        <span aria-hidden="true" className="ml-2">
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen && repositories.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="リポジトリ一覧"
          className="absolute bottom-full left-0 mb-1 w-full rounded border border-gray-600 bg-gray-800 shadow-lg"
        >
          {repositories.map((repo) => (
            <div
              key={repo.id}
              role="option"
              tabIndex={0}
              aria-selected={selectedRepository?.id === repo.id}
              onClick={() => {
                handleSelect(repo.id);
              }}
              onKeyDown={(e) => {
                handleKeyDown(e, repo.id);
              }}
              className={`block w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-gray-700 ${
                selectedRepository?.id === repo.id
                  ? "bg-gray-700 text-gray-100"
                  : "text-gray-300"
              }`}
            >
              {repo.full_name}
            </div>
          ))}
        </div>
      )}

      {isOpen && repositories.length === 0 && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="リポジトリ一覧"
          className="absolute bottom-full left-0 mb-1 w-full rounded border border-gray-600 bg-gray-800 p-3 text-center text-sm text-gray-500 shadow-lg"
        >
          リポジトリがありません
        </div>
      )}
    </div>
  );
};
