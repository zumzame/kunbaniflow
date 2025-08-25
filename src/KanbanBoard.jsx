import React, { useEffect, useMemo, useState, useRef } from "react";
import { Trash2, RefreshCw, GripVertical, Plus, X, Flag, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Kanban с современным UX/UI (тренды 2025)
// - Карточки с бейджами приоритета и дедлайна
// - Редактирование в центре экрана (модальное окно)
// - Плавные анимации и современная типографика

const defaultColumns = () => ({
  backlog: { id: "backlog", title: "Бэклог", items: [] },
  doing: { id: "doing", title: "В работе", items: [] },
  done: { id: "done", title: "Готово", items: [] },
});

function uid() {
  return `${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export default function KanbanBoard() {
  const [columns, setColumns] = useState(() => {
    try {
      const raw = localStorage.getItem("kanban-columns");
      if (raw) return JSON.parse(raw);
    } catch {}
    return defaultColumns();
  });
  const [newTask, setNewTask] = useState("");
  const [dragData, setDragData] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [showInput, setShowInput] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const inputRef = useRef(null);

  // ——— Persistence ———
  useEffect(() => {
    try { localStorage.setItem("kanban-columns", JSON.stringify(columns)); } catch {}
  }, [columns]);

  // ——— Autofocus for quick capture ———
  useEffect(() => { if (showInput && inputRef.current) inputRef.current.focus(); }, [showInput]);

  const columnList = useMemo(() => Object.values(columns), [columns]);

  // ——— Helpers ———
  function addTask() {
    const text = newTask.trim();
    if (!text) return;
    const task = {
      id: uid(),
      text,
      createdAt: Date.now(),
      priority: "normal",
      deadline: "",
      description: "",
    };
    setColumns((prev) => ({
      ...prev,
      backlog: { ...prev.backlog, items: [...prev.backlog.items, task] },
    }));
    setNewTask("");
    inputRef.current?.focus();
  }

  function deleteTask(colId, taskId) {
    setColumns((prev) => ({
      ...prev,
      [colId]: { ...prev[colId], items: prev[colId].items.filter((t) => t.id !== taskId) },
    }));
  }

  function updateTask(colId, taskId, updates) {
    setColumns((prev) => ({
      ...prev,
      [colId]: {
        ...prev[colId],
        items: prev[colId].items.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
      },
    }));
  }

  function moveTask(taskId, fromCol, toCol) {
    if (!fromCol || !toCol || fromCol === toCol) return;
    setColumns((prev) => {
      const sourceItems = [...prev[fromCol].items];
      const idx = sourceItems.findIndex((t) => t.id === taskId);
      if (idx === -1) return prev;
      const [task] = sourceItems.splice(idx, 1);
      const targetItems = [...prev[toCol].items, task];
      return { ...prev, [fromCol]: { ...prev[fromCol], items: sourceItems }, [toCol]: { ...prev[toCol], items: targetItems } };
    });
  }

  function handleDragStart(e, fromCol, taskId) {
    const payload = JSON.stringify({ taskId, fromCol });
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "move";
    setDragData({ taskId, fromCol });
    setDraggingId(taskId);
  }
  function handleDragOver(e, toCol) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; setOverCol(toCol); }
  function handleDragLeave() { setOverCol(null); }
  function handleDrop(e, toCol) {
    e.preventDefault();
    let payload; try { payload = JSON.parse(e.dataTransfer.getData("text/plain")); } catch { payload = dragData; }
    if (payload?.taskId && payload?.fromCol) moveTask(payload.taskId, payload.fromCol, toCol);
    setDraggingId(null); setDragData(null); setOverCol(null);
  }

  function resetBoard() { setColumns(defaultColumns()); setNewTask(""); }

  // ——— Visual tokens ———
  const priorityTokens = {
    low: { badge: "bg-gradient-to-r from-green-100 to-green-50 text-green-700 ring-1 ring-green-200" },
    normal: { badge: "bg-gradient-to-r from-slate-100 to-white text-slate-600 ring-1 ring-slate-200" },
    high: { badge: "bg-gradient-to-r from-rose-100 to-rose-50 text-rose-700 ring-1 ring-rose-200" },
  };

  // ——— Deadline helpers ———
  const deadlineClass = (dl) => {
    if (!dl) return "bg-blue-100 text-blue-700";
    const ms = new Date(dl).getTime() - Date.now();
    if (ms <= 0) return "bg-rose-100 text-rose-700"; // overdue
    if (ms < 48 * 3600 * 1000) return "bg-amber-100 text-amber-800"; // due soon
    return "bg-blue-100 text-blue-700";
  };

  const fmtDeadline = (dl) => {
    if (!dl) return "";
    const d = new Date(dl);
    if (isNaN(d.getTime())) return dl;
    return d.toLocaleString();
  };

  // ——— Keyboard: Esc to close modal, Enter to save ———
  useEffect(() => {
    function onKey(e) {
      if (!selectedTask) return;
      if (e.key === "Escape") setSelectedTask(null);
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        updateTask(selectedTask.colId, selectedTask.id, selectedTask);
        setSelectedTask(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedTask]);

  return (
    <div className="min-h-screen w-full bg-[radial-gradient(1200px_600px_at_0%_-10%,#e0f2fe,transparent),radial-gradient(1000px_500px_at_100%_10%,#e9d5ff,transparent)] p-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Канбан-доска</h1>
            <p className="text-slate-600">Минимализм, микровзаимодействия, прозрачные поверхности.</p>
          </div>
          <button onClick={resetBoard} className="inline-flex items-center gap-2 rounded-xl border border-slate-300/70 bg-white/80 px-4 py-2 text-slate-700 hover:bg-white shadow">
            <RefreshCw className="h-4 w-4" /> Сбросить
          </button>
        </header>

        {/* Columns */}
        <main className="mt-6 grid gap-4 sm:grid-cols-3">
          {columnList.map((col) => (
            <section
              key={col.id}
              aria-label={`Колонка ${col.title}`}
              className={`rounded-3xl p-4 ring-1 flex flex-col transition ${
                overCol === col.id ? "bg-white/90 ring-slate-300 shadow-md" : "bg-white/70 backdrop-blur-xl ring-white/60 shadow"
              }`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />{col.title}
                </h2>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-white">{col.items.length}</span>
                  {col.id === "backlog" && (
                    <button onClick={() => setShowInput(!showInput)} aria-label="Добавить задачу" className="inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-1 text-xs text-slate-600 hover:bg-white/90 shadow">
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {col.id === "backlog" && showInput && (
                <div className="mb-3 flex flex-col gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-3">
                  <input
                    ref={inputRef}
                    className="w-full rounded-lg border border-slate-200/70 px-3 py-2 outline-none focus:ring"
                    placeholder="Новая задача..."
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTask()}
                  />
                  <button onClick={addTask} className="self-end rounded-lg bg-slate-900 px-4 py-2 text-white text-sm shadow hover:shadow-md motion-safe:transition">
                    Добавить
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-3 min-h-[140px]">
                {col.items.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300/70 p-6 text-center text-slate-400">Перетащите сюда задачу</div>
                )}

                <AnimatePresence initial={false}>
                  {col.items.map((t) => (
                    <motion.article
                      key={t.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.6 }}
                    >
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, col.id, t.id)}
                        onDoubleClick={() => setSelectedTask({ ...t, colId: col.id })}
                        className={`group relative rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-4 shadow hover:shadow-lg motion-safe:transition motion-safe:hover:-translate-y-0.5 ${
                          draggingId === t.id ? "opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <GripVertical className="h-5 w-5 text-slate-400 mt-1" />
                          <div className="flex-1 min-w-0 grid grid-cols-1 gap-2">
                            <p className="font-medium text-slate-900 truncate">{t.text}</p>
                            <div className="flex flex-wrap gap-2">
                              {t.priority && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${priorityTokens[t.priority].badge}`}>
                                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h7l-1 2 1 2H5v10H3V3h2z"/></svg>
                                  {t.priority}
                                </span>
                              )}
                              {t.deadline && (
                                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${deadlineClass(t.deadline)}`}>
                                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2h1v2h6V2h1v2h2v14H4V4h2V2zm-1 6h10v8H5V8z"/></svg>
                                  {fmtDeadline(t.deadline)}
                                </span>
                              )}
                            </div>
                          </div>
                          <button onClick={() => deleteTask(col.id, t.id)} className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1 rounded-lg border border-slate-200/70 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50" aria-label="Удалить задачу">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.article>
                  ))}
                </AnimatePresence>
              </div>
            </section>
          ))}
        </main>

        {/* Center modal with glassmorphism */}
        {selectedTask && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSelectedTask(null)} />
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              className="relative w-full max-w-xl rounded-3xl bg-white/70 backdrop-blur-2xl ring-1 ring-white/60 shadow-2xl p-6"
            >
              <button onClick={() => setSelectedTask(null)} className="absolute top-3 right-3 text-slate-500 hover:text-slate-700" aria-label="Закрыть модалку">
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-bold mb-4 text-slate-900">Редактирование задачи</h3>
              <div className="flex flex-col gap-4">
                <input
                  className="rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-base focus:ring"
                  value={selectedTask.text}
                  onChange={(e) => setSelectedTask({ ...selectedTask, text: e.target.value })}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Приоритет</label>
                    <select
                      className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2"
                      value={selectedTask.priority || "normal"}
                      onChange={(e) => setSelectedTask({ ...selectedTask, priority: e.target.value })}
                    >
                      <option value="low">Низкий</option>
                      <option value="normal">Обычный</option>
                      <option value="high">Высокий</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Дедлайн</label>
                    <input
                      type="datetime-local" step="60"
                      className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2"
                      value={selectedTask.deadline || ""}
                      onChange={(e) => setSelectedTask({ ...selectedTask, deadline: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Описание</label>
                  <textarea
                    className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 min-h-[120px]"
                    value={selectedTask.description || ""}
                    onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
                <div>↩︎ Ctrl/⌘+S — сохранить · Esc — закрыть</div>
                <button
                  onClick={() => { updateTask(selectedTask.colId, selectedTask.id, selectedTask); setSelectedTask(null); }}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-white font-medium hover:bg-slate-800 motion-safe:transition"
                >
                  Сохранить
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-slate-500">Данные сохраняются в браузере (LocalStorage).</footer>
      </div>
    </div>
  );
}

