import z from "zod";

export const decideIssueSchema = z.object({
  id: z.string().min(1, 'Issue id is required'),
  decision: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "REJECTED"]),
  priority: z.enum(["LOW", "MEDIUM", "MEDIUM_HIGH", "HIGH"]),
});
export const decideStaffSchema = z.object({
  id: z.string().min(1, 'Issue id is required'),
  decision: z.enum(["ACCEPTED", "REJECTED", "SUSPENDED"]),
});
export const assigningIssueSchema = z.object({
  id: z.string().min(1, 'Issue id is required'),
  staffId: z.string().min(1, 'Staff id is required'),
});

