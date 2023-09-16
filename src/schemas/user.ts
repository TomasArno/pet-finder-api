import { z } from "zod";

const userSchema = z.object({
  email: z
    .string({
      required_error: "Name is required",
    })
    .email("The Email must be valid")
    .nonempty("email can NOT be empty"),
  password: z
    .string({
      required_error: "Password is required",
      invalid_type_error: "Password must be a string",
    })
    .nonempty("Password can NOT be empty"),
});

export function validateUser(prodSchema: {}) {
  return userSchema.safeParse(prodSchema);
}
