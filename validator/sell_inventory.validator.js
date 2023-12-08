import { z } from "zod";

const sellInventorySchema = z.object({
  inventories: z.array(
    z.string({ required_error: "Inventory ID is required!" })
  ),
  owners: z.array(z.string({ required_error: "Owner ID is required!" })),
});

export default sellInventorySchema;
