import { describe, it, expect } from "vitest";
import { createStore } from "jotai";
import {
  authAtom,
  authStatusAtom,
  currentUserAtom,
  isAuthenticatedAtom,
  setAuthLoadingAtom,
  setAuthSuccessAtom,
  setAuthErrorAtom,
  logoutAtom,
} from "./authAtoms";
import type { GitHubUser } from "../types/auth";

const MOCK_USER_ID = 123;

const createMockUser = (): GitHubUser => ({
  id: MOCK_USER_ID,
  login: "testuser",
  avatar_url: "https://example.com/avatar.png",
  name: "Test User",
  email: "test@example.com",
});

describe("authAtoms", () => {
  describe("authStatusAtom", () => {
    it("初期状態はidleステータス", () => {
      const store = createStore();
      expect(store.get(authStatusAtom)).toBe("idle");
    });

    it("isLoading=trueの場合authenticatingステータス", () => {
      const store = createStore();
      store.set(setAuthLoadingAtom, true);
      expect(store.get(authStatusAtom)).toBe("authenticating");
    });

    it("認証成功後はauthenticatedステータス", () => {
      const store = createStore();
      store.set(setAuthSuccessAtom, { user: createMockUser() });
      expect(store.get(authStatusAtom)).toBe("authenticated");
    });

    it("エラー発生時はerrorステータス", () => {
      const store = createStore();
      store.set(setAuthErrorAtom, "認証に失敗しました");
      expect(store.get(authStatusAtom)).toBe("error");
    });
  });

  describe("currentUserAtom", () => {
    it("初期状態はundefined", () => {
      const store = createStore();
      expect(store.get(currentUserAtom)).toBeUndefined();
    });

    it("認証成功後はユーザー情報を取得可能", () => {
      const store = createStore();
      const mockUser = createMockUser();
      store.set(setAuthSuccessAtom, { user: mockUser });
      expect(store.get(currentUserAtom)).toEqual(mockUser);
    });
  });

  describe("isAuthenticatedAtom", () => {
    it("初期状態はfalse", () => {
      const store = createStore();
      expect(store.get(isAuthenticatedAtom)).toBe(false);
    });

    it("認証成功後はtrue", () => {
      const store = createStore();
      store.set(setAuthSuccessAtom, { user: createMockUser() });
      expect(store.get(isAuthenticatedAtom)).toBe(true);
    });
  });

  describe("setAuthLoadingAtom", () => {
    it("ローディング状態を設定できる", () => {
      const store = createStore();
      store.set(setAuthLoadingAtom, true);
      expect(store.get(authAtom).isLoading).toBe(true);
      expect(store.get(authAtom).error).toBeUndefined();
    });
  });

  describe("setAuthSuccessAtom", () => {
    it("認証成功状態を設定できる", () => {
      const store = createStore();
      const mockUser = createMockUser();
      store.set(setAuthSuccessAtom, { user: mockUser });

      const authState = store.get(authAtom);
      expect(authState.isAuthenticated).toBe(true);
      expect(authState.isLoading).toBe(false);
      expect(authState.user).toEqual(mockUser);
      expect(authState.error).toBeUndefined();
    });
  });

  describe("setAuthErrorAtom", () => {
    it("エラー状態を設定できる", () => {
      const store = createStore();
      store.set(setAuthErrorAtom, "認証に失敗しました");

      const authState = store.get(authAtom);
      expect(authState.isLoading).toBe(false);
      expect(authState.error).toBe("認証に失敗しました");
    });
  });

  describe("logoutAtom", () => {
    it("ログアウト後は初期状態に戻る", () => {
      const store = createStore();
      store.set(setAuthSuccessAtom, { user: createMockUser() });
      expect(store.get(isAuthenticatedAtom)).toBe(true);

      store.set(logoutAtom);

      const authState = store.get(authAtom);
      expect(authState.isAuthenticated).toBe(false);
      expect(authState.isLoading).toBe(false);
      expect(authState.user).toBeUndefined();
      expect(authState.error).toBeUndefined();
    });
  });
});
