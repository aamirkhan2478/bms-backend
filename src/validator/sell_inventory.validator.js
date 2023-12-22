import { z } from "zod";

const sellInventorySchema = z.object({
  inventories: z
    .array(
      z
        .object({
          inventory: z.string({ required_error: "Inventory ID is required!" }),
          purchaseDate: z
            .string({ required_error: "Purchase date is required!" })
            .refine((value) => {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

              if (!dateRegex.test(value)) {
                return {
                  success: false,
                  message: "Invalid date format. Please use YYYY-MM-DD.",
                };
              }

              return true;
            }),
        })
        .required({ message: "Inventory is required!" })
    )
    .nonempty({ message: "At least one inventory is required!" }),
  owners: z
    .array(
      z
        .object({
          owner: z.string({ required_error: "Owner ID is required!" }),
          purchaseDate: z
            .string({ required_error: "Purchase date is required!" })
            .refine((value) => {
              const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

              if (!dateRegex.test(value)) {
                return {
                  success: false,
                  message: "Invalid date format. Please use YYYY-MM-DD.",
                };
              }

              return true;
            }),
        })
        .required({ message: "Owner is required!" })
    )
    .nonempty({ message: "At least one owner is required!" }),
});

export default sellInventorySchema;
