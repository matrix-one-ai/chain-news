/**
 * Converts UTC datetime string into a formatted local datetime string.
 * @param utcDateString - The UTC datetime string in ISO format (e.g., "2024-11-12T14:38:38.000Z").
 * @returns A formatted string in the format "DD MMM, HH:mm" (e.g., "12 NOV, 14:38").
 */
export function formatToLocalDateTime(utcDateString: string): string {
  // Parse the UTC date string into a Date object
  const date = new Date(utcDateString);

  // Format the date to the desired output using Intl.DateTimeFormat
  const day = new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("en-US", { month: "short" })
    .format(date)
    .toUpperCase();
  const time = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  }).format(date);

  // Combine the parts into the final string
  return `${day} ${month}, ${time}`;
}
