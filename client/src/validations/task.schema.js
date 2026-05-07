import { z } from 'zod'

const optionalPositiveIntString = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '')
  .refine(
    (value) => value === '' || (/^\d+$/.test(value) && Number(value) > 0),
    'Enter a valid user ID',
  )

const optionalDateTimeString = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? '')
  .refine(
    (value) => value === '' || !Number.isNaN(new Date(value).getTime()),
    'Enter a valid date',
  )

export const taskFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000),
  assignedToId: optionalPositiveIntString,
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: optionalDateTimeString,
})

export const commentSchema = z.object({
  message: z.string().min(1, 'Comment cannot be empty').max(2000),
})
