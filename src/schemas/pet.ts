import { z } from "zod";

const petSchema = z.object({
  name: z.string({
    required_error: "Name is required",
    invalid_type_error: "Name must be a string",
  }),
  imgURL: z
    .string({
      required_error: "ImgUrl is required",
      invalid_type_error: "ImgUrl must be a string",
    })
    .url({
      message: "The URL must be valid",
    }),
  lat: z.number({
    required_error: "Lat is required",
    invalid_type_error: "Lat must be a number",
  }),
  lng: z.number({
    required_error: "Lng is required",
    invalid_type_error: "Lng must be a number",
  }),
});

export function validatePet(prodSchema: {}) {
  return petSchema.safeParse(prodSchema);
}
