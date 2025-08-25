import React, { useEffect } from "react";
import { X } from "lucide-react";
import { motion } from "framer-motion";

export default function TaskModal({ task, setTask, onClose, onSave }) {
  useEffect(() => {
    function onKey(e) {
      if (!task) return;
      if (e.key === "Escape") onClose();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        onSave(task);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [task, onClose, onSave]);

  if (!task) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        className="relative w-full max-w-xl rounded-3xl bg-white/70 backdrop-blur-2xl ring-1 ring-white/60 shadow-2xl p-6"
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-slate-500 hover:text-slate-700" aria-label="Закрыть модалку">
          <X className="h-5 w-5" />
        </button>
        <h3 className="text-xl font-bold mb-4 text-slate-900">Редактирование задачи</h3>
        <div className="flex flex-col gap-4">
          <input
            className="rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 text-base focus:ring"
            value={task.text}
            onChange={(e) => setTask({ ...task, text: e.target.value })}
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Приоритет</label>
              <select
                className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2"
                value={task.priority || "normal"}
                onChange={(e) => setTask({ ...task, priority: e.target.value })}
              >
                <option value="low">Низкий</option>
                <option value="normal">Обычный</option>
                <option value="high">Высокий</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Дедлайн</label>
              <input
                type="datetime-local"
                step="60"
                className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2"
                value={task.deadline || ""}
                onChange={(e) => setTask({ ...task, deadline: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Описание</label>
            <textarea
              className="w-full rounded-xl border border-slate-300/70 bg-white/70 px-3 py-2 min-h-[120px]"
              value={task.description || ""}
              onChange={(e) => setTask({ ...task, description: e.target.value })}
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between text-xs text-slate-500">
          <div>↩︎ Ctrl/⌘+S — сохранить · Esc — закрыть</div>
          <button
            onClick={() => onSave(task)}
            className="rounded-xl bg-slate-900 px-5 py-2 text-white font-medium hover:bg-slate-800 motion-safe:transition"
          >
            Сохранить
          </button>
        </div>
      </motion.div>
    </div>
  );
}
