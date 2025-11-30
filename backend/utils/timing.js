// utils/timing.js
/**
 * windows = [{ start: '09:00', end: '11:30' }, ...]
 * returns true if now (server local time) is inside any window or if windows empty
 */
export function isNowInWindows(windows = []) {
  if (!windows || windows.length === 0) return true;
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  return windows.some((w) => {
    if (!w?.start || !w?.end) return false;
    const [hs, ms] = w.start.split(":").map(Number);
    const [he, me] = w.end.split(":").map(Number);
    const startMin = hs * 60 + ms;
    const endMin = he * 60 + me;
    return nowMin >= startMin && nowMin <= endMin;
  });
}
