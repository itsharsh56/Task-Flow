import { Badge } from '../ui/Badge'

const toneMap = {
  TODO: 'neutral',
  IN_PROGRESS: 'info',
  DONE: 'success',
}

export function TaskStatusBadge({ status }) {
  return <Badge tone={toneMap[status] ?? 'neutral'}>{status}</Badge>
}
