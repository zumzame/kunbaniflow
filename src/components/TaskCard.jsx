import React from "react";
import { GripVertical, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { priorityTokens, deadlineClass, fmtDeadline } from "../utils/kanban";

export default function TaskCard({ colId, task, onDragStart, onDelete, onOpen, dragging }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 350, damping: 28, mass: 0.6 }}
    >
      <div
        draggable
        onDragStart={(e) => onDragStart(e, colId, task.id)}
        onDoubleClick={() => onOpen(task, colId)}
        className={`group relative rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-xl p-4 shadow hover:shadow-lg motion-safe:transition motion-safe:hover:-translate-y-0.5 ${dragging ? "opacity-60" : ""}`}
      >
        <div className="flex items-start gap-3">
          <GripVertical className="h-5 w-5 text-slate-400 mt-1" />
          <div className="flex-1 min-w-0 grid grid-cols-1 gap-2">
            <p className="font-medium text-slate-900 truncate">{task.text}</p>
            <div className="flex flex-wrap gap-2">
              {task.priority && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${priorityTokens[task.priority].badge}`}>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3h7l-1 2 1 2H5v10H3V3h2z"/></svg>
                  {task.priority}
                </span>
              )}
              {task.deadline && (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${deadlineClass(task.deadline)}`}>
                  <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2h1v2h6V2h1v2h2v14H4V4h2V2zm-1 6h10v8H5V8z"/></svg>
                  {fmtDeadline(task.deadline)}
                </span>
              )}
            </div>
          </div>
          <button onClick={() => onDelete(colId, task.id)} className="opacity-0 group-hover:opacity-100 transition inline-flex items-center gap-1 rounded-lg border border-slate-200/70 px-2 py-1 text-xs text-slate-600 hover:bg-slate-50" aria-label="Удалить задачу">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
