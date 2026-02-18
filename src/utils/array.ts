import { ARRAY_INDEX } from "../constants/kanban";

export const arrayMove = <T>(
  array: readonly T[],
  from: number,
  to: number
): T[] => {
  const removed = array[from];
  return array
    .toSpliced(from, ARRAY_INDEX.INCREMENT)
    .toSpliced(to, ARRAY_INDEX.FIRST, removed);
};
