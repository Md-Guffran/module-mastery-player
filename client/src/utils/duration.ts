/**
 * Utility functions for duration formatting and conversion
 */

/**
 * Formats seconds into MM:SS format
 * @param seconds - Duration in seconds
 * @returns Formatted string like "5:30"
 */
export const formatDurationMMSS = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : `${remainingSeconds}`;
  return `${minutes}:${formattedSeconds}`;
};

/**
 * Formats seconds into minutes with decimal precision
 * @param seconds - Duration in seconds
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted string like "5.5 min"
 */
export const formatDurationMinutes = (seconds: number, precision: number = 1): string => {
  if (seconds <= 0) return 'N/A';
  return `${(seconds / 60).toFixed(precision)} min`;
};

/**
 * Converts minutes to seconds
 * @param minutes - Duration in minutes
 * @returns Duration in seconds
 */
export const minutesToSeconds = (minutes: number): number => {
  return Math.round(minutes * 60);
};

/**
 * Converts seconds to minutes
 * @param seconds - Duration in seconds
 * @returns Duration in minutes
 */
export const secondsToMinutes = (seconds: number): number => {
  return seconds / 60;
};

