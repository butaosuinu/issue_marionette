import { vi } from 'vitest'

export const open = vi.fn().mockResolvedValue(undefined)
export const ask = vi.fn().mockResolvedValue(false)
