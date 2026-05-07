import { z } from 'zod'

export const createProjectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000),
})

export const addProjectMemberSchema = z.object({
  userId: z.coerce.number().int().positive('Enter a valid user ID'),
  role: z.enum(['ADMIN', 'MEMBER']),
})
