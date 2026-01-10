import { z } from 'zod';

export const createIssueSchema = z.object({
  name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imgUrl: z.string().optional(),
  
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

