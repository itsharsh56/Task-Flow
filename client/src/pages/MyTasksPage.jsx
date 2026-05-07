import { useDeferredValue, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { SearchBar } from '../components/ui/SearchBar'
import { Skeleton } from '../components/ui/Skeleton'
import { Button } from '../components/ui/Button'
import { TaskPriorityBadge } from '../components/tasks/TaskPriorityBadge'
import { TaskStatusBadge } from '../components/tasks/TaskStatusBadge'
import { tasksService } from '../services/tasks/tasks.service'
import { useAuthStore } from '../store/auth.store'
import { formatDate } from '../utils/format'

export default function MyTasksPage() {
  const user = useAuthStore((state) => state.user)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [priority, setPriority] = useState('ALL')
  const [overdueOnly, setOverdueOnly] = useState(false)
  const [page, setPage] = useState(1)

  const deferredSearch = useDeferredValue(search)

  const tasksQuery = useQuery({
    queryKey: ['my-tasks', user?.id, deferredSearch, status, priority, overdueOnly, page],
    queryFn: () =>
      tasksService.getTasks({
        assignedToId: user?.id,
        search: deferredSearch || undefined,
        status: status === 'ALL' ? undefined : status,
        priority: priority === 'ALL' ? undefined : priority,
        overdue: overdueOnly ? true : undefined,
        page,
        limit: 10,
        sortBy: 'dueDate',
        sortOrder: 'ASC',
      }),
    enabled: Boolean(user?.id),
  })

  const items = tasksQuery.data?.data?.items ?? []
  const meta = tasksQuery.data?.data?.meta

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Assigned Work
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          My tasks
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          This view is now powered by the real task API with filtering, search, and pagination.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <SearchBar
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search by title or description"
          className="lg:col-span-2"
        />

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="ALL">All Statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>

        <select
          value={priority}
          onChange={(event) => {
            setPriority(event.target.value)
            setPage(1)
          }}
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
        >
          <option value="ALL">All Priorities</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button
          variant={overdueOnly ? 'primary' : 'secondary'}
          onClick={() => {
            setOverdueOnly((value) => !value)
            setPage(1)
          }}
        >
          {overdueOnly ? 'Showing Overdue Only' : 'Show Overdue Only'}
        </Button>
      </div>

      {tasksQuery.isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-40" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
          No tasks found for the current filters.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((task) => (
            <div key={task.id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-lg font-semibold text-white">{task.title}</p>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
                    {task.description}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                    <span>Due: {formatDate(task.dueDate)}</span>
                    <span>Project ID: {task.projectId}</span>
                    <span>Task ID: #{task.id}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <TaskPriorityBadge priority={task.priority} />
                  <TaskStatusBadge status={task.status} />
                </div>
              </div>

              <div className="mt-5">
                <Link to={`/tasks/${task.id}`}>
                  <Button variant="secondary">Open Task</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/60 p-4">
          <p className="text-sm text-slate-400">
            Page {meta.page} of {meta.totalPages}
          </p>

          <div className="flex gap-3">
            <Button
              variant="ghost"
              disabled={meta.page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>

            <Button
              variant="secondary"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
