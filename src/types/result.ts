 
export type OkResult<T> = { ok: true; data: T };
 
export type ErrorResult = { ok: false; error: string };
export type Result<T> = OkResult<T> | ErrorResult;
