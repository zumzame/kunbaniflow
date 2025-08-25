import React from "react";
import { Plus } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import TaskCard from "./TaskCard";

export default function Column({
  column,
  isOver,
  showInput,
  toggleInput,
  newTask,
  setNewTask,
  addTask,
  handleDragStart,
  handleDragOver,
  handleDragLeave,
  handleDrop,
  deleteTask,
  setSelectedTask,
  draggingId,
  inputRef,
}) {
  const isBacklog = column.id === "backlog";
  return (
    <section
      aria-label={`Колонка ${column.title}`}
      className={`rounded-3xl p-4 ring-1 flex flex-col transition ${
        isOver ? "bg-white/90 ring-slate-300 shadow-md" : "bg-white/70 backdrop-blur-xl ring-white/60 shadow"
      }`}
      onDragOver={(e) => handleDragOver(e, column.id)}
      onDragLeave={handleDragLeave}
      onDrop={(e) => handleDrop(e, column.id)}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />{column.title}
        </h2>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-white">{column.items.length}</span>
          {isBacklog && (
            <button onClick={toggleInput} aria-label="Добавить задачу" className="inline-flex items-center gap-1 rounded-lg border border-slate-200/70 bg-white/80 px-2 py-1 text-xs text-slate-600 hover:bg-white/90 shadow">
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {isBacklog && showInput && (
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
        {column.items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300/70 p-6 text-center text-slate-400">Перетащите сюда задачу</div>
        )}

        <AnimatePresence initial={false}>
          {column.items.map((t) => (
            <TaskCard
              key={t.id}
              colId={column.id}
              task={t}
              onDragStart={handleDragStart}
              onDelete={deleteTask}
              onOpen={(task, colId) => setSelectedTask({ ...task, colId })}
              dragging={draggingId === t.id}
            />
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}
