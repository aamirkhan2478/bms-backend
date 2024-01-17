import { z } from "zod";

const sellInventorySchema = z.object({
  ownerId: z.string({ required_error: "Owner is required" }),
  inventoryId: z.string({ required_error: "inventory is required" }),
  purchaseDate: z
    .string({ required_error: "Purchase Date is required" })
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
});

export default sellInventorySchema;
