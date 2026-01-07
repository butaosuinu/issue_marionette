import { atom } from "jotai";
import { invoke } from "@tauri-apps/api/core";
import type { Repository, RepositoryFormData } from "../types";

export const repositoriesAtom = atom<Repository[]>([]);

export const selectedRepositoryIdAtom = atom<string | undefined>(undefined);

export const repositoryErrorAtom = atom<string | undefined>(undefined);

export const isLoadingAtom = atom(false);

export const selectedRepositoryAtom = atom((get) => {
  const repositories = get(repositoriesAtom);
  const selectedId = get(selectedRepositoryIdAtom);
  if (selectedId === undefined) {
    return;
  }
  return repositories.find((repo) => repo.id === selectedId);
});

export const loadRepositoriesAtom = atom(null, async (_get, set) => {
  set(repositoryErrorAtom, undefined);
  set(isLoadingAtom, true);
  const result = await invoke<Repository[]>("load_repositories").catch(
    (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "リポジトリの読み込みに失敗しました";
      set(repositoryErrorAtom, errorMessage);
      return [] as Repository[];
    }
  );
  set(repositoriesAtom, result);
  set(isLoadingAtom, false);
  return result;
});

export const saveRepositoryAtom = atom(
  null,
  async (get, set, formData: RepositoryFormData) => {
    set(repositoryErrorAtom, undefined);
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

    const result = await invoke("save_repository", {
      repository: newRepository,
    })
      .then(() => ({ ok: true as const }))
      .catch((err: unknown) => ({ ok: false as const, error: err }));

    if (!result.ok) {
      const errorMessage =
        result.error instanceof Error
          ? result.error.message
          : "リポジトリの保存に失敗しました";
      set(repositoryErrorAtom, errorMessage);
      return { ok: false as const, error: result.error };
    }

    const currentRepos = get(repositoriesAtom);
    set(repositoriesAtom, [...currentRepos, newRepository]);
    return { ok: true as const, repository: newRepository };
  }
);

export const deleteRepositoryAtom = atom(
  null,
  async (get, set, repoId: string) => {
    set(repositoryErrorAtom, undefined);
    const result = await invoke("delete_repository", { id: repoId })
      .then(() => ({ ok: true as const }))
      .catch((err: unknown) => ({ ok: false as const, error: err }));

    if (!result.ok) {
      const errorMessage =
        result.error instanceof Error
          ? result.error.message
          : "リポジトリの削除に失敗しました";
      set(repositoryErrorAtom, errorMessage);
      return { ok: false as const, error: result.error };
    }

    const currentRepos = get(repositoriesAtom);
    set(
      repositoriesAtom,
      currentRepos.filter((repo) => repo.id !== repoId)
    );

    const selectedId = get(selectedRepositoryIdAtom);
    if (selectedId === repoId) {
      set(selectedRepositoryIdAtom, undefined);
    }

    return { ok: true as const };
  }
);
