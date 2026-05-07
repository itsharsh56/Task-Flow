/* eslint-disable react-hooks/set-state-in-effect */
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { closestCorners, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link, useSearchParams } from 'react-router-dom'
import { TaskColumn } from '../components/tasks/TaskColumn'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { projectsService } from '../services/projects/projects.service'
import { tasksService } from '../services/tasks/tasks.service'
import { useAuthStore } from '../store/auth.store'
import { getApiErrorMessage } from '../utils/http'
import { buildTaskPayload, groupTasksByStatus } from '../utils/tasks'
import { taskFormSchema } from '../validations/task.schema'

const columnTitles = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
}

export default function KanbanBoardPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [columns, setColumns] = useState({
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  })

  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const selectedProjectId = searchParams.get('projectId') ?? ''

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getProjects,
  })

  const boardTasksQuery = useQuery({
    queryKey: ['board-tasks', selectedProjectId],
    queryFn: () =>
      tasksService.getTasks({
        projectId: Number(selectedProjectId),
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
      }),
    enabled: Boolean(selectedProjectId),
  })

  useEffect(() => {
    const projects = projectsQuery.data?.data ?? []

    if (!selectedProjectId && projects.length > 0) {
      setSearchParams({ projectId: String(projects[0].id) })
    }
  }, [projectsQuery.data, selectedProjectId, setSearchParams])

  useEffect(() => {
    const tasks = boardTasksQuery.data?.data?.items ?? []
    setColumns(groupTasksByStatus(tasks))
  }, [boardTasksQuery.data])

  const createTaskForm = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      assignedToId: '',
      priority: 'MEDIUM',
      dueDate: '',
    },
  })

  const createTaskMutation = useMutation({
    mutationFn: (values) =>
      tasksService.createTask(
        buildTaskPayload(values, {
          projectId: Number(selectedProjectId),
        }),
      ),
    onSuccess: async (response) => {
      toast.success(response.message)
      createTaskForm.reset({
        title: '',
        description: '',
        assignedToId: '',
        priority: 'MEDIUM',
        dueDate: '',
      })

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create task'))
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }) =>
      tasksService.updateTaskStatus(taskId, { status }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['board-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['my-tasks'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ])
    },
    onError: async (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to move task'))
      await queryClient.invalidateQueries({ queryKey: ['board-tasks'] })
    },
  })

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over) return

    const activeTask = active.data.current?.task
    const overData = over.data.current

    const nextStatus =
      overData?.type === 'column'
        ? overData.status
        : overData?.type === 'task'
          ? overData.task.status
          : null

    if (!activeTask || !nextStatus || nextStatus === activeTask.status) {
      return
    }

    setColumns((current) => {
      const withoutActive = {
        TODO: current.TODO.filter((task) => task.id !== activeTask.id),
        IN_PROGRESS: current.IN_PROGRESS.filter((task) => task.id !== activeTask.id),
        DONE: current.DONE.filter((task) => task.id !== activeTask.id),
      }

      return {
        ...withoutActive,
        [nextStatus]: [
          { ...activeTask, status: nextStatus },
          ...withoutActive[nextStatus],
        ],
      }
    })

    statusMutation.mutate({
      taskId: activeTask.id,
      status: nextStatus,
    })
  }

  const projects = projectsQuery.data?.data ?? []
  const isAdmin = user?.role === 'ADMIN'

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Board
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Kanban board
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Drag tasks between columns to update status instantly.
            </p>
          </div>

          {selectedProjectId && (
            <Link to={`/projects/${selectedProjectId}`}>
              <Button variant="secondary">Open Project Details</Button>
            </Link>
          )}
        </div>

        <div className="mt-6 max-w-sm">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-200">Select Project</span>
            <select
              value={selectedProjectId}
              onChange={(event) => setSearchParams({ projectId: event.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
            >
              {projects.length === 0 ? (
                <option value="">No projects available</option>
              ) : (
                projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.title}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>
      </div>

      {isAdmin && selectedProjectId && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Create Task</h3>
          <p className="mt-2 text-sm text-slate-400">
            Use numeric user IDs for assignment. New tasks are created in the selected project.
          </p>

          <form
            onSubmit={createTaskForm.handleSubmit((values) => createTaskMutation.mutate(values))}
            className="mt-5 grid gap-4 lg:grid-cols-2"
          >
            <Input
              label="Title"
              error={createTaskForm.formState.errors.title?.message}
              {...createTaskForm.register('title')}
            />

            <Input
              label="Assigned User ID"
              type="number"
              error={createTaskForm.formState.errors.assignedToId?.message}
              {...createTaskForm.register('assignedToId')}
            />

            <div className="lg:col-span-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Description</span>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                  {...createTaskForm.register('description')}
                />
                {createTaskForm.formState.errors.description?.message && (
                  <p className="text-sm text-rose-300">
                    {createTaskForm.formState.errors.description.message}
                  </p>
                )}
              </label>
            </div>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-200">Priority</span>
              <select
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none"
                {...createTaskForm.register('priority')}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </label>

            <Input
              label="Due Date"
              type="datetime-local"
              error={createTaskForm.formState.errors.dueDate?.message}
              {...createTaskForm.register('dueDate')}
            />

            <div className="lg:col-span-2">
              <Button type="submit" isLoading={createTaskMutation.isPending}>
                Create Task
              </Button>
            </div>
          </form>
        </div>
      )}

      {!selectedProjectId || projectsQuery.isLoading || boardTasksQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-[540px]" />
          ))}
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 xl:grid-cols-3">
            {Object.entries(columnTitles).map(([status, title]) => (
              <TaskColumn key={status} title={title} status={status} tasks={columns[status] ?? []} />
            ))}
          </div>
        </DndContext>
      )}
    </section>
  )
}
