import { useState, useCallback, useMemo } from "react";
import { useLingui } from "@lingui/react";
import type { FileTreeNode, FileChangeStatus } from "../../types/diff";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  FILE_TREE_INDENT,
} from "../../constants/diff";

type StatusBadgeProps = {
  status: FileChangeStatus;
};

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const color = STATUS_COLORS[status];
  const label = STATUS_LABELS[status];
  return (
    <span
      className="inline-flex h-4 w-4 items-center justify-center rounded text-xs font-bold"
      style={{ backgroundColor: color, color: "#fff" }}
    >
      {label}
    </span>
  );
};

type TreeNodeProps = {
  node: FileTreeNode;
  depth: number;
  selectedPath: string | undefined;
  onSelectFile: (params: { filePath: string }) => void;
  expandedPaths: Set<string>;
  onToggleExpand: (params: { path: string }) => void;
};

const TreeNode = ({
  node,
  depth,
  selectedPath,
  onSelectFile,
  expandedPaths,
  onToggleExpand,
}: TreeNodeProps) => {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = node.path === selectedPath;
  const paddingLeft = depth * FILE_TREE_INDENT.PER_DEPTH;

  const handleClick = () => {
    if (node.type === "directory") {
      onToggleExpand({ path: node.path });
    } else {
      onSelectFile({ filePath: node.path });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`flex w-full items-center gap-2 px-2 py-1 text-left text-sm ${
          isSelected ? "bg-gray-700" : "hover:bg-gray-800"
        }`}
        style={{ paddingLeft: `${paddingLeft + FILE_TREE_INDENT.BASE_PADDING}px` }}
      >
        {node.type === "directory" && (
          <span className="text-gray-500">{isExpanded ? "▼" : "▶"}</span>
        )}
        {node.type === "file" && <span className="w-4" />}
        <span className="flex-1 truncate text-gray-300">{node.name}</span>
        {node.status !== undefined && <StatusBadge status={node.status} />}
      </button>
      {node.type === "directory" && isExpanded && (
        <>
          {node.children.map((child) => (
            <TreeNode
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelectFile={onSelectFile}
              expandedPaths={expandedPaths}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </>
      )}
    </>
  );
};

const collectAllDirectoryPaths = (nodes: FileTreeNode[]): Set<string> => {
  const paths = new Set<string>();
  const traverse = (nodeList: FileTreeNode[]) => {
    nodeList.forEach((node) => {
      if (node.type === "directory") {
        paths.add(node.path);
        traverse(node.children);
      }
    });
  };
  traverse(nodes);
  return paths;
};

type UseExpandedPathsReturn = {
  expandedPaths: Set<string>;
  toggleExpand: (params: { path: string }) => void;
};

const useExpandedPaths = (nodes: FileTreeNode[]): UseExpandedPathsReturn => {
  const allDirectoryPaths = useMemo(
    () => collectAllDirectoryPaths(nodes),
    [nodes]
  );

  const [collapsedPaths, setCollapsedPaths] = useState<Set<string>>(
    () => new Set()
  );

  const expandedPaths = useMemo(() => {
    const expanded = new Set(allDirectoryPaths);
    collapsedPaths.forEach((p) => {
      expanded.delete(p);
    });
    return expanded;
  }, [allDirectoryPaths, collapsedPaths]);

  const toggleExpand = useCallback(({ path }: { path: string }) => {
    setCollapsedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  }, []);

  return { expandedPaths, toggleExpand };
};

type FileTreeProps = {
  nodes: FileTreeNode[];
  selectedPath: string | undefined;
  onSelectFile: (params: { filePath: string }) => void;
};

export const FileTree = ({
  nodes,
  selectedPath,
  onSelectFile,
}: FileTreeProps) => {
  const { _ } = useLingui();
  const { expandedPaths, toggleExpand } = useExpandedPaths(nodes);

  if (nodes.length === 0) {
    return (
      <div className="p-4 text-sm text-gray-500">
        {_({ id: "diff.noChanges" })}
      </div>
    );
  }

  return (
    <div className="py-2">
      {nodes.map((node) => (
        <TreeNode
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelectFile={onSelectFile}
          expandedPaths={expandedPaths}
          onToggleExpand={toggleExpand}
        />
      ))}
    </div>
  );
};
