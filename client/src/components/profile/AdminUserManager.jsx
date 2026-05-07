import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { usersService } from '../../services/users/users.service'
import { useAuthStore } from '../../store/auth.store'
import { formatDateTime } from '../../utils/format'
import { getApiErrorMessage } from '../../utils/http'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Skeleton } from '../ui/Skeleton'

function getRoleTone(role) {
  return role === 'ADMIN' ? 'info' : 'neutral'
}

export function AdminUserManager() {
  const queryClient = useQueryClient()
  const currentUser = useAuthStore((state) => state.user)

  const usersQuery = useQuery({
    queryKey: ['users'],
    queryFn: usersService.getUsers,
    staleTime: 30_000,
  })

  const roleMutation = useMutation({
    mutationFn: ({ id, role }) => usersService.updateRole(id, { role }),
    onSuccess: async (response) => {
      toast.success(`${response.message}. The updated user should log in again.`)
      await queryClient.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to update role'))
    },
  })

  if (usersQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    )
  }

  if (usersQuery.isError) {
    return (
      <div className="rounded-3xl border border-rose-400/20 bg-rose-400/8 p-6">
        <h3 className="text-lg font-semibold text-white">Users failed to load</h3>
        <p className="mt-3 text-sm text-slate-300">
          Make sure you are logged in as an admin.
        </p>
      </div>
    )
  }

  const users = usersQuery.data?.data ?? []

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6">
      <h3 className="text-xl font-semibold text-white">User Role Management</h3>
      <p className="mt-2 text-sm text-slate-400">
        Promote or demote users without touching MySQL manually.
      </p>

      <div className="mt-5 space-y-4">
        {users.map((user) => {
          const isCurrentUser = user.id === currentUser?.id

          return (
            <div
              key={user.id}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium text-white">{user.name}</p>
                  <p className="mt-2 text-sm text-slate-400">{user.email}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                    Joined {formatDateTime(user.createdAt)}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge tone={getRoleTone(user.role)}>{user.role}</Badge>

                  {isCurrentUser ? (
                    <span className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      Current User
                    </span>
                  ) : user.role === 'MEMBER' ? (
                    <Button
                      isLoading={roleMutation.isPending}
                      onClick={() =>
                        roleMutation.mutate({ id: user.id, role: 'ADMIN' })
                      }
                    >
                      Make Admin
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-amber-200 hover:bg-amber-400/10 hover:text-amber-100"
                      isLoading={roleMutation.isPending}
                      onClick={() =>
                        roleMutation.mutate({ id: user.id, role: 'MEMBER' })
                      }
                    >
                      Make Member
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
