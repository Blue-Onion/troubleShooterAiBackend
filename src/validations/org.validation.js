import { z } from "zod";

export const createOrgSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  address: z.string().min(1, "Address is required"),
  slug: z.string().optional(),
  jobCategories: z.array(
    z.object({ name: z.string().min(1, "Job category name is required") }),
  ),
  issueCategories: z.array(
    z.object({ name: z.string().min(1, "Issue category name is required") }),
  ),
});
export const joinOrgSchema = z.object({
  role: z.enum(["ADMIN", "STAFF", "MEMBER"]),
  jobCategoryId: z.string().optional(),
});
export const orgIdParamSchema = z.object({
  id: z.string().min(1, "Invalid organization id"),
});
