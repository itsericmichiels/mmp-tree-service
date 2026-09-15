// lib/formatDate.ts
// Renders a stored "YYYY-MM-DD" post date as "Month Day, Year" for display.
// Parsed with an explicit UTC time and formatted in the UTC time zone so the
// day never shifts based on the viewer's or server's local time zone.
export function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
