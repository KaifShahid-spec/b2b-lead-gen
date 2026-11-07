import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(1)
});
