import clsx from 'clsx'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CalendarDays } from 'lucide-react'
import { formatDate } from '../../utils/format'
import { TaskPriorityBadge } from './TaskPriorityBadge'

export function TaskCard({ task }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: task.id,
      data: {
        type: 'task',
        task,
      },
    })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'rounded-2xl border border-white/10 bg-slate-900/90 p-4 shadow-[0_16px_40px_rgba(2,6,23,0.34)] transition',
        isDragging && 'rotate-1 opacity-80',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-sm font-semibold text-white">{task.title}</h4>
        <TaskPriorityBadge priority={task.priority} />
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-300">
        {task.description}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-slate-400">
        <span>#{task.id}</span>

        <span className="inline-flex items-center gap-2">
          <CalendarDays className="h-3.5 w-3.5" />
          {formatDate(task.dueDate)}
        </span>
      </div>
    </div>
  )
}
