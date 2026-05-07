import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChartsPanel } from '../components/dashboard/ChartsPanel'
import { EmptyState } from '../components/common/EmptyState'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { dashboardService } from '../services/dashboard/dashboard.service'
import { formatDate, formatDateTime } from '../utils/format'

function TaskList({ title, items }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            description="This section will fill automatically as tasks and deadlines are created."
          />
        ) : (
          items.map((task) => (
            <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{task.title}</p>
                  <p className="mt-2 text-sm text-slate-400">Due: {formatDate(task.dueDate)}</p>
                </div>

                <Badge tone={task.isOverdue ? 'danger' : task.status === 'DONE' ? 'success' : 'info'}>
                  {task.status}
                </Badge>
              </div>

              <div className="mt-4">
                <Link to={`/tasks/${task.id}`}>
                  <Button variant="secondary">Open Task</Button>
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const dashboardQuery = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: dashboardService.getStats,
    staleTime: 60_000,
  })

  if (dashboardQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          <Skeleton className="h-96" />
          <Skeleton className="h-96" />
        </div>
      </div>
    )
  }

  if (dashboardQuery.isError) {
    return (
      <EmptyState
        title="Dashboard failed to load"
        description="Please confirm the backend is running and your session is still valid."
        action={<Button onClick={() => dashboardQuery.refetch()}>Retry</Button>}
      />
    )
  }

  const data = dashboardQuery.data.data
  const stats = data.stats

  const statCards = [
    { label: 'Total Tasks', value: stats.totalTasks },
    { label: 'Completed', value: stats.completedTasks },
    { label: 'Pending', value: stats.pendingTasks },
    { label: 'Overdue', value: stats.overdueTasks },
    { label: 'Projects', value: stats.totalProjects },
    { label: 'Completion', value: `${stats.completionPercentage}%` },
  ]

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Live Overview
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Team command center
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          Your dashboard now combines real metrics, visual analytics, deadlines, and activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {statCards.map((item) => (
          <div key={item.label} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
            <p className="text-sm text-slate-400">{item.label}</p>
            <p className="mt-4 text-3xl font-semibold text-white">{item.value}</p>
          </div>
        ))}
      </div>

      <ChartsPanel
        statusAnalytics={data.statusAnalytics}
        priorityAnalytics={data.priorityAnalytics}
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>

          <div className="mt-5 space-y-4">
            {data.recentActivity.length === 0 ? (
              <EmptyState
                title="No activity recorded yet"
                description="Create projects, assign tasks, or update statuses to populate this feed."
              />
            ) : (
              data.recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {activity.performedBy?.name ?? 'Unknown user'} • {formatDateTime(activity.createdAt)}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3">
                    {activity.task?.id ? (
                      <Link to={`/tasks/${activity.task.id}`}>
                        <Button variant="ghost">View Task</Button>
                      </Link>
                    ) : null}

                    {activity.project?.id ? (
                      <Link to={`/projects/${activity.project.id}`}>
                        <Button variant="secondary">View Project</Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <TaskList title="Upcoming Deadlines" items={data.upcomingDeadlines} />
      </div>

      <TaskList title="Assigned Tasks" items={data.assignedTasks} />
    </section>
  )
}
