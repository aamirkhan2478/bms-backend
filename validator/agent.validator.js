import { z } from "zod";

const agentSchema = z.object({
  name: z
    .string({ required_error: "Name is required!" })
    .regex(/^(?=.{3,70}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/, {
      message:
        "Name should have at least 3 characters, not any number and first letter capital!",
    }),
});

export default agentSchema;
