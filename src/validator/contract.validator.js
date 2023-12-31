import { z } from "zod";

const contractValidator = z.object({
  tenants: z
    .array(z.string({ required_error: "Tenant is required!" }))
    .nonempty({ message: "At least one tenant is required!" }),
  inventory: z.string({ required_error: "Inventory is required!" }),
  owners: z
    .array(z.string({ required_error: "Owner is required!" }))
    .nonempty({ message: "At least one owner is required!" }),
  signingDate: z
    .string({ required_error: "Signing date is required!" })
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
  startDate: z
    .string({ required_error: "Start date is required!" })
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
  endDate: z
    .string({ required_error: "End date is required!" })
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
  renewalDate: z
    .string({ required_error: "Renewal date is required!" })
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
  monthlyRentalAmount: z.string({
    required_error: "Monthly rental amount is required!",
  }),
  monthlyTaxAmount: z.string({
    required_error: "Monthly tax amount is required!",
  }),
  buildingManagementCharges: z.string({
    required_error: "Building management charges is required!",
  }),
  securityDepositAmount: z.string({
    required_error: "Security deposit amount is required!",
  }),
  annualRentalIncrease: z.string({
    required_error: "Annual rental increase is required!",
  }),
  wapdaSubmeterReading: z.string().optional(),
  generatorSubmeterReading: z.string().optional(),
  waterSubmeterReading: z.string().optional(),
  monthlyRentalDueDate: z.string({
    required_error: "Monthly rental due date is required!",
  }),
  monthlyRentalOverDate: z.string({
    required_error: "Monthly rental over date is required!",
  }),
  agent: z.string({ required_error: "Agent is required!" }),
  terminationNoticePeriod: z.string({
    required_error: "Termination notice period is required!",
  }),
  nonrefundableSecurityDeposit: z.enum(["yes", "no"]).default("no"),
  remarks: z.string().optional(),
});

export default contractValidator;
