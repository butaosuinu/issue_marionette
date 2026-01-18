import { useState } from "react";
import { useSetAtom } from "jotai";
import { open } from "@tauri-apps/plugin-dialog";
import { saveRepositoryAtom } from "../../stores/repositoryAtoms";
import type { RepositoryFormData } from "../../types/repository";

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

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
};

const TextInput = ({ label, value, onChange, placeholder }: TextInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <input
      type="text"
      value={value}
      onChange={(e) => {
        onChange(e.target.value);
      }}
      className="mt-1 block w-full rounded border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-gray-100 focus:border-blue-500 focus:outline-none"
      placeholder={placeholder}
    />
  </div>
);

type DirectoryInputProps = {
  label: string;
  value: string;
  onSelect: () => void;
  placeholder: string;
};

const DirectoryInput = ({
  label,
  value,
  onSelect,
  placeholder,
}: DirectoryInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-300">{label}</label>
    <div className="mt-1 flex gap-2">
      <input
        type="text"
        value={value}
        readOnly
        className="block flex-1 rounded border border-gray-600 bg-gray-800 px-3 py-2 text-sm text-gray-400"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onSelect}
        className="rounded bg-gray-600 px-3 py-2 text-sm text-gray-100 hover:bg-gray-500"
      >
        選択
      </button>
    </div>
  </div>
);

type CheckboxInputProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

const CheckboxInput = ({
  id,
  label,
  checked,
  onChange,
}: CheckboxInputProps) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id={id}
      checked={checked}
      onChange={(e) => {
        onChange(e.target.checked);
      }}
      className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
    />
    <label htmlFor={id} className="text-sm text-gray-300">
      {label}
    </label>
  </div>
);

const selectDirectory = async (): Promise<string | undefined> => {
  const selected = await open({
    directory: true,
    multiple: false,
    title: "リポジトリのローカルパスを選択",
  }).catch((error: unknown) => {
    // eslint-disable-next-line no-console -- Error logging is necessary for debugging
    console.error("Failed to open directory dialog:", error);
  });

  if (selected !== undefined && typeof selected === "string") {
    return selected;
  }
};

const isFormValid = (state: FormState) =>
  state.owner !== "" &&
  state.name !== "" &&
  state.local_path !== "" &&
  state.default_branch !== "";

const useFormState = () => {
  const [formState, setFormState] = useState<FormState>(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();

  const handleInputChange = (
    field: keyof FormState,
    value: string | boolean
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormState(INITIAL_FORM_STATE);
  };

  return {
    formState,
    isSubmitting,
    setIsSubmitting,
    validationError,
    setValidationError,
    submitError,
    setSubmitError,
    handleInputChange,
    resetForm,
  };
};

type SubmitHandlerArgs = {
  formState: FormState;
  setValidationError: (error: string | undefined) => void;
  setSubmitError: (error: string | undefined) => void;
  setIsSubmitting: (submitting: boolean) => void;
  saveRepository: (data: RepositoryFormData) => Promise<{ ok: boolean }>;
  resetForm: () => void;
};

const createSubmitHandler =
  (args: SubmitHandlerArgs) => async (e: React.FormEvent) => {
    e.preventDefault();
    const {
      formState,
      setValidationError,
      setSubmitError,
      setIsSubmitting,
      saveRepository,
      resetForm,
    } = args;

    if (!isFormValid(formState)) {
      setValidationError("すべての必須項目を入力してください");
      return;
    }

    setValidationError(undefined);
    setSubmitError(undefined);
    setIsSubmitting(true);

    const result = await saveRepository({ ...formState }).catch(
      (err: unknown) => {
        const errorMessage =
          err instanceof Error ? err.message : "リポジトリの保存に失敗しました";
        setSubmitError(errorMessage);
        return { ok: false };
      }
    );

    if (result.ok) {
      resetForm();
    }
    setIsSubmitting(false);
  };

const useRepositoryForm = () => {
  const state = useFormState();
  const saveRepository = useSetAtom(saveRepositoryAtom);

  const handleSelectDirectory = async () => {
    const path = await selectDirectory();
    if (path !== undefined) state.handleInputChange("local_path", path);
  };

  const handleSubmit = createSubmitHandler({
    formState: state.formState,
    setValidationError: state.setValidationError,
    setSubmitError: state.setSubmitError,
    setIsSubmitting: state.setIsSubmitting,
    saveRepository,
    resetForm: state.resetForm,
  });

  return {
    formState: state.formState,
    isSubmitting: state.isSubmitting,
    validationError: state.validationError,
    submitError: state.submitError,
    isFormValid: isFormValid(state.formState),
    handleInputChange: state.handleInputChange,
    handleSelectDirectory,
    handleSubmit,
  };
};

type FormFieldsProps = {
  formState: FormState;
  handleInputChange: (field: keyof FormState, value: string | boolean) => void;
  handleSelectDirectory: () => void;
};

const FormFields = ({
  formState,
  handleInputChange,
  handleSelectDirectory,
}: FormFieldsProps) => (
  <>
    <TextInput
      label="オーナー"
      value={formState.owner}
      onChange={(v) => {
        handleInputChange("owner", v);
      }}
      placeholder="organization or username"
    />
    <TextInput
      label="リポジトリ名"
      value={formState.name}
      onChange={(v) => {
        handleInputChange("name", v);
      }}
      placeholder="repository-name"
    />
    <DirectoryInput
      label="ローカルパス"
      value={formState.local_path}
      onSelect={handleSelectDirectory}
      placeholder="パスを選択してください"
    />
    <TextInput
      label="デフォルトブランチ"
      value={formState.default_branch}
      onChange={(v) => {
        handleInputChange("default_branch", v);
      }}
      placeholder="main"
    />
    <CheckboxInput
      id="is_private"
      label="プライベートリポジトリ"
      checked={formState.is_private}
      onChange={(v) => {
        handleInputChange("is_private", v);
      }}
    />
  </>
);

export const RepositoryForm = () => {
  const {
    formState,
    isSubmitting,
    validationError,
    submitError,
    isFormValid: formValid,
    handleInputChange,
    handleSelectDirectory,
    handleSubmit,
  } = useRepositoryForm();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <FormFields
        formState={formState}
        handleInputChange={handleInputChange}
        handleSelectDirectory={handleSelectDirectory}
      />

      {validationError !== undefined && (
        <p className="text-sm text-red-500">{validationError}</p>
      )}

      {submitError !== undefined && (
        <p className="text-sm text-red-500">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={!formValid || isSubmitting}
        className="w-full rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "追加中..." : "リポジトリを追加"}
      </button>
    </form>
  );
};
