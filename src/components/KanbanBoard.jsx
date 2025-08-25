import React, { useEffect, useMemo, useState, useRef } from "react";
import { RefreshCw } from "lucide-react";
import Column from "./Column";
import TaskModal from "./TaskModal";
import { defaultColumns, uid } from "../utils/kanban";

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

  useEffect(() => {
    try {
      localStorage.setItem("kanban-columns", JSON.stringify(columns));
    } catch {}
  }, [columns]);

  useEffect(() => {
    if (showInput && inputRef.current) inputRef.current.focus();
  }, [showInput]);

  const columnList = useMemo(() => Object.values(columns), [columns]);

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
      return {
        ...prev,
        [fromCol]: { ...prev[fromCol], items: sourceItems },
        [toCol]: { ...prev[toCol], items: targetItems },
      };
    });
  }

  function handleDragStart(e, fromCol, taskId) {
    const payload = JSON.stringify({ taskId, fromCol });
    e.dataTransfer.setData("text/plain", payload);
    e.dataTransfer.effectAllowed = "move";
    setDragData({ taskId, fromCol });
    setDraggingId(taskId);
  }

  function handleDragOver(e, toCol) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOverCol(toCol);
  }

  function handleDragLeave() {
    setOverCol(null);
  }

  function handleDrop(e, toCol) {
    e.preventDefault();
    let payload;
    try {
      payload = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      payload = dragData;
    }
    if (payload?.taskId && payload?.fromCol) moveTask(payload.taskId, payload.fromCol, toCol);
    setDraggingId(null);
    setDragData(null);
    setOverCol(null);
  }

  function resetBoard() {
    setColumns(defaultColumns());
    setNewTask("");
  }

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
            <Column
              key={col.id}
              column={col}
              isOver={overCol === col.id}
              showInput={showInput}
              toggleInput={() => setShowInput(!showInput)}
              newTask={newTask}
              setNewTask={setNewTask}
              addTask={addTask}
              handleDragStart={handleDragStart}
              handleDragOver={handleDragOver}
              handleDragLeave={handleDragLeave}
              handleDrop={handleDrop}
              deleteTask={deleteTask}
              setSelectedTask={setSelectedTask}
              draggingId={draggingId}
              inputRef={inputRef}
            />
          ))}
        </main>

        {/* Modal */}
        <TaskModal
          task={selectedTask}
          setTask={setSelectedTask}
          onClose={() => setSelectedTask(null)}
          onSave={(task) => {
            updateTask(task.colId, task.id, task);
            setSelectedTask(null);
          }}
        />

        <footer className="mt-8 text-center text-xs text-slate-500">Данные сохраняются в браузере (LocalStorage).</footer>
      </div>
    </div>
  );
}
