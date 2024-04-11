/**
 * Calculates the start and end of a day for a given date.
 * @param date The date from which to calculate the start and end of the day.
 * @returns An object containing the start and end of the day as Date objects.
 */
export const getStartAndEndOfDay = (date: string): { startOfDay: Date; endOfDay: Date } => {
  const day = new Date(date);
  const startOfDay = new Date(day.setHours(0, 0, 0, 0));
  const endOfDay = new Date(day.setHours(23, 59, 59, 999));
  return { startOfDay, endOfDay };
}
