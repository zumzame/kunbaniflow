export const defaultColumns = () => ({
  backlog: { id: "backlog", title: "Бэклог", items: [] },
  doing: { id: "doing", title: "В работе", items: [] },
  done: { id: "done", title: "Готово", items: [] },
});

export function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export const priorityTokens = {
  low: { badge: "bg-gradient-to-r from-green-100 to-green-50 text-green-700 ring-1 ring-green-200" },
  normal: { badge: "bg-gradient-to-r from-slate-100 to-white text-slate-600 ring-1 ring-slate-200" },
  high: { badge: "bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 ring-1 ring-rose-200" },
};

export const deadlineClass = (dl) => {
  if (!dl) return "bg-blue-100 text-blue-700";
  const ms = new Date(dl).getTime() - Date.now();
  if (ms <= 0) return "bg-rose-100 text-rose-700"; // overdue
  if (ms < 48 * 3600 * 1000) return "bg-amber-100 text-amber-800"; // due soon
  return "bg-blue-100 text-blue-700";
};

export const fmtDeadline = (dl) => {
  if (!dl) return "";
  const d = new Date(dl);
  if (isNaN(d.getTime())) return dl;
  return d.toLocaleString();
};
