import { useState, useRef, useEffect } from "react";
import { useLingui } from "@lingui/react";
import { useGitHubAuth } from "../../hooks";
import type { GitHubUser } from "../../types";

const MENU_STYLES = Object.freeze({
  container: "relative",
  button: "flex items-center gap-2 rounded p-1 hover:bg-gray-700",
  avatar: "h-8 w-8 rounded-full",
  dropdown:
    "absolute right-0 top-full z-50 mt-1 w-48 rounded bg-gray-700 py-1 shadow-lg",
  menuItem:
    "block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-gray-100",
});

const useMenuState = (containerRef: React.RefObject<HTMLDivElement | null>) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current !== null &&
        event.target instanceof Node &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, containerRef]);

  return {
    isOpen,
    toggle: () => { setIsOpen((prev) => !prev); },
    close: () => { setIsOpen(false); },
  };
};

type UserDropdownProps = {
  user: GitHubUser;
  displayName: string;
  onLogout: () => void;
};

const UserDropdown = ({ user, displayName, onLogout }: UserDropdownProps) => {
  const { _ } = useLingui();

  return (
    <div className={MENU_STYLES.dropdown}>
      <div className="border-b border-gray-600 px-4 py-2">
        <p className="text-sm font-medium text-gray-100">{displayName}</p>
        <p className="text-xs text-gray-400">@{user.login}</p>
      </div>
      <button
        onClick={onLogout}
        className={MENU_STYLES.menuItem}
        type="button"
        data-testid="logout-button"
      >
        {_({ id: "auth.logout" })}
      </button>
    </div>
  );
};

export const UserMenu = () => {
  const { user, logout } = useGitHubAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const { isOpen, toggle, close } = useMenuState(containerRef);

  if (user === undefined) return null;

  const displayName = user.name ?? user.login;

  const handleLogout = () => {
    close();
    void logout();
  };

  return (
    <div className={MENU_STYLES.container} ref={containerRef}>
      <button
        onClick={toggle}
        className={MENU_STYLES.button}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img src={user.avatar_url} alt={displayName} className={MENU_STYLES.avatar} />
        <span className="text-sm text-gray-300">{displayName}</span>
      </button>
      {isOpen && <UserDropdown user={user} displayName={displayName} onLogout={handleLogout} />}
    </div>
  );
};
