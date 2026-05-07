import { Badge } from '../ui/Badge'

const toneMap = {
  LOW: 'info',
  MEDIUM: 'warning',
  HIGH: 'danger',
}

export function TaskPriorityBadge({ priority }) {
  return <Badge tone={toneMap[priority] ?? 'neutral'}>{priority}</Badge>
}
