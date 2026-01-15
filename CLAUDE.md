# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## General Guidelines

- **常に日本語で返答してください** (Always respond in Japanese)
- ファイル保存時に内容が変更される場合がありますが、これは prettier によるフォーマットなので気にしないでください
- 過剰なコメントは**禁止**
- 作業ログ的なコメントは**禁止**

## Static Analysis Rules

### TypeScript Type Checking

- **lsmcp MCPサーバの利用を最優先してください**
- lsmcpが使えない場合の代替手段
  - **ファイル単位での型チェックを実行すること**
  - 全体型チェックよりも、作業対象ファイルの型チェックを優先する
  - ファイル単位での実行コマンド: `npx tsc --noEmit path/to/file.ts` または `npx tsc --noEmit path/to/file.tsx`
  - プロジェクト全体の型チェック: `pnpm build` （必要な場合のみ使用）

### Linting (OxLint + ESLint)

- **ファイル単位でのLint実行を優先すること**
- 全体lintingよりも、作業対象ファイルのlintingを優先する
- ファイル単位での実行コマンド: `npx oxlint path/to/file.ts && npx eslint path/to/file.ts` または `npx oxlint path/to/file.tsx && npx eslint path/to/file.tsx`
- プロジェクト全体のlinting: `pnpm lint` （必要な場合のみ使用）

### Formatting (OxFmt + Prettier)

- **ファイル単位でのフォーマット実行を優先すること**
- TypeScript/JavaScript ファイル: `npx oxfmt path/to/file.ts --write` または `npx oxfmt path/to/file.tsx --write`
- CSS ファイル: `npx prettier --write path/to/file.css`
- プロジェクト全体のフォーマット: `pnpm format` （必要な場合のみ使用）

## Github Guidelines

- `gh` コマンドを使用して issue や PR にアクセスすること

## Project Overview

Tauri + React + TypeScript デスクトップアプリケーション。

### アーキテクチャ

- **フロントエンド** (`src/`): React 19 + TypeScript + Vite
- **バックエンド** (`src-tauri/`): Rust + Tauri 2
- **パッケージマネージャー**: pnpm

### Common Commands

```bash
# フロントエンド開発
pnpm dev              # Vite 開発サーバー起動（http://localhost:1420）
pnpm build            # TypeScript + Vite ビルド

# Tauri アプリ開発
pnpm tauri dev        # 開発モードでアプリ起動（ホットリロード対応）
pnpm tauri build      # ネイティブアプリケーションビルド
```

### Tauri 開発

**Rust コマンドの追加**:

1. `src-tauri/src/lib.rs` に `#[tauri::command]` 関数を追加
2. `tauri::Builder` の `invoke_handler` に登録

**フロントエンドからの呼び出し**:

```typescript
import { invoke } from '@tauri-apps/api/core';
const result = await invoke('command_name', { arg1: 'value' });
```

## Testing Standards

### Testing Trophy に従うテスト戦略

#### Testing Trophy とは

- **Kent C. Dodds の Testing Trophy**に従ってテスト戦略を構築する
- 下から順に: Static Analysis → Unit Tests → Integration Tests → E2E Tests
- **インテグレーションテストが最も重要**であり、最も多くの価値を提供する
- テストピラミッドではなく、インテグレーションテストを最重要視する Testing Trophy の形を採用

#### 各テストレベルの役割と優先順位

1. **Static Analysis（静的解析）** - 基盤
   - TypeScript 型チェック、ESLint、Prettier
   - 基本的な構文エラーや型エラーを早期発見
   - コードの品質と一貫性を保証

2. **Unit Tests（ユニットテスト）** - 限定的使用
   - 純粋な関数、ユーティリティ関数のテスト
   - ビジネスロジックのテスト（カスタム Hooks 等）
   - モック使用は最小限に抑制
   - 複雑な計算ロジックや独立した関数のみを対象

3. **Integration Tests（インテグレーションテスト）** - **最重要**
   - **React コンポーネントのテスト - これが最も価値が高い**
   - 実際のユーザー操作をシミュレート
   - MSW を使用して API レスポンスをモック
   - 実際の DOM 操作とユーザーインタラクションを検証
   - コンポーネント間の連携を検証
   - **実際のユーザー体験に最も近いテスト**

4. **E2E Tests（エンドツーエンドテスト）** - 最小限
   - 重要なユーザーフローの検証
   - 実際のブラウザでの動作確認
   - インテグレーションテストでカバーできない統合的なシナリオのみ

### Test Philosophy

- **Kent C. Dodds の Testing Trophy に厳密に従う**
- **インテグレーションテストを最優先**で実装する
- ビジネスロジックに対してユニットテストを実施する
- デトロイト学派に従う
- React コンポーネントに対してはインテグレーションテストを実施する
- **実際のユーザー体験に近いテストを優先**し、過度なモックは避ける

## Important Conventions

### TypeScript Guidelines

- **バレルファイル（index.ts）禁止**
  - `index.ts` や `index.tsx` によるre-exportは使用禁止
  - 常に直接ファイルパスでインポートすること

- **型の使用**
  - `any`型は使用禁止
  - 型アサーション（Type Assertion）は使用禁止
  - タイプエイリアス（type）をインターフェース（interface）より優先して使用
  - 型名はアッパーキャメルケース（PascalCase）を使用

```typescript
// 良い例
type User = {
  id: number;
  name: string;
};

type ProductData = {
  id: string;
  price: number;
};
```

- **変数とイミュータブル性**
  - `let`は基本的に使用禁止。`const`を優先的に使用
  - 宣言済みのオブジェクトのプロパティをミュータブルに更新することを禁止
  - `for`よりも`map`、`filter`などの高階関数の使用を優先
  - オブジェクトのプロパティを更新するようなミュータブルな走査を禁止

```typescript
// 良い例
const newArray = array.map((item) => transformItem(item));

// 新しいオブジェクトを作成する（イミュータブル）
const updatedUser = { ...user, age: 30 };

// オブジェクトのイミュータブルな更新
const user = { name: 'John', age: 25 };
const updatedUser = { ...user, age: 26 };

// 配列のイミュータブルな更新
const items = [1, 2, 3];
const newItems = [...items, 4];
const filteredItems = items.filter((item) => item > 1);
const mappedItems = items.map((item) => item * 2);
```

- **命名規則**
  - 変数名や関数名はロアキャメルケース（camelCase）を使用
  - 定数は大文字のスネークケース（UPPER_SNAKE_CASE）を使用
  - クラス・型名はアッパーキャメルケース（PascalCase）を使用

```typescript
// 良い例
const userName = 'John';
const MAX_RETRIES = 3;
const API_ENDPOINT = 'https://api.example.com';
function calculateTotal(items) {
  /* ... */
}
class UserRepository {
  /* ... */
}
```

- **値の扱い**
  - `null`の使用は DOM 関連の返り値を扱う場合以外では禁止
  - 値がない場合も常に`undefined`を使用
  - オブジェクトのプロパティが存在しない場合は`undefined`を使用

```typescript
// 良い例
const user = {
  name: 'John',
  address: undefined, // 住所情報がない
};
const getValue = () => undefined; // 値が存在しない場合

// DOM関連の例外的な使用
const element = document.querySelector('.not-exist'); // null が返される可能性あり
if (element === null) {
  // DOM要素が存在しない場合の処理
}
```

- **条件と比較**
  - boolean 以外の変数で `!変数名` のような曖昧な比較を行わない
  - null、undefined、空文字列などの判定は厳密に比較演算子を使用
  - ただし、null と undefined を同時に弾く目的での `変数 != null` のような比較は許可

```typescript
// 良い例
if (value === null) {
  // nullの場合の処理
}

if (value === undefined) {
  // undefinedの場合の処理
}

if (array.length === 0) {
  // 配列が空の場合の処理
}

if (text === '') {
  // 文字列が空の場合の処理
}

// nullとundefinedを同時に弾く例外的なケース
if (value != null) {
  // valueがnullでもundefinedでもない場合の処理
  // これは許可される例外パターン
}
```

- **マジックナンバー・文字列の禁止**
  - コード内で直接数値や文字列リテラルを使用せず、常に定数を使用
  - `Object.freeze()`を使用して定数オブジェクトを作成
  - TypeScript の`as const`アサーションを活用して型安全性を高める

```typescript
// 良い例
export const REVIEW_OPTION_TYPE = Object.freeze({
  TEXT: 1,
  TEXTAREA: 2,
  SCORE: 3,
  RADIO: 4,
  CHECKBOX: 5,
  SELECT: 6,
});

// 型の定義と組み合わせる
export type ReviewOptionTypeKey = keyof typeof REVIEW_OPTION_TYPE;
export type ReviewOptionType = (typeof REVIEW_OPTION_TYPE)[ReviewOptionTypeKey];

// 使用例
if (option.type === REVIEW_OPTION_TYPE.TEXT) {
  // テキスト入力の処理
}

export const REVIEW_SETTING_TYPE = Object.freeze({
  BASIC: 'basic',
  DESIGN: 'design',
  PATTERN_TEST: 'pattern_test',
});
```

- **RORO パターン（Receive an Object, Return an Object）**
  - 関数の引数と戻り値の両方でオブジェクトを使用
  - オブジェクトの分割代入を活用して必要なプロパティのみを取り出す

```typescript
// React コンポーネントでの適用
type ReviewData = {
  id: string;
  title: string;
  content: string;
};

type Props = {
  reviewData: ReviewData;
};

const ReviewComponent = ({ reviewData }: Props) => {
  const { id, title, content } = reviewData;
  // ...処理...
  return <div>{title}</div>;
};

// 通常の関数での適用
const calculateTax = ({
  amount,
  taxRate = 0.1,
  includeDiscount = false,
  discountRate = 0,
}) => {
  let taxableAmount = amount;

  if (includeDiscount) {
    taxableAmount = amount * (1 - discountRate);
  }

  const tax = taxableAmount * taxRate;
  const total = taxableAmount + tax;

  return {
    originalAmount: amount,
    taxableAmount,
    tax,
    total,
    effectiveTaxRate: taxRate,
    discountApplied: includeDiscount,
  };
};

// 使用例
const { total, tax } = calculateTax({
  amount: 1000,
  includeDiscount: true,
  discountRate: 0.05,
});
```

- **非同期処理**
  - await/catch を使用する
  - `Promise.then().catch()`の使用禁止
  - `try/catch`の使用禁止

```typescript
// 良い例 - await/catchパターン
const fetchUserData = async (id: string) => {
  const response = await fetch(`/api/users/${id}`).catch((error) => {
    return { ok: false, error };
  });

  if (!response.ok) {
    return {
      ok: false,
      error: response.error || new Error('Failed to fetch user data'),
    };
  }

  const data = await response.json().catch((error) => {
    return { ok: false, error };
  });

  if (!data.ok) {
    return { ok: false, error: data.error };
  }

  return { ok: true, data };
};

// 使用例
const result = await fetchUserData('123');
if (result.ok) {
  const userData = result.data;
  // 成功時の処理
} else {
  // エラーハンドリング
  console.error(result.error);
}
```
