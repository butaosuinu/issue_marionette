import { ARRAY_INDEX } from "../constants/kanban";

export const arrayMove = <T>(
  array: readonly T[],
  from: number,
  to: number
): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, ARRAY_INDEX.INCREMENT);
  newArray.splice(to, ARRAY_INDEX.FIRST, removed);
  return newArray;
};
