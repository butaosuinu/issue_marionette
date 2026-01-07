import { useState, useRef, useEffect } from "react";
import { useLingui } from "@lingui/react";
import { useGitHubAuth } from "../../hooks";

const MENU_STYLES = Object.freeze({
  container: "relative",
  button: "flex items-center gap-2 rounded p-1 hover:bg-gray-700",
  avatar: "h-8 w-8 rounded-full",
  dropdown:
    "absolute right-0 top-full z-50 mt-1 w-48 rounded bg-gray-700 py-1 shadow-lg",
  menuItem:
    "block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-600 hover:text-gray-100",
});

export const UserMenu = () => {
  const { _ } = useLingui();
  const { user, logout } = useGitHubAuth();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const { target } = event;
      if (
        containerRef.current !== null &&
        target instanceof Node &&
        !containerRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (user === undefined) {
    return null;
  }

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const handleLogout = () => {
    setIsOpen(false);
    void logout();
  };

  const displayName = user.name ?? user.login;

  return (
    <div className={MENU_STYLES.container} ref={containerRef}>
      <button
        onClick={toggleMenu}
        className={MENU_STYLES.button}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <img
          src={user.avatar_url}
          alt={displayName}
          className={MENU_STYLES.avatar}
        />
        <span className="text-sm text-gray-300">{displayName}</span>
      </button>
      {isOpen && (
        <div className={MENU_STYLES.dropdown}>
          <div className="border-b border-gray-600 px-4 py-2">
            <p className="text-sm font-medium text-gray-100">{displayName}</p>
            <p className="text-xs text-gray-400">@{user.login}</p>
          </div>
          <button
            onClick={handleLogout}
            className={MENU_STYLES.menuItem}
            type="button"
            data-testid="logout-button"
          >
            {_({ id: "auth.logout" })}
          </button>
        </div>
      )}
    </div>
  );
};
