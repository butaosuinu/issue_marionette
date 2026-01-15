import { useEffect, type ReactNode } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { resolvedThemeAtom } from "../../stores/settingsAtoms";
import { loadRepositoriesAtom } from "../../stores/repositoryAtoms";

type Props = {
  children: ReactNode;
};

export const MainLayout = ({ children }: Props) => {
  const theme = useAtomValue(resolvedThemeAtom);
  const loadRepositories = useSetAtom(loadRepositoriesAtom);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  return (
    <div className={theme}>
      <div className="flex h-screen flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
