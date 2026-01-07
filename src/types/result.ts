// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- CLAUDE.mdでtypeを優先
export type OkResult<T> = { ok: true; data: T };
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- CLAUDE.mdでtypeを優先
export type ErrorResult = { ok: false; error: string };
export type Result<T> = OkResult<T> | ErrorResult;
