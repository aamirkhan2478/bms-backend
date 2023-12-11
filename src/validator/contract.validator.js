import { z } from "zod";

const contractValidator = z.object({
  tenants: z
    .array(z.string({ required_error: "Tenant is required!" }))
    .nonempty({ message: "At least one tenant is required!" }),
  inventories: z
    .array(z.string({ required_error: "Inventory is required!" }))
    .nonempty({ message: "At least one inventory is required!" }),
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
  wapdaSubmeterReading: z
    .number({
      invalid_type_error: "Wapda submeter reading must be a number!",
    })
    .int({ message: "Wapda submeter reading must be an integer!" })
    .positive({ message: "Wapda submeter reading must be a positive number!" })
    .optional(),
  generatorSubmeterReading: z
    .number({
      invalid_type_error: "Generator submeter reading must be a number!",
    })
    .int({ message: "Generator submeter reading must be an integer!" })
    .positive({
      message: "Generator submeter reading must be a positive number!",
    })
    .optional(),
  waterSubmeterReading: z
    .number({
      required_error: "Water submeter reading is required!",
      invalid_type_error: "Water submeter reading must be a number!",
    })
    .int({ message: "Water submeter reading must be an integer!" })
    .positive({ message: "Water submeter reading must be a positive number!" })
    .optional(),
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
