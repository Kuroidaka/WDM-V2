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

export const calculateTimeDifference = (startDate:any, endDate:any) => {
  const difference = endDate - startDate;

  const days = Math.floor(difference / (1000 * 60 * 60 * 24));
  return { days };
}

export const calcPenalty = (startDate:Date, endDate:Date= new Date(), totalPrice:number) => {
  let extraFee = 0
  const weddingDate = new Date(startDate)
  const payDate = new Date(endDate)
  let isPenal = false

  const timeDifference = calculateTimeDifference(weddingDate, payDate);

  if(timeDifference.days > 0) {
    extraFee = timeDifference.days* (totalPrice / 100)
    isPenal = true
  }

  return {
      isPenal,
      extraFee
  }
}

export function isObject(value:any):boolean {
  return value !== null && typeof value === 'object';
}

export function convertAndFormatDate(dateStr: (Date | string), timeZone='Asia/Bangkok'): Date {
  const date = new Date(dateStr);
  // Create a date string in the target timezone
  const dateStringInTimeZone = date.toLocaleString('en-US', { timeZone: timeZone });

  // Parse the local date string back into a Date object
  const dateInTimeZone = new Date(dateStringInTimeZone + ' UTC'); // Append 'UTC' to assume this string is UTC

  return dateInTimeZone;
}
