const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDate(value) {
  if (!value) return 'No date'
  return dateFormatter.format(new Date(value))
}

export function formatDateTime(value) {
  if (!value) return 'No timestamp'
  return dateTimeFormatter.format(new Date(value))
}
