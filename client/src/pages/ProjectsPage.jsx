import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import { projectsService } from '../services/projects/projects.service'
import { useAuthStore } from '../store/auth.store'
import { formatDate } from '../utils/format'
import { getApiErrorMessage } from '../utils/http'
import { createProjectSchema } from '../validations/project.schema'

export default function ProjectsPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)

  const projectsQuery = useQuery({
    queryKey: ['projects'],
    queryFn: projectsService.getProjects,
    staleTime: 30_000,
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const createProjectMutation = useMutation({
    mutationFn: projectsService.createProject,
    onSuccess: async (response) => {
      toast.success(response.message)
      reset()

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['projects'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] }),
      ])
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to create project'))
    },
  })

  const onSubmit = handleSubmit((values) => {
    createProjectMutation.mutate(values)
  })

  const projects = projectsQuery.data?.data ?? []

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
          Projects
        </p>
        <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
          Delivery workspace
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
          The project list now loads from your backend. Admins can create new projects directly here.
        </p>
      </div>

      {user?.role === 'ADMIN' && (
        <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
          <h3 className="text-xl font-semibold text-white">Create Project</h3>

          <form onSubmit={onSubmit} className="mt-5 grid gap-4 lg:grid-cols-2">
            <Input
              label="Title"
              placeholder="TaskFlow Backend"
              error={errors.title?.message}
              {...register('title')}
            />

            <div className="lg:col-span-2">
              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-200">Description</span>
                <textarea
                  rows={5}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-400/10"
                  placeholder="Describe the project scope, deliverables, and collaboration goals"
                  {...register('description')}
                />
                {errors.description?.message && (
                  <p className="text-sm text-rose-300">{errors.description.message}</p>
                )}
              </label>
            </div>

            <div className="lg:col-span-2">
              <Button type="submit" isLoading={createProjectMutation.isPending}>
                Create Project
              </Button>
            </div>
          </form>
        </div>
      )}

      {projectsQuery.isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-52" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
              No projects yet. Create one as an admin to start the workspace.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-300">{project.description}</p>
                  </div>

                  <Badge tone="info">#{project.id}</Badge>
                </div>

                <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-400">
                  <span>Owner: {project.createdBy?.name ?? 'Unknown'}</span>
                  <span>Members: {project.members?.length ?? 0}</span>
                  <span>Created: {formatDate(project.createdAt)}</span>
                </div>

                <div className="mt-6">
                  <Link to={`/projects/${project.id}`}>
                    <Button variant="secondary">Open Project</Button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  )
}
