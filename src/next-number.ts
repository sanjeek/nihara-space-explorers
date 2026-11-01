// Phase 1: one forward hop only. Starts never exceed 14.
const originalExercises = Array.from({ length: 50 }, (_, index) => {
  const limit = index < 10 ? 5 : index < 25 ? 10 : 14;
  const start = (index % limit) + 1;
  return { id: index + 1, start, answer: start + 1 };
});
// Twenty extra worksheet-style questions; every result is strictly below 15.
export const additionOneExercises = [1, 2, 4, 5, 6, 8, 2, 3, 5, 7, 8, 9, 10, 11, 12, 13, 4, 7, 10, 13]
  .map((start, index) => ({ id: index + 51, start, answer: start + 1 }));
export const nextNumberExercises = [...originalExercises, ...additionOneExercises];
export function nextNumberProgress(value: unknown): number[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= nextNumberExercises.length))]
    : [];
}
