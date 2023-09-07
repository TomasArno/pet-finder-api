import { z } from "zod";

const userSchema = z.object({
  email: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  password: z.string({
    required_error: "Password is required",
    invalid_type_error: "Password must be a string",
  }),
});

export function validateUser(prodSchema: {}) {
  return userSchema.safeParse(prodSchema);
}
