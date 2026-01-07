import { useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { open } from "@tauri-apps/plugin-dialog";
import { repositoryErrorAtom, saveRepositoryAtom } from "../../stores";
import type { RepositoryFormData } from "../../types";

type FormState = {
  owner: string;
  name: string;
  local_path: string;
  default_branch: string;
  is_private: boolean;
};

const INITIAL_FORM_STATE: FormState = {
  owner: "",
  name: "",
  local_path: "",
  default_branch: "main",
  is_private: false,
};

export const RepositoryForm = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>(
    undefined
  );
  const saveRepository = useSetAtom(saveRepositoryAtom);
  const repositoryError = useAtomValue(repositoryErrorAtom);

  const handleInputChange = (field: keyof FormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectDirectory = async () => {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "リポジトリのローカルパスを選択",
    }).catch((error: unknown) => {
      // eslint-disable-next-line no-console -- Error logging is necessary for debugging
      console.error("Failed to open directory dialog:", error);
      return undefined;
    });

    if (selected !== undefined && typeof selected === "string") {
      setFormState((prev) => ({ ...prev, local_path: selected }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      formState.owner === "" ||
      formState.name === "" ||
      formState.local_path === "" ||
      formState.default_branch === ""
    ) {
      setValidationError("すべての必須項目を入力してください");
      return;
    }

    setValidationError(undefined);
    setIsSubmitting(true);

    const formData: RepositoryFormData = {
      owner: formState.owner,
      name: formState.name,
      local_path: formState.local_path,
      default_branch: formState.default_branch,
      is_private: formState.is_private,
    };

    const result = await saveRepository(formData);

    if (result.ok) {
      setFormState(INITIAL_FORM_STATE);
    }
    setIsSubmitting(false);
  };

  const isFormValid =
    formState.owner !== "" &&
    formState.name !== "" &&
    formState.local_path !== "" &&
    formState.default_branch !== "";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <div>
        <label className="block text-sm font-medium text-gray-300">
          オーナー
        </label>
        <input
          type="text"
          value={formState.owner}
          onChange={(e) => {
            handleInputChange("owner", e.target.value);
          }}
          className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
          placeholder="organization or username"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          リポジトリ名
        </label>
        <input
          type="text"
          value={formState.name}
          onChange={(e) => {
            handleInputChange("name", e.target.value);
          }}
          className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
          placeholder="repository-name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          ローカルパス
        </label>
        <div className="mt-1 flex gap-2">
          <input
            type="text"
            value={formState.local_path}
            readOnly
            className="block flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-400"
            placeholder="パスを選択してください"
          />
          <button
            type="button"
            onClick={handleSelectDirectory}
            className="rounded bg-gray-600 px-3 py-2 text-sm text-gray-100 hover:bg-gray-500"
          >
            選択
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300">
          デフォルトブランチ
        </label>
        <input
          type="text"
          value={formState.default_branch}
          onChange={(e) => {
            handleInputChange("default_branch", e.target.value);
          }}
          className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
          placeholder="main"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="is_private"
          checked={formState.is_private}
          onChange={(e) => {
            setFormState((prev) => ({ ...prev, is_private: e.target.checked }));
          }}
          className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="is_private" className="text-sm text-gray-300">
          プライベートリポジトリ
        </label>
      </div>

      {validationError !== undefined && (
        <p className="text-sm text-red-500">{validationError}</p>
      )}

      {repositoryError !== undefined && (
        <p className="text-sm text-red-500">{repositoryError}</p>
      )}

      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "追加中..." : "リポジトリを追加"}
      </button>
    </form>
  );
};
