function matchCronField(field: string, value: number): boolean {
  if (field === "*") {
    return true;
  }

  if (/^\d+$/.test(field)) {
    return Number.parseInt(field, 10) === value;
  }

  if (field.startsWith("*/")) {
    const step = Number.parseInt(field.slice(2), 10);
    return step > 0 && value % step === 0;
  }

  return false;
}

export function shouldRunCron(expression: string, date = new Date()): boolean {
  const parts = expression.trim().split(/\s+/);
  if (parts.length !== 5) {
    return false;
  }

  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

  return (
    matchCronField(minute, date.getMinutes()) &&
    matchCronField(hour, date.getHours()) &&
    matchCronField(dayOfMonth, date.getDate()) &&
    matchCronField(month, date.getMonth() + 1) &&
    matchCronField(dayOfWeek, date.getDay())
  );
}

export function getScheduledPlaybooks(
  playbooks: Array<{ id: string; trigger: { type: string; event: string } }>,
  enabledIds: string[],
  date = new Date(),
): string[] {
  return playbooks
    .filter(
      (playbook) =>
        enabledIds.includes(playbook.id) &&
        playbook.trigger.type === "schedule" &&
        shouldRunCron(playbook.trigger.event, date),
    )
    .map((playbook) => playbook.id);
}
