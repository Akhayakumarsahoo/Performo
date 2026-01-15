const unitMs: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60 * 1000,
  h: 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
};

export function parseDurationToMs(input: string, fallbackMs: number) {
  const match = /^([0-9]+)(ms|s|m|h|d)$/i.exec(input.trim());
  if (!match) return fallbackMs;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  const ms = unitMs[unit];
  return value * ms;
}
