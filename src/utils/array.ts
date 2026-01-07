export const arrayMove = <T>(
  array: readonly T[],
  from: number,
  to: number
): T[] => {
  const newArray = [...array];
  const [removed] = newArray.splice(from, 1);
  newArray.splice(to, 0, removed);
  return newArray;
};
