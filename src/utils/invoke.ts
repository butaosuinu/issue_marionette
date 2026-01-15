import { invoke } from "@tauri-apps/api/core";
import type { Result, ErrorResult } from "../types/result";

const isErrorResult = (value: unknown): value is ErrorResult => {
  if (typeof value !== "object" || value === null) {
    return false;
  }
  if (!("ok" in value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return record.ok === false;
};

export const invokeWithResult = async <T>(
  command: string,
  args?: Record<string, unknown>
): Promise<Result<T>> => {
  const invokePromise =
    args === undefined ? invoke<T>(command) : invoke<T>(command, args);

  const result = await invokePromise.catch((error: unknown) => ({
    ok: false as const,
    error: error instanceof Error ? error.message : String(error),
  }));

  if (isErrorResult(result)) {
    return result;
  }

  return { ok: true, data: result };
};
