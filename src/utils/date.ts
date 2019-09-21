/**
 * Check if the given date is in the range of allowed dates.
 *
 * @param {Date} date The date to check
 * @param {Date} min Range start
 * @param {Date} max Range end
 * @return {Boolean} True if the date is in the range
 */
export const dateAllowed = (date?: Date | null, min?: Date | null, max?: Date | null): boolean => {
  if (!date) {
    return false;
  }
  return (!min || date >= min) && (!max || date <= max);
};

/**
 * Check if two dates are equal.
 *
 * @param {Date} date1
 * @param {Date} date2
 * @return {Boolean} True if the given date objects refer to the same date
 */
export const dateEquals = (date1?: Date | null, date2?: Date | null): boolean => {
  return (
    date1 instanceof Date &&
    date2 instanceof Date &&
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Get ISO 8601 week number for the given date.
 *
 * @param {Date} Date object
 * @return {Number} Week number
 */
export const getISOWeekNumber = (date: Date): number => {
  // Ported from Vaadin Framework method com.vaadin.client.DateTimeService.getISOWeekNumber(date)
  let dayOfWeek = date.getDay(); // 0 == sunday

  // ISO 8601 use weeks that start on monday so we use
  // mon=1,tue=2,...sun=7;
  if (dayOfWeek === 0) {
    dayOfWeek = 7;
  }
  // Find nearest thursday (defines the week in ISO 8601). The week number
  // for the nearest thursday is the same as for the target date.
  const nearestThursdayDiff = 4 - dayOfWeek; // 4 is thursday
  const nearestThursday = new Date(date.getTime() + nearestThursdayDiff * 24 * 3600 * 1000);

  const firstOfJanuary = new Date(0, 0);
  firstOfJanuary.setFullYear(nearestThursday.getFullYear());

  const timeDiff = nearestThursday.getTime() - firstOfJanuary.getTime();

  // Rounding the result, as the division doesn't result in an integer
  // when the given date is inside daylight saving time period.
  const daysSinceFirstOfJanuary = Math.round(timeDiff / (24 * 3600 * 1000));

  return Math.floor(daysSinceFirstOfJanuary / 7 + 1);
};
