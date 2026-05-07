import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../components/common/EmptyState'
import { TaskPriorityBadge } from '../components/tasks/TaskPriorityBadge'
import { TaskStatusBadge } from '../components/tasks/TaskStatusBadge'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { activityService } from '../services/activity/activity.service'
import { projectsService } from '../services/projects/projects.service'
import { tasksService } from '../services/tasks/tasks.service'
import { useAuthStore } from '../store/auth.store'
import { formatDate, formatDateTime } from '../utils/format'
import { getApiErrorMessage } from '../utils/http'
import { addProjectMemberSchema } from '../validations/project.schema'

function getRoleTone(role) {
  return role === 'ADMIN' ? 'info' : 'neutral'
}

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const projectQuery = useQuery({
    queryKey: ['projects', id],
    queryFn: () => projectsService.getProject(id),
    enabled: Boolean(id),
  })

  const projectTasksQuery = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () =>
      tasksService.getTasks({
        projectId: Number(id),
        page: 1,
        limit: 8,
        sortBy: 'dueDate',
        sortOrder: 'ASC',
      }),
    enabled: Boolean(id),
  })

  const projectActivityQuery = useQuery({
    queryKey: ['project-activity', id],
    queryFn: () => activityService.getProjectActivity(id, { page: 1, limit: 10 }),
    enabled: Boolean(id),
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(addProjectMemberSchema),
    defaultValues: {
      userId: '',
      role: 'MEMBER',
    },
  })

  const addMemberMutation = useMutation({
    mutationFn: (values) => projectsService.addMember(id, values),
    onSuccess: async (response) => {
      toast.success(response.message)
      reset()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects', id] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['project-activity', id] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add member'))
    },
  })

  const removeMemberMutation = useMutation({
    mutationFn: (userId) => projectsService.removeMember(id, userId),
    onSuccess: async (response) => {
      toast.success(response.message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects', id] }),
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['project-activity', id] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to remove member'))
    },
  })

  const onSubmit = handleSubmit((values) => {
    addMemberMutation.mutate(values)
  })

  if (projectQuery.isLoading) {
    return <Skeleton className="h-[480px]" />
  }

  if (projectQuery.isError) {
    return (
      <EmptyState
        title="Project failed to load"
        description="Check the project ID and confirm your current user has access."
      />
    )
  }

  const project = projectQuery.data.data
  const tasks = projectTasksQuery.data?.data?.items ?? []
  const activities = projectActivityQuery.data?.data?.items ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Project #{project.id}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              {project.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              {project.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Badge tone="info">{project.members?.length ?? 0} Members</Badge>
            <Link to={`/board?projectId=${project.id}`}>
              <Button variant="secondary">Open Board</Button>
            </Link>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
          <span>Owner: {project.createdBy?.name ?? 'Unknown'}</span>
          <span>Created: {formatDate(project.createdAt)}</span>
        </div>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Add Member</h3>
          <p className="mt-2 text-sm text-slate-400">
            Use a numeric user ID for now until you add a user directory endpoint.
          </p>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4 md:grid-cols-3">
            <Input
              label="User ID"
              type="number"
              error={errors.userId?.message}
              {...register('userId')}
            />

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Role</span>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                {...register('role')}
              >
                <option value="MEMBER">MEMBER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>

            <div className="flex items-end">
              <Button type="submit" isLoading={addMemberMutation.isPending} className="w-full">
                Add Member
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Members</h3>

          <div className="mt-5 grid gap-4">
            {(project.members ?? []).map((member) => (
              <div key={member.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-white">{member.user?.name ?? 'Unknown user'}</p>
                    <p className="mt-2 text-sm text-slate-400">{member.user?.email ?? '-'}</p>
                  </div>

                  <Badge tone={getRoleTone(member.role)}>{member.role}</Badge>
                </div>

                {user?.role === 'ADMIN' && (
                  <div className="mt-5">
                    <Button
                      variant="ghost"
                      className="text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                      disabled={removeMemberMutation.isPending}
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Remove ${member.user?.name ?? 'this member'} from the project?`,
                        )

                        if (confirmed) {
                          removeMemberMutation.mutate(member.userId)
                        }
                      }}
                    >
                      Remove Member
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Recent Project Activity</h3>

          <div className="mt-5 space-y-4">
            {projectActivityQuery.isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24" />
              ))
            ) : activities.length === 0 ? (
              <EmptyState
                title="No activity yet"
                description="Assign members, create tasks, or update statuses to populate this feed."
              />
            ) : (
              activities.map((activity) => (
                <div key={activity.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white">{activity.action}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {activity.performedBy?.name ?? 'Unknown user'} • {formatDateTime(activity.createdAt)}
                  </p>

                  {activity.task?.id ? (
                    <div className="mt-4">
                      <Link to={`/tasks/${activity.task.id}`}>
                        <Button variant="secondary">Open Task</Button>
                      </Link>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-xl font-semibold text-white">Project Tasks</h3>
          <Link to={`/board?projectId=${project.id}`}>
            <Button variant="secondary">Manage On Board</Button>
          </Link>
        </div>

        <div className="mt-5 space-y-4">
          {projectTasksQuery.isLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))
          ) : tasks.length === 0 ? (
            <EmptyState
              title="No tasks yet"
              description="Create the first task from the board view and it will appear here."
            />
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{task.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">{task.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-400">
                      <span>Due: {formatDate(task.dueDate)}</span>
                      <span>Assigned: {task.assignedTo?.name ?? 'Unassigned'}</span>
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
            ))
          )}
        </div>
      </div>
    </section>
  )
}
