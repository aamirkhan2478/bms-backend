import { z } from "zod";

const ownerTenantSchema = z.object({
  name: z
    .string({ required_error: "Name is required!" })
    .regex(/^(?=.{3,70}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/, {
      message:
        "Name should have at least 3 characters, not any number and first letter capital!",
    }),
  father: z
    .string({ required_error: "Father name is required!" })
    .regex(/^(?=.{3,70}$)(?![a-z])(?!.*[_.]{2})[a-zA-Z ]+(?<![_.])$/, {
      message:
        "Name should have at least 3 characters, not any number and first letter capital!",
    }),
  cnic: z
    .string({ required_error: "CNIC number is required!" })
    .regex(/^[0-9]{5}-[0-9]{7}-[0-9]$/, {
      message: "CNIC must be 13 characters!",
    }),
  cnicExpiry: z
    .string({ required_error: "CNIC Expiry Date is required!" })
    .refine((value) => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (!dateRegex.test(value)) {
        return {
          success: false,
          message: "Invalid date format. Please use YYYY-MM-DD.",
        };
      }

      const today = new Date();
      const expiryDate = new Date(value);

      if (expiryDate < today) {
        return { success: false, message: "CNIC is expired!" };
      }

      return true;
    }),
  phoneNumber: z
    .array(z.string({ required_error: "Phone number is required!" }))
    .nonempty({ message: "Phone number is required!" }),
  emergencyNumber: z.array(z.string()).optional().default([]),
  whatsapp: z
    .array(z.string({ required_error: "Whatsapp number is required!" }))
    .nonempty({ message: "Whatsapp number is required!" }),
  email: z.string().email({
    required_error: "Email is required!",
    message: "Invalid email address!",
  }),
  currentAddress: z.string({ required_error: "Current address is required!" }),
  permanentAddress: z.string({
    required_error: "Permanent address is required!",
  }),
  jobTitle: z.string().optional(),
  jobLocation: z.string().optional(),
  jobOrganization: z.string().optional(),
  bankName: z.string().optional(),
  bankTitle: z.string().optional(),
  bankBranchAddress: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIbnNumber: z
    .string()
    .refine((value) => {
      const regex = /^[A-Za-z0-9 ]{24}$/;

      if (!regex.test(value)) {
        return {
          success: false,
          message: "Invalid IBN number!",
        };
      }

      return true;
    })
    .optional(),
  remarks: z.string().optional(),
});

export default ownerTenantSchema;
