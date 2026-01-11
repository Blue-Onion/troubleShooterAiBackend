import { z } from 'zod';

export const createIssueSchema = z.object({
  name: z.string().max(100, 'Name must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  imgUrl: z.string().optional(),
  
});


