export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE']

export function buildTaskPayload(values, extra = {}) {
  const payload = {
    ...extra,
    title: values.title.trim(),
    description: values.description.trim(),
    priority: values.priority,
  }

  if (values.assignedToId?.trim()) {
    payload.assignedToId = Number(values.assignedToId)
  }

  if (values.dueDate?.trim()) {
    payload.dueDate = new Date(values.dueDate).toISOString()
  }

  return payload
}

export function groupTasksByStatus(tasks = []) {
  return {
    TODO: tasks.filter((task) => task.status === 'TODO'),
    IN_PROGRESS: tasks.filter((task) => task.status === 'IN_PROGRESS'),
    DONE: tasks.filter((task) => task.status === 'DONE'),
  }
}
