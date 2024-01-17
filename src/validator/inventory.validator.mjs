import { z } from "zod";

const inventorySchema = z.object({
  inventoryType: z.string({ required_error: "Inventory type is required!" }),
  floor: z.string({ required_error: "Floor number is required!" }),
  flatNo: z
    .string({ required_error: "Flat/Shop/Office number is required!" })
    .regex(/^([0-9]{2,})$/gm, {
      message:
        "The flat/shop/office number should be positive and greater then 2 digits!",
    }),
  status: z.enum(["for sell", "sold", "rented"]).default("for sell"),
});

export default inventorySchema;
