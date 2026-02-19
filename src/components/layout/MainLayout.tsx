import { Suspense, type ReactNode } from "react";
import { useAtomValue } from "jotai";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "../error/ErrorBoundary";
import { resolvedThemeAtom } from "../../stores/settingsAtoms";
import { Button } from "../ui/Button";

type Props = {
  children: ReactNode;
};

const SidebarLoading = () => (
  <aside className="flex w-60 flex-col border-r border-gray-700 bg-gray-800">
    <div className="flex flex-1 items-center justify-center">
      <span className="text-sm text-gray-500">読み込み中...</span>
    </div>
  </aside>
);

const SidebarErrorFallback = ({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) => (
  <aside className="flex w-60 flex-col border-r border-gray-700 bg-gray-800">
    <div className="flex flex-1 flex-col items-center justify-center gap-2 p-4">
      <span className="text-sm text-red-400">読み込みに失敗しました</span>
      <span className="text-xs text-gray-500">{error.message}</span>
      <Button variant="secondary" size="sm" onClick={reset} className="mt-2">
        再試行
      </Button>
    </div>
  </aside>
);

export const MainLayout = ({ children }: Props) => {
  const theme = useAtomValue(resolvedThemeAtom);

  return (
    <div className={theme}>
      <div className="flex h-screen flex-col bg-gray-900 text-gray-100">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <ErrorBoundary fallback={SidebarErrorFallback}>
            <Suspense fallback={<SidebarLoading />}>
              <Sidebar />
            </Suspense>
          </ErrorBoundary>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </div>
  );
};
