/**
 * Utility function to convert 24-hour time string (e.g. "15:21") to 12-hour format (e.g. "3:21 م" or "3:21 PM")
 */
export function formatTime12(time24: string, isEn: boolean = false): string {
  if (!time24 || typeof time24 !== 'string' || !time24.includes(':')) {
    return time24 || '';
  }

  const parts = time24.split(':');
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1] ? parts[1].substring(0, 2) : '00';

  if (isNaN(hours)) {
    return time24;
  }

  const isPM = hours >= 12;
  const period = isEn ? (isPM ? 'PM' : 'AM') : (isPM ? 'م' : 'ص');

  hours = hours % 12;
  if (hours === 0) {
    hours = 12;
  }

  // Preserve formatted output: "3:21 م" or "3:21 PM"
  return `${hours}:${minutes} ${period}`;
}
