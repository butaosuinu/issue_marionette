import type { FileDiff, FileTreeNode, FileChangeStatus } from "../types/diff";
import {
  FILE_CHANGE_STATUS,
  SORT_ORDER,
  SLICE_INDEX,
  ARRAY_POSITION,
} from "../constants/diff";

type BuildFileTreeParams = {
  files: FileDiff[];
};

type GetFileLanguageParams = {
  filePath: string;
};

const LANGUAGE_EXTENSIONS: Readonly<Record<string, string>> = Object.freeze({
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  json: "json",
  md: "markdown",
  css: "css",
  scss: "scss",
  html: "html",
  rs: "rust",
  py: "python",
  go: "go",
  java: "java",
  yaml: "yaml",
  yml: "yaml",
  toml: "toml",
  xml: "xml",
  sql: "sql",
  sh: "shell",
  bash: "shell",
});

export const getFileLanguage = ({ filePath }: GetFileLanguageParams): string => {
  const extension = filePath.split(".").at(ARRAY_POSITION.LAST)?.toLowerCase();
  if (extension === undefined) {
    return "plaintext";
  }
  return LANGUAGE_EXTENSIONS[extension] ?? "plaintext";
};

const sortTreeNodes = (nodes: FileTreeNode[]): FileTreeNode[] =>
  nodes.toSorted((a, b) => {
    if (a.type !== b.type) {
      return a.type === "directory" ? SORT_ORDER.BEFORE : SORT_ORDER.AFTER;
    }
    return a.name.localeCompare(b.name);
  });

const sortTreeRecursively = (nodes: FileTreeNode[]): FileTreeNode[] =>
  sortTreeNodes(nodes).map((node) => ({
    ...node,
    children: sortTreeRecursively(node.children),
  }));

type ProcessFileParams = {
  file: FileDiff;
  root: FileTreeNode[];
  nodeMap: Map<string, FileTreeNode>;
};

/* eslint-disable functional/immutable-data -- ツリー構築アルゴリズムのため意図的なミューテーション */
const processFile = ({ file, root, nodeMap }: ProcessFileParams): void => {
  const parts = file.path.split("/");
  const fileName = parts.pop();

  if (fileName === undefined) {
    return;
  }

  const directoryParts: string[] = [];
  parts.forEach((part) => {
    directoryParts.push(part);
    const dirPath = directoryParts.join("/");

    if (!nodeMap.has(dirPath)) {
      const dirNode: FileTreeNode = {
        name: part,
        path: dirPath,
        type: "directory",
        status: undefined,
        children: [],
      };
      nodeMap.set(dirPath, dirNode);

      if (directoryParts.length === 1) {
        root.push(dirNode);
      } else {
        const parentPath = directoryParts.slice(0, SLICE_INDEX.EXCLUDE_LAST).join("/");
        const parentNode = nodeMap.get(parentPath);
        if (parentNode !== undefined) {
          parentNode.children.push(dirNode);
        }
      }
    }
  });

  const fileNode: FileTreeNode = {
    name: fileName,
    path: file.path,
    type: "file",
    status: file.status,
    children: [],
  };

  if (parts.length === 0) {
    root.push(fileNode);
  } else {
    const parentPath = parts.join("/");
    const parentNode = nodeMap.get(parentPath);
    if (parentNode !== undefined) {
      parentNode.children.push(fileNode);
    }
  }
};
/* eslint-enable functional/immutable-data */

export const buildFileTree = ({ files }: BuildFileTreeParams): FileTreeNode[] => {
  if (files.length === 0) {
    return [];
  }

  const root: FileTreeNode[] = [];
  const nodeMap = new Map<string, FileTreeNode>();

  const sortedFiles = files.toSorted((a, b) => a.path.localeCompare(b.path));

  sortedFiles.forEach((file) => {
    processFile({ file, root, nodeMap });
  });

  return sortTreeRecursively(root);
};

type GetStatusFromStringParams = {
  status: string;
};

export const getStatusFromString = ({
  status,
}: GetStatusFromStringParams): FileChangeStatus => {
  const statusLower = status.toLowerCase();
  if (
    statusLower === FILE_CHANGE_STATUS.ADDED ||
    statusLower === "a" ||
    statusLower === "new"
  ) {
    return FILE_CHANGE_STATUS.ADDED;
  }
  if (
    statusLower === FILE_CHANGE_STATUS.DELETED ||
    statusLower === "d" ||
    statusLower === "removed"
  ) {
    return FILE_CHANGE_STATUS.DELETED;
  }
  if (
    statusLower === FILE_CHANGE_STATUS.RENAMED ||
    statusLower === "r"
  ) {
    return FILE_CHANGE_STATUS.RENAMED;
  }
  return FILE_CHANGE_STATUS.MODIFIED;
};
