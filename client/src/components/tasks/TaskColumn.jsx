import clsx from 'clsx'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { TaskCard } from './TaskCard'

export function TaskColumn({ title, status, tasks }) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        'min-h-[520px] rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-4',
        isOver && 'border-cyan-300/40 bg-cyan-400/6',
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-300">
          {title}
        </h3>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-400">
          {tasks.length}
        </span>
      </div>

      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-3">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}
