import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { TaskPriorityBadge } from '../components/tasks/TaskPriorityBadge'
import { TaskStatusBadge } from '../components/tasks/TaskStatusBadge'
import { tasksService } from '../services/tasks/tasks.service'
import { useAuthStore } from '../store/auth.store'
import { formatDate, formatDateTime } from '../utils/format'
import { getApiErrorMessage } from '../utils/http'
import { buildTaskPayload, TASK_STATUSES } from '../utils/tasks'
import { commentSchema, taskFormSchema } from '../validations/task.schema'

export default function TaskDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const taskQuery = useQuery({
    queryKey: ['task', id],
    queryFn: () => tasksService.getTask(id),
    enabled: Boolean(id),
  })

  const commentsQuery = useQuery({
    queryKey: ['task-comments', id],
    queryFn: () => tasksService.getComments(id),
    enabled: Boolean(id),
  })

  const taskForm = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedToId: '',
      priority: 'MEDIUM',
      dueDate: '',
    },
  })

  const commentForm = useForm({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      message: '',
    },
  })

  useEffect(() => {
    const task = taskQuery.data?.data

    if (task) {
      taskForm.reset({
        title: task.title ?? '',
        description: task.description ?? '',
        assignedToId: task.assignedToId ? String(task.assignedToId) : '',
        priority: task.priority ?? 'MEDIUM',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 16)
          : '',
      })
    }
  }, [taskQuery.data, taskForm])

  const updateTaskMutation = useMutation({
    mutationFn: (values) => tasksService.updateTask(id, buildTaskPayload(values)),
    onSuccess: async (response) => {
      toast.success(response.message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task', id] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update task'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: (status) => tasksService.updateTaskStatus(id, { status }),
    onSuccess: async (response) => {
      toast.success(response.message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task', id] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update status'))
    },
  })

  const commentMutation = useMutation({
    mutationFn: (values) =>
      tasksService.createComment({
        taskId: Number(id),
        message: values.message,
      }),
    onSuccess: async (response) => {
      toast.success(response.message)
      commentForm.reset()
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['task-comments', id] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to add comment'))
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: () => tasksService.deleteTask(id),
    onSuccess: async (response) => {
      toast.success(response.message)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
      ])
      navigate('/my-tasks', { replace: true })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to delete task'))
    },
  })

  if (taskQuery.isLoading) {
    return <Skeleton className="h-[520px]" />
  }

  if (taskQuery.isError || !taskQuery.data?.data) {
    return (
      <div className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-6">
        <h2 className="text-xl font-semibold text-white">Task failed to load</h2>
        <p className="mt-3 text-sm text-slate-300">
          Please verify the task exists and that you have access to it.
        </p>
      </div>
    )
  }

  const task = taskQuery.data.data
  const comments = commentsQuery.data?.data ?? []
  const canEditTask = user?.role === 'ADMIN'
  const canChangeStatus = user?.role === 'ADMIN' || user?.id === task.assignedToId

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Task #{task.id}
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              {task.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              {task.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <TaskPriorityBadge priority={task.priority} />
            <TaskStatusBadge status={task.status} />
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-400">
          <span>Project ID: {task.projectId}</span>
          <span>Assigned To: {task.assignedTo?.name ?? 'Unassigned'}</span>
          <span>Created By: {task.createdBy?.name ?? 'Unknown'}</span>
          <span>Due: {formatDate(task.dueDate)}</span>
          <span>Created: {formatDateTime(task.createdAt)}</span>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link to={`/board?projectId=${task.projectId}`}>
            <Button variant="secondary">Open Project Board</Button>
          </Link>

          {task.isOverdue && <span className="text-sm font-medium text-rose-300">This task is overdue.</span>}
        </div>
      </div>

      {canChangeStatus && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Update Status</h3>
          <div className="mt-5 flex flex-wrap gap-3">
            {TASK_STATUSES.map((status) => (
              <Button
                key={status}
                variant={task.status === status ? 'primary' : 'secondary'}
                isLoading={statusMutation.isPending}
                onClick={() => statusMutation.mutate(status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      )}

      {canEditTask && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Edit Task</h3>
          <p className="mt-2 text-sm text-slate-400">
            Use numeric user IDs for reassignment. Clearing assignee or due date is not supported yet.
          </p>

          <form
            onSubmit={taskForm.handleSubmit((values) => updateTaskMutation.mutate(values))}
            className="mt-5 grid gap-4 lg:grid-cols-2"
          >
            <Input
              label="Title"
              error={taskForm.formState.errors.title?.message}
              {...taskForm.register('title')}
            />

            <Input
              label="Assigned User ID"
              type="number"
              error={taskForm.formState.errors.assignedToId?.message}
              {...taskForm.register('assignedToId')}
            />

            <div className="lg:col-span-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Description</span>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  {...taskForm.register('description')}
                />
                {taskForm.formState.errors.description?.message && (
                  <p className="text-sm text-rose-300">
                    {taskForm.formState.errors.description.message}
                  </p>
                )}
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Priority</span>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                {...taskForm.register('priority')}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>

            <Input
              label="Due Date"
              type="datetime-local"
              error={taskForm.formState.errors.dueDate?.message}
              {...taskForm.register('dueDate')}
            />

            <div className="lg:col-span-2 flex flex-wrap gap-3">
              <Button type="submit" isLoading={updateTaskMutation.isPending}>
                Save Changes
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-rose-300 hover:bg-rose-400/10 hover:text-rose-200"
                isLoading={deleteTaskMutation.isPending}
                onClick={() => {
                  const confirmed = window.confirm('Delete this task permanently from the active list?')

                  if (confirmed) {
                    deleteTaskMutation.mutate()
                  }
                }}
              >
                Delete Task
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
        <h3 className="text-xl font-semibold text-white">Comments</h3>

        <form
          onSubmit={commentForm.handleSubmit((values) => commentMutation.mutate(values))}
          className="mt-5 space-y-4"
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Add Comment</span>
            <textarea
              rows={4}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
              placeholder="Write an update, clarification, or blocker here"
              {...commentForm.register('message')}
            />
            {commentForm.formState.errors.message?.message && (
              <p className="text-sm text-rose-300">
                {commentForm.formState.errors.message.message}
              </p>
            )}
          </label>

          <Button type="submit" isLoading={commentMutation.isPending}>
            Post Comment
          </Button>
        </form>

        <div className="mt-6 space-y-4">
          {commentsQuery.isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-28" />
            ))
          ) : comments.length === 0 ? (
            <p className="text-sm text-slate-400">No comments yet.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-medium text-white">{comment.user?.name ?? 'Unknown user'}</p>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    {formatDateTime(comment.createdAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">{comment.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
