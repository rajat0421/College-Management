function utcDayStartMs(date) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

function buildDayPresentMap(records) {
  const m = new Map();
  for (const r of records) {
    const k = utcDayStartMs(r.date);
    if (!m.has(k)) m.set(k, false);
    if (r.status === 'present') m.set(k, true);
  }
  return m;
}

function consecutiveAbsentCalendarDays(records) {
  const dayMap = buildDayPresentMap(records);
  const days = Array.from(dayMap.keys()).sort((a, b) => b - a);
  let streak = 0;
  for (const k of days) {
    if (dayMap.get(k)) break;
    streak++;
  }
  return streak;
}

module.exports = {
  utcDayStartMs,
  buildDayPresentMap,
  consecutiveAbsentCalendarDays,
};
