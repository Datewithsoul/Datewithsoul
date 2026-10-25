type LabeledClassEvent = {
  name: string;
  date: Date;
  startTime: string;
  endTime: string;
};

/** "Matcha For Beginner 101 (25 ต.ค. 2569 10:00-12:00)": identifies one round in customer messages. */
export function formatClassEventLabel(event: LabeledClassEvent) {
  const date = event.date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
  return `${event.name} (${date} ${event.startTime}-${event.endTime})`;
}
