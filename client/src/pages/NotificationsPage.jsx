import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import { notificationsService } from '../services/notifications/notifications.service'
import { formatDateTime } from '../utils/format'
import { getApiErrorMessage } from '../utils/http'

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  const notificationsQuery = useQuery({
    queryKey: ['notifications', { unreadOnly: showUnreadOnly }],
    queryFn: () =>
      notificationsService.getNotifications({
        isRead: showUnreadOnly ? false : undefined,
        page: 1,
        limit: 20,
      }),
    refetchInterval: 30_000,
  })

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to mark notification as read'))
    },
  })

  const markAllMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: async (response) => {
      toast.success(response.message)
      await queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Unable to mark all as read'))
    },
  })

  if (notificationsQuery.isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-28" />
        ))}
      </div>
    )
  }

  const payload = notificationsQuery.data?.data
  const items = payload?.items ?? []
  const unreadCount = payload?.meta?.unreadCount ?? 0

  return (
    <section className="space-y-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.04] p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
              Inbox
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-white">
              Notifications
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              This page is now reading live notifications from your backend.
            </p>
          </div>

          <Badge tone={unreadCount > 0 ? 'warning' : 'success'}>
            {unreadCount} Unread
          </Badge>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant={showUnreadOnly ? 'secondary' : 'primary'}
            onClick={() => setShowUnreadOnly(false)}
          >
            All
          </Button>

          <Button
            variant={showUnreadOnly ? 'primary' : 'secondary'}
            onClick={() => setShowUnreadOnly(true)}
          >
            Unread Only
          </Button>

          <Button
            variant="ghost"
            onClick={() => markAllMutation.mutate()}
            isLoading={markAllMutation.isPending}
          >
            Mark All Read
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/75 p-6 text-sm text-slate-300">
            No notifications available for this filter.
          </div>
        ) : (
          items.map((notification) => (
            <div key={notification.id} className="rounded-3xl border border-white/10 bg-slate-900/75 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm leading-7 text-white">{notification.message}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge tone={notification.isRead ? 'neutral' : 'warning'}>
                    {notification.isRead ? 'Read' : 'Unread'}
                  </Badge>

                  {!notification.isRead && (
                    <Button
                      variant="ghost"
                      isLoading={markAsReadMutation.isPending}
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                    >
                      Mark Read
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
