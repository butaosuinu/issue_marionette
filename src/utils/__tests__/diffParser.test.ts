import { describe, it, expect } from "vitest";
import { getFileLanguage, buildFileTree, getStatusFromString } from "../diffParser";
import type { FileDiff } from "../../types/diff";

describe("getFileLanguage", () => {
  it(".ts ファイルで typescript を返す", () => {
    expect(getFileLanguage({ filePath: "src/App.ts" })).toBe("typescript");
  });

  it(".tsx ファイルで typescript を返す", () => {
    expect(getFileLanguage({ filePath: "src/App.tsx" })).toBe("typescript");
  });

  it(".js ファイルで javascript を返す", () => {
    expect(getFileLanguage({ filePath: "index.js" })).toBe("javascript");
  });

  it(".rs ファイルで rust を返す", () => {
    expect(getFileLanguage({ filePath: "src/main.rs" })).toBe("rust");
  });

  it(".json ファイルで json を返す", () => {
    expect(getFileLanguage({ filePath: "package.json" })).toBe("json");
  });

  it(".css ファイルで css を返す", () => {
    expect(getFileLanguage({ filePath: "styles/main.css" })).toBe("css");
  });

  it("未知の拡張子で plaintext を返す", () => {
    expect(getFileLanguage({ filePath: "file.xyz" })).toBe("plaintext");
  });

  it("拡張子がない場合 plaintext を返す", () => {
    expect(getFileLanguage({ filePath: "Dockerfile" })).toBe("plaintext");
  });
});

describe("buildFileTree", () => {
  it("空のリストで空配列を返す", () => {
    expect(buildFileTree({ files: [] })).toEqual([]);
  });

  it("単一ファイルを正しく変換する", () => {
    const files: FileDiff[] = [
      {
        path: "README.md",
        oldPath: undefined,
        status: "modified",
        additions: 5,
        deletions: 2,
        oldContent: "old",
        newContent: "new",
      },
    ];

    const result = buildFileTree({ files });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("README.md");
    expect(result[0].type).toBe("file");
    expect(result[0].status).toBe("modified");
  });

  it("ネストしたディレクトリ構造を正しく構築する", () => {
    const files: FileDiff[] = [
      {
        path: "src/components/Button.tsx",
        oldPath: undefined,
        status: "added",
        additions: 20,
        deletions: 0,
        oldContent: "",
        newContent: "content",
      },
      {
        path: "src/utils/helper.ts",
        oldPath: undefined,
        status: "modified",
        additions: 3,
        deletions: 1,
        oldContent: "old",
        newContent: "new",
      },
    ];

    const result = buildFileTree({ files });

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("src");
    expect(result[0].type).toBe("directory");
    expect(result[0].children).toHaveLength(2);

    const components = result[0].children.find((c) => c.name === "components");
    expect(components).toBeDefined();
    expect(components?.type).toBe("directory");
    expect(components?.children[0].name).toBe("Button.tsx");
    expect(components?.children[0].status).toBe("added");

    const utils = result[0].children.find((c) => c.name === "utils");
    expect(utils).toBeDefined();
    expect(utils?.children[0].name).toBe("helper.ts");
    expect(utils?.children[0].status).toBe("modified");
  });

  it("ディレクトリがファイルより先に来るようソートする", () => {
    const files: FileDiff[] = [
      {
        path: "src/index.ts",
        oldPath: undefined,
        status: "modified",
        additions: 1,
        deletions: 0,
        oldContent: "",
        newContent: "",
      },
      {
        path: "src/components/App.tsx",
        oldPath: undefined,
        status: "modified",
        additions: 1,
        deletions: 0,
        oldContent: "",
        newContent: "",
      },
    ];

    const result = buildFileTree({ files });
    const [srcNode] = result;

    expect(srcNode.children[0].type).toBe("directory");
    expect(srcNode.children[0].name).toBe("components");
    expect(srcNode.children[1].type).toBe("file");
    expect(srcNode.children[1].name).toBe("index.ts");
  });

  it("複数のルートレベルファイルを処理できる", () => {
    const files: FileDiff[] = [
      {
        path: "package.json",
        oldPath: undefined,
        status: "modified",
        additions: 2,
        deletions: 1,
        oldContent: "",
        newContent: "",
      },
      {
        path: "README.md",
        oldPath: undefined,
        status: "added",
        additions: 10,
        deletions: 0,
        oldContent: "",
        newContent: "",
      },
    ];

    const result = buildFileTree({ files });

    expect(result).toHaveLength(2);
    expect(result.map((n) => n.name)).toContain("package.json");
    expect(result.map((n) => n.name)).toContain("README.md");
  });
});

describe("getStatusFromString", () => {
  it("'added' で added を返す", () => {
    expect(getStatusFromString({ status: "added" })).toBe("added");
  });

  it("'A' で added を返す", () => {
    expect(getStatusFromString({ status: "A" })).toBe("added");
  });

  it("'deleted' で deleted を返す", () => {
    expect(getStatusFromString({ status: "deleted" })).toBe("deleted");
  });

  it("'D' で deleted を返す", () => {
    expect(getStatusFromString({ status: "D" })).toBe("deleted");
  });

  it("'renamed' で renamed を返す", () => {
    expect(getStatusFromString({ status: "renamed" })).toBe("renamed");
  });

  it("'R' で renamed を返す", () => {
    expect(getStatusFromString({ status: "R" })).toBe("renamed");
  });

  it("'modified' で modified を返す", () => {
    expect(getStatusFromString({ status: "modified" })).toBe("modified");
  });

  it("'M' で modified を返す", () => {
    expect(getStatusFromString({ status: "M" })).toBe("modified");
  });

  it("未知のステータスで modified を返す", () => {
    expect(getStatusFromString({ status: "unknown" })).toBe("modified");
  });

  it("大文字小文字を区別しない", () => {
    expect(getStatusFromString({ status: "ADDED" })).toBe("added");
    expect(getStatusFromString({ status: "Deleted" })).toBe("deleted");
  });
});
