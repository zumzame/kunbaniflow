import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useEffect, useState } from 'react'
import { Button } from './components/ui/button'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'

type Status = 'todo' | 'in-progress' | 'done'
interface Task {
  id: string
  title: string
  description: string
  deadline: string
  status: Status
}

const columns: { id: Status; title: string }[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in-progress', title: 'In Progress' },
  { id: 'done', title: 'Done' }
]

function TaskCard({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: task.id })
  const style = {
    transform: transform ? CSS.Translate.toString(transform) : undefined
  }
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="mb-2 rounded-md bg-white p-3 shadow cursor-grab"
    >
      <h3 className="font-medium">{task.title}</h3>
      <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.description}</p>
      <p className="mt-2 text-xs text-gray-500">Due: {new Date(task.deadline).toLocaleString()}</p>
    </div>
  )
}

function Column({ status, tasks }: { status: Status; tasks: Task[] }) {
  const { setNodeRef } = useDroppable({ id: status })
  return (
    <div ref={setNodeRef} className="w-80 flex-shrink-0 rounded-lg bg-gray-200 p-4">
      <h2 className="mb-4 text-center text-lg font-semibold">{columns.find(c => c.id === status)?.title}</h2>
      {tasks.map(t => (
        <TaskCard key={t.id} task={t} />
      ))}
    </div>
  )
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const stored = localStorage.getItem('tasks')
    return stored ? JSON.parse(stored) : []
  })
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks))
  }, [tasks])

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event
    if (!over) return
    const status = over.id as Status
    setTasks(tasks => tasks.map(t => (t.id === active.id ? { ...t, status } : t)))
  }

  const addTask = () => {
    if (!title.trim() || !deadline) return
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      description,
      deadline,
      status: 'todo'
    }
    setTasks(prev => [...prev, newTask])
    setTitle('')
    setDescription('')
    setDeadline('')
  }

  return (
    <div className="mx-auto max-w-5xl p-4">
      <div className="mb-6 flex flex-col gap-2 md:flex-row">
        <Input
          placeholder="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <Textarea
          placeholder="Description"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />
        <Input
          type="datetime-local"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
        <Button onClick={addTask} className="md:self-end">
          Add Task
        </Button>
      </div>

      <DndContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto">
          {columns.map(col => (
            <Column
              key={col.id}
              status={col.id}
              tasks={tasks.filter(t => t.status === col.id)}
            />
          ))}
        </div>
      </DndContext>
    </div>
  )
}
