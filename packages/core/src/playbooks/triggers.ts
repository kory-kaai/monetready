import type { Playbook } from "./types.js";

type ConditionOperator = "==" | "!=" | ">=" | "<=" | ">" | "<";

function parseConditionValue(value: string): unknown {
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return Number(value);
  }
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function compareValues(left: unknown, right: unknown, operator: ConditionOperator): boolean {
  switch (operator) {
    case "==":
      return left === right;
    case "!=":
      return left !== right;
    case ">=":
      return Number(left) >= Number(right);
    case "<=":
      return Number(left) <= Number(right);
    case ">":
      return Number(left) > Number(right);
    case "<":
      return Number(left) < Number(right);
    default: {
      const _exhaustive: never = operator;
      return Boolean(_exhaustive);
    }
  }
}

export function evaluatePlaybookCondition(
  condition: string | undefined,
  properties: Record<string, unknown>,
): boolean {
  if (!condition?.trim()) {
    return true;
  }

  const match = condition.trim().match(/^([a-zA-Z0-9_.-]+)\s*(==|!=|>=|<=|>|<)\s*(.+)$/);
  if (!match) {
    return false;
  }

  const [, key, operator, rawValue] = match as [string, string, ConditionOperator, string];
  const left = properties[key];
  const right = parseConditionValue(rawValue.trim());

  return compareValues(left, right, operator);
}

export function findMatchingPlaybooks(
  playbooks: Playbook[],
  enabledPlaybookIds: string[],
  triggerType: Playbook["trigger"]["type"],
  event: string,
  properties: Record<string, unknown> = {},
): Playbook[] {
  return playbooks.filter(
    (playbook) =>
      enabledPlaybookIds.includes(playbook.id) &&
      playbook.trigger.type === triggerType &&
      playbook.trigger.event === event &&
      evaluatePlaybookCondition(playbook.trigger.condition, properties),
  );
}

export function getStripeEventMappings(
  playbooks: Playbook[],
): Array<{ event: string; playbookId: string }> {
  return playbooks
    .filter((playbook) => playbook.trigger.type === "stripe")
    .map((playbook) => ({
      event: playbook.trigger.event,
      playbookId: playbook.id,
    }));
}

export function getAnalyticsEventMappings(
  playbooks: Playbook[],
): Array<{ event: string; playbookId: string; condition?: string }> {
  return playbooks
    .filter((playbook) => playbook.trigger.type === "analytics")
    .map((playbook) => ({
      event: playbook.trigger.event,
      playbookId: playbook.id,
      condition: playbook.trigger.condition,
    }));
}
