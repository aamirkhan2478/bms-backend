import { z } from "zod";

const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required!" })
    .regex(/^(?=.{3,70}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/, {
      message:
        "Name should have at least 3 characters, not any number and first letter capital!",
    }),
  email: z.string().email(),
  password: z
    .string({ required_error: "Password is required!" })
    .regex(
      /^(?=.*[0-9])(?=.*[A-Z ])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&* ]{8,20}$/,
      {
        message:
          "Password must contain at least 8 characters, 1 number, 1 upper, 1 lowercase and 1 special character!",
      }
    ),
  role: z.enum(["super-admin", "admin", "user"]).default("user"),
});

export default registerSchema;
