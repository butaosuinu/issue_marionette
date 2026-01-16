export type FileChangeStatus = "added" | "modified" | "deleted" | "renamed";

export type FileDiff = {
  path: string;
  oldPath: string | undefined;
  status: FileChangeStatus;
  additions: number;
  deletions: number;
  oldContent: string;
  newContent: string;
};

export type DiffViewMode = "sideBySide" | "inline";

export type DiffState = {
  isLoading: boolean;
  error: string | undefined;
  files: FileDiff[];
  selectedFilePath: string | undefined;
  viewMode: DiffViewMode;
};

export type FileTreeNode = {
  name: string;
  path: string;
  type: "file" | "directory";
  status: FileChangeStatus | undefined;
  children: FileTreeNode[];
};

export type DiffResponse = {
  files: FileDiff[];
};
