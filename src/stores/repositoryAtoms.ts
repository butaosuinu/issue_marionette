import { atom } from "jotai";
import { invoke } from "@tauri-apps/api/core";
import type { Repository, RepositoryFormData } from "../types/repository";

const repositoriesRefreshAtom = atom(0);

export const repositoriesSuspenseAtom = atom(async (get) => {
  get(repositoriesRefreshAtom);
  const result = await invoke<Repository[]>("load_repositories").catch(
    (err: unknown) => {
      throw err instanceof Error
        ? err
        : new Error("リポジトリの読み込みに失敗しました");
    }
  );
  return result;
});

export const refreshRepositoriesAtom = atom(null, (_get, set) => {
  set(repositoriesRefreshAtom, (prev) => prev + 1);
});

export const selectedRepositoryIdAtom = atom<string | undefined>(undefined);

export const selectedRepositoryAtom = atom(async (get) => {
  const repositories = await get(repositoriesSuspenseAtom);
  const selectedId = get(selectedRepositoryIdAtom);
  if (selectedId === undefined) {
    return undefined;
  }
  return repositories.find((repo) => repo.id === selectedId);
});

type SaveResult =
  | { ok: true; repository: Repository }
  | { ok: false; error: unknown };

export const saveRepositoryAtom = atom(
  null,
  async (_get, set, formData: RepositoryFormData) => {
    const now = new Date().toISOString();
    const newRepository: Repository = {
      id: crypto.randomUUID(),
      owner: formData.owner,
      name: formData.name,
      full_name: `${formData.owner}/${formData.name}`,
      local_path: formData.local_path,
      default_branch: formData.default_branch,
      is_private: formData.is_private,
      created_at: now,
      updated_at: now,
    };

    const invokeResult = await invoke("save_repository", {
      repository: newRepository,
    }).catch((err: unknown) => err);

    const result: SaveResult =
      invokeResult instanceof Error || typeof invokeResult === "string"
        ? { ok: false as const, error: invokeResult }
        : { ok: true as const, repository: newRepository };

    if (!result.ok) {
      const errorMessage =
        result.error instanceof Error
          ? result.error.message
          : "リポジトリの保存に失敗しました";
      throw new Error(errorMessage);
    }

    set(refreshRepositoriesAtom);
    return { ok: true as const, repository: newRepository };
  }
);

type DeleteResult = { ok: true } | { ok: false; error: unknown };

export const deleteRepositoryAtom = atom(
  null,
  async (get, set, repoId: string) => {
    const invokeResult = await invoke("delete_repository", {
      id: repoId,
    }).catch((err: unknown) => err);

    const result: DeleteResult =
      invokeResult instanceof Error || typeof invokeResult === "string"
        ? { ok: false as const, error: invokeResult }
        : { ok: true as const };

    if (!result.ok) {
      const errorMessage =
        result.error instanceof Error
          ? result.error.message
          : "リポジトリの削除に失敗しました";
      throw new Error(errorMessage);
    }

    const selectedId = get(selectedRepositoryIdAtom);
    if (selectedId === repoId) {
      set(selectedRepositoryIdAtom, undefined);
    }

    set(refreshRepositoriesAtom);
    return { ok: true as const };
  }
);
