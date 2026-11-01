// Phase 1: one forward hop only. Starts never exceed 14.
export const nextNumberExercises = Array.from({ length: 50 }, (_, index) => {
  const limit = index < 10 ? 5 : index < 25 ? 10 : 14;
  const start = (index % limit) + 1;
  return { id: index + 1, start, answer: start + 1 };
});
export function nextNumberProgress(value: unknown): number[] {
  return Array.isArray(value)
    ? [...new Set(value.filter((id): id is number => Number.isInteger(id) && id >= 1 && id <= 50))]
    : [];
}
