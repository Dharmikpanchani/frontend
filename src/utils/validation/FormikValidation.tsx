import * as Yup from "yup";
import moment from "moment";

const emailRegex =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,3}(?:\.[a-zA-Z]{2,3})?$/;
export const englishOnlyRegex = /^[A-Za-z\s]+$/;
export const alphanumericRegex = /^[a-zA-Z0-9]+$/;
export const alphanumericWithSpaceRegex = /^[a-zA-Z0-9\s]+$/;
export const alphanumericWithUnderscoreRegex = /^[a-zA-Z0-9_]+$/;
export const aadhaarRegex = /^\d{12}$/;
export const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;


export const FILE_SIZE = 20 * 1024 * 1024; // 20MB
export const SUPPORTED_FORMATS = ["image/jpg", "image/jpeg", "image/png", "image/svg+xml"];

/*#region field name validation */
export const emailValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid email",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .test("no-starting-dot", "Please enter a valid email", (value) => {
      if (!value) return true;
      return !(/^\./.test(value));
    })
    .test("no-ending-dot", "Please enter a valid email", (value) => {
      if (!value) return true;
      const username = value.split("@")[0];
      return !(/\.$/.test(username));
    })
    .test(
      "consecutive-dots",
      "Please enter a valid email",
      (value?: string) => !(/\.{2,}/.test(value || ""))
    )
    .test("min-prefix-length", "Email prefix must be at least 3 characters", (value) => {
      if (!value) return true;
      const username = value.split("@")[0];
      return username.length >= 3;
    })
    .max(70, "Email must be at most 70 characters")
    .matches(emailRegex, "Please enter a valid email");
  return required ? schema.required("Email is required") : schema;
};

export const passwordValidation = (fieldName: string, required = true) => {
  let schema = Yup.string()
    .min(6, `${fieldName} must be at least 6 characters long`)
    .max(16, `${fieldName} must be at most 16 characters`)
    .matches(
      /\d/,
      `${fieldName} must include at least one number`
    )
    .matches(
      /[a-z]/,
      `${fieldName} must include at least one lowercase letter`
    )
    .matches(
      /[A-Z]/,
      `${fieldName} must include at least one uppercase letter`
    )
    .matches(
      /[^\w\s]/,
      `${fieldName} must include at least one special character`
    )
    .matches(/^\S*$/, `${fieldName} cannot contain spaces`);
  return required ? schema.required(`${fieldName} is required`) : schema;
};

export const roleNameValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid role name",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim()) // remove start/end spaces
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/, "Please enter a valid role name")
    .min(3, "Role name must be at least 3 characters")
    .max(30, "Role name must be at most 30 characters");

  return required
    ? schema.required("Role name is required")
    : schema;
};

export const fullNameValidation = (fieldName: string, required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      `Please enter a valid ${fieldName.toLowerCase()}`,
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim()) // remove start/end spaces
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/, `Please enter a valid ${fieldName.toLowerCase()}`)
    .min(3, `${fieldName} must be at least 3 characters`)
    .max(30, `${fieldName} must be at most 30 characters`);

  return required
    ? schema.required(`${fieldName} is required`)
    : schema;
};

export const phoneNumberValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid phone number",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim()) // remove start/end spaces
    .matches(/^[0-9]{10}$/, "Please enter a valid 10-digit number")
    .max(10, "Phone number must be at most 10 digits");

  return required
    ? schema.required("Phone number is required")
    : schema;
};

export const schoolCodeValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid school code",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim()) // remove start/end spaces
    .matches(/^[A-Za-z0-9-]+$/, "Please enter a valid school code")
    .min(3, "School code must be at least 3 characters")
    .max(30, "School code must be at most 30 characters")
    .test(
      "not-pay",
      "'pay' is a reserved keyword for payments and cannot be used as School Code",
      (value) => value?.toLowerCase() !== "pay"
    );

  return required
    ? schema.required("School code is required")
    : schema;
};

export const schoolNameValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid school name",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim()) // remove start/end spaces
    .matches(/^[A-Za-z]+( [A-Za-z]+)*$/, "Please enter a valid school name")
    .min(5, "School name must be at least 5 characters")
    .max(120, "School name must be at most 120 characters");

  return required
    ? schema.required("School name is required")
    : schema;
};

export const addressValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid address",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be at most 200 characters")
    .matches(/^[A-Za-z0-9\s,./-]+$/, "Invalid address format");

  return required ? schema.required("Address is required") : schema;
};

export const cityValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid city",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be at most 50 characters")
    .matches(/^[A-Za-z\s]+$/, "City can contain only letters");

  return required ? schema.required("City is required") : schema;
};

export const stateValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid state",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .min(2, "State must be at least 2 characters")
    .max(50, "State must be at most 50 characters")
    .matches(/^[A-Za-z\s]+$/, "State can contain only letters");

  return required ? schema.required("State is required") : schema;
};

export const zipCodeValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid zip code",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(/^[0-9]{5,6}$/, "Zip code must be 5 or 6 digits");

  return required ? schema.required("Zip code is required") : schema;
};

export const genericStringValidation = (fieldName: string, min = 1, max = 200, required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      `Please enter a valid ${fieldName.toLowerCase()}`,
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .min(min, `${fieldName} must be at least ${min} characters`)
    .max(max, `${fieldName} must be at most ${max} characters`);

  return required ? schema.required(`${fieldName} is required`) : schema;
};

export const countryValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid country",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .min(2, "Country must be at least 2 characters")
    .max(50, "Country must be at most 50 characters")
    .matches(/^[A-Za-z\s]+$/, "Country can contain only letters");

  return required ? schema.required("Country is required") : schema;
};

export const dateValidation = (required = true, message = "Date is required") => {
  let schema = Yup.mixed<moment.Moment>()
    .test("is-valid", "Please enter a valid date", (value) => {
      if (!value) return true;
      return moment(value).isValid();
    });

  return required
    ? schema.required(message).typeError("Please enter a valid date")
    : schema.nullable();
};

export const dobValidation = (required = true) => {
  return dateValidation(required, "Date of birth is required")
    .test("age-check", "Teacher must be between 18 and 70 years old", (value) => {
      if (!value) return true;
      const age = moment().diff(moment(value), 'years');
      return age >= 18 && age <= 70;
    });
};

export const joiningDateValidation = (required = true) => {
  return dateValidation(required, "Joining date is required")
    .test("future-check", "Joining date must be today or in the future", (value) => {
      if (!value) return true;
      return moment(value).isSameOrAfter(moment(), "day");
    });
};

export const gstValidation = (required = false) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid GST number",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.toUpperCase().trim())
    .matches(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Please enter a valid GST number");
  return required ? schema.required("GST number is required") : schema;
};

export const panValidation = (required = false) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid PAN number",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.toUpperCase().trim())
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Please enter a valid PAN number");
  return required ? schema.required("PAN number is required") : schema;
};

export const registrationNumberValidation = (required = true) => {
  let schema = Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid registration number",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .min(3, "Registration number must be at least 3 characters")
    .max(50, "Registration number must be at most 50 characters");
  return required ? schema.required("Registration number is required") : schema;
};

export const imageValidation = (fieldName = "Image", required = true, minWidth?: number, minHeight?: number) => {
  const schema = Yup.mixed().nullable()
    .test("fileSize", `${fieldName} size must be less than 20MB`, (value: any) => {
      if (!value || typeof value === 'string') return true;
      return value.size <= FILE_SIZE;
    })
    .test("fileFormat", `Only JPG, PNG, SVG allowed`, (value: any) => {
      if (!value || typeof value === 'string') return true;
      return SUPPORTED_FORMATS.includes(value.type);
    })
    .test("dimensions", `Recommended minimum size for ${fieldName.toLowerCase()} is ${minWidth}x${minHeight}px`, (value: any) => {
      if (!value || typeof value === 'string' || !minWidth || !minHeight) return true;
      return new Promise<boolean>((resolve) => {
        const img = new Image();
        img.src = URL.createObjectURL(value);
        img.onload = () => {
          const valid = img.width >= minWidth && img.height >= minHeight;
          URL.revokeObjectURL(img.src);
          resolve(valid);
        };
        img.onerror = () => {
          resolve(false);
        };
      });
    });

  return required ? schema.required(`${fieldName} is required`) : schema;
};

export const fileValidation = (fieldName = "File", required = true, allowedFormats = ["application/pdf", "image/jpg", "image/jpeg", "image/png"]) => {
  const schema = Yup.mixed().nullable()
    .test("fileSize", `${fieldName} size must be less than 20MB`, (value: any) => {
      if (!value || typeof value === 'string') return true;
      return value.size <= FILE_SIZE;
    })
    .test("fileType", `Invalid file type. Only ${allowedFormats.map(f => f.split("/")[1].toUpperCase()).join(", ")} are allowed`, (value: any) => {
      if (!value || typeof value === 'string') return true;
      return allowedFormats.includes(value.type);
    });

  return required ? schema.required(`${fieldName} is required`) : schema;
};
/*#endregion */


/*#region validation schema */
export const loginValidationSchema = Yup.object({
  email: emailValidation(true),
  password: Yup.string().required("Password is required"),
});

export const emailValidationSchema = Yup.object({
  email: emailValidation(true),
});

export const adminUserValidationSchema = Yup.object({
  name: fullNameValidation("Name", true),
  email: emailValidation(true),
  phoneNumber: phoneNumberValidation(true),
  password: Yup.string().when("id", {
    is: (id: string) => !id,
    then: () => passwordValidation("Password", true),
    otherwise: () => Yup.string().optional(),
  }),
  confirmPassword: Yup.string().when("id", {
    is: (id: string) => !id,
    then: () =>
      Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    otherwise: () => Yup.string().optional(),
  }),
  role: Yup.string().required("Please select role"),
  id: Yup.string().optional(),
});

export const profileValidationSchema = Yup.object({
  name: fullNameValidation("Name", true),
  email: emailValidation(true),
  phoneNumber: phoneNumberValidation(false),
  address: addressValidation(false),
  profile: imageValidation("Profile photo", false),
  imageUrl: Yup.string().optional(),
});

export const otpNumberValidationSchema = Yup.object({
  code: Yup.string()
    .length(6, "OTP must be 6 digits")
    .required("Please enter OTP"),
});

export const setPasswordValidationSchema = Yup.object({
  password: passwordValidation("Password", true),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Please confirm your password"),
});

export const roleValidationSchema = Yup.object({
  role: roleNameValidation(true),
});

export const changePasswordValidationSchema = Yup.object({
  oldPassword: Yup.string()
    .required("Please enter current password"),

  newPassword: passwordValidation("New password", true)
    .notOneOf(
      [Yup.ref("oldPassword")],
      "New password cannot be same as current password"
    ),

  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Please confirm your password"),
});

export const emailChangeValidationSchema = Yup.object({
  password: Yup.string().required("Please enter password"),
  newEmail: emailValidation(true),
});

export const schoolValidationSchema = Yup.object({
  id: Yup.string().optional(),
  schoolName: schoolNameValidation(true),
  ownerName: fullNameValidation("Owner name", true),
  email: emailValidation(true),
  phoneNumber: phoneNumberValidation(true),
  password: Yup.string().when("id", {
    is: (id: string) => !id,
    then: () => passwordValidation("Password", true),
    otherwise: () => Yup.string().optional(),
  }),
  confirmPassword: Yup.string().when("id", {
    is: (id: string) => !id,
    then: () =>
      Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    otherwise: () => Yup.string().optional(),
  }),
  schoolCode: schoolCodeValidation(true),
  // Basic Info
  schoolType: Yup.string().required("School type is required"),
  board: Yup.string().required("Board is required"),
  medium: Yup.string().required("Medium is required"),
  establishedYear: dateValidation(true),
  // Address
  address: addressValidation(true),
  city: cityValidation(true),
  state: stateValidation(true),
  zipCode: zipCodeValidation(true),
  country: countryValidation(true),
  // Legal
  registrationNumber: registrationNumberValidation(true),
  gstNumber: gstValidation(false),
  panNumber: panValidation(false),
  affiliationCertificate: fileValidation("Affiliation certificate", false),
  affiliationCertificateUrl: Yup.string().optional(),
  // Branding
  logo: Yup.mixed().nullable().when("id", {
    is: (id: string) => !id,
    then: () => imageValidation("School logo", true, 200, 200),
    otherwise: () => imageValidation("School logo", false, 200, 200),
  }),
  logoUrl: Yup.string().optional(),
  banner: imageValidation("School banner", false, 1200, 400).nullable(),
  bannerUrl: Yup.string().optional(),
});

export const schoolProfileUpdateValidationSchema = Yup.object({
  schoolName: schoolNameValidation(true),
  ownerName: fullNameValidation("Owner name", true),
  phoneNumber: phoneNumberValidation(true),
  schoolType: Yup.string().required("School type is required"),
  board: Yup.string().required("Board is required"),
  medium: Yup.string().required("Medium is required"),
  establishedYear: dateValidation(true),
  address: addressValidation(true),
  city: cityValidation(true),
  state: stateValidation(true),
  zipCode: zipCodeValidation(true),
  country: countryValidation(true),
  registrationNumber: registrationNumberValidation(true),
  gstNumber: gstValidation(false),
  panNumber: panValidation(false),
  logo: imageValidation("School logo", false, 200, 200).nullable(),
  banner: imageValidation("School banner", false, 1200, 400).nullable(),
  affiliationCertificate: fileValidation("Affiliation certificate", false),
});

export const departmentValidationSchema = Yup.object().shape({
  name: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid department name",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(englishOnlyRegex, "Please enter a valid department name")
    .min(2, "Department name must be at least 2 characters")
    .max(50, "Department name must be at most 50 characters")
    .required("Department name is required"),
  code: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid department code",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(alphanumericWithUnderscoreRegex, "Please enter a valid department code")
    .min(2, "Department code must be at least 2 characters")
    .max(20, "Department code must be at most 20 characters")
    .required("Department code is required"),
});

export const subjectValidationSchema = Yup.object().shape({
  name: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid subject name",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(englishOnlyRegex, "Please enter a valid subject name")
    .min(2, "Subject name must be at least 2 characters")
    .max(50, "Subject name must be at most 50 characters")
    .required("Subject name is required"),
  code: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid subject code",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(alphanumericWithUnderscoreRegex, "Please enter a valid subject code")
    .min(2, "Subject code must be at least 2 characters")
    .max(20, "Subject code must be at most 20 characters")
    .required("Subject code is required"),
  departmentIds: Yup.array().min(1, "At least one department is required").required("Department is required"),
});

export const classValidationSchema = Yup.object().shape({
  name: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid class name",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(alphanumericWithSpaceRegex, "Please enter a valid class name")
    .min(1, "Class name must be at least 1 characters")
    .max(50, "Class name must be at most 50 characters")
    .required("Class name is required"),
  code: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid class code",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(alphanumericWithUnderscoreRegex, "Please enter a valid class code")
    .min(1, "Class code must be at least 1 characters")
    .max(20, "Class code must be at most 20 characters")
    .required("Class code is required"),
});

export const sectionValidationSchema = Yup.object().shape({
  code: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid section code",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(alphanumericWithUnderscoreRegex, "Please enter a valid section code")
    .min(1, "Section code must be at least 1 characters")
    .max(20, "Section code must be at most 20 characters")
    .required("Section code is required"),
  classId: Yup.string().required("Class is required"),
});

export const teacherValidationSchema = Yup.object().shape({
  fullName: fullNameValidation("Fullname", true),
  email: emailValidation(true),
  phoneNumber: phoneNumberValidation(true),
  alternatePhoneNumber: phoneNumberValidation(false),
  gender: Yup.string().optional(),
  dateOfBirth: dobValidation(false),
  bloodGroup: Yup.string().optional(),
  // Address
  address: genericStringValidation("Address", 5, 200, false),
  city: cityValidation(false),
  state: stateValidation(false),
  country: countryValidation(false),
  pincode: zipCodeValidation(false),
  // Professional
  joiningDate: Yup.mixed().when("id", {
    is: (id: string) => !!id,
    then: () => dateValidation(true, "Joining date is required"),
    otherwise: () => joiningDateValidation(true)
  }),
  experienceYears: Yup.string()
    .matches(/^\d{1,2}$/, "Experience must be 1-2 digits")
    .required("Experience is required"),
  qualification: genericStringValidation("Qualification", 2, 100, false),
  specialization: genericStringValidation("Specialization", 2, 100, false),
  designation: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid designation",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(englishOnlyRegex, "Designation must contain letters only")
    .required("Designation is required"),
  departmentId: Yup.string().required("Department is required"),
  subjects: Yup.array().min(1, "At least one subject is required").required("Subjects are required"),
  classesAssigned: Yup.array().min(1, "At least one class is required").required("Classes are required"),
  sectionsAssigned: Yup.array().min(1, "At least one section is required").required("Sections are required"),
  // Salary
  employmentType: Yup.string().required("Employment type is required"),
  salary: Yup.number()
    .transform((value, originalValue) => originalValue === "" ? undefined : value)
    .positive("Salary must be positive")
    .optional(),
  salaryType: Yup.string().optional(),
  bankName: Yup.string()
    .test(
      "no-whitespace",
      "Please enter a valid bank name",
      (_value, context) => typeof context.originalValue !== 'string' || context.originalValue.trim() === context.originalValue
    )
    .transform((value) => value?.trim())
    .matches(englishOnlyRegex, "Bank name must contain letters only")
    .optional(),
  accountNumber: Yup.string()
    .matches(/^\d+$/, "Account number must be numeric")
    .min(10, "Account number is too short")
    .max(18, "Account number is too long")
    .optional(),

  confirmAccountNumber: Yup.string()
    .oneOf([Yup.ref('accountNumber')], "Account numbers must match")
    .when('accountNumber', {
      is: (val: string) => val && val.length > 0,
      then: (schema) => schema.required("Please confirm your account number"),
      otherwise: (schema) => schema.optional(),
    }),
  ifscCode: Yup.string()
    .matches(ifscRegex, "Invalid IFSC code format (e.g. SBIN0012345)")
    .optional(),

  panNumber: panValidation(false),
  aadharNumber: Yup.string()
    .matches(/^\d+$/, "Aadhar number must be numeric")
    .min(12, "Aadhar number must be at least 12 digits")
    .max(12, "Aadhar number must be at most 12 digits")
    .optional(),

  // Auth
  id: Yup.string().optional(),
  password: Yup.string().when("id", {
    is: (id: string) => !id,
    then: () => passwordValidation("Password", true),
    otherwise: () => Yup.string().optional(),
  }),
  confirmPassword: Yup.string().when("id", {
    is: (id: string) => !id,
    then: () =>
      Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Please confirm your password"),
    otherwise: () => Yup.string().optional(),
  }),

  // Tracking
  attendanceId: Yup.string()
    .matches(/^[A-Z0-9_]+$/, "Only uppercase letters, numbers and underscores are allowed")
    .optional(),
  leaveBalance: Yup.string()
    .matches(/^\d{1,2}$/, "Leave balance must be 1-2 digits")
    .optional(),
  shiftTiming: Yup.string().optional(),
  shiftTimeFrom: dateValidation(false).when("shiftTimeTo", {
    is: (val: any) => !!val,
    then: (schema) => schema.required("Start time is required"),
    otherwise: (schema) => schema.optional(),
  }),
  shiftTimeTo: dateValidation(false)
    .when("shiftTimeFrom", {
      is: (val: any) => !!val,
      then: (schema) => schema.required("End time is required"),
      otherwise: (schema) => schema.optional(),
    })
    .test(
      "is-after",
      "End time must be after start time",
      function (value) {
        const { shiftTimeFrom } = this.parent;
        if (!value || !shiftTimeFrom) return true;
        return moment(value).isAfter(moment(shiftTimeFrom));
      }
    ),
  // Documents
  profileImage: imageValidation("Profile Image", false).nullable(),
  resume: fileValidation("Resume", false, ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "image/jpeg", "image/jpg", "image/png", "image/svg+xml"]).nullable(),
  idProof: imageValidation("ID Proof", false).nullable(),
  educationCertificates: Yup.array().of(Yup.mixed()).optional(),
  experienceCertificates: Yup.array().of(Yup.mixed()).optional(),
}, [["shiftTimeFrom", "shiftTimeTo"]]);

import { calculateMinMonthlyPrice } from "@/apps/common/StaticArrayData";

export const planValidationSchema = Yup.object().shape({
  id: Yup.string().optional(),
  planName: genericStringValidation("Plan name", 3, 50, true),
  permissions: Yup.array().of(Yup.string()).optional(),
  monPrice: Yup.number()
    .typeError("Monthly Price must be a number")
    .min(0, "Price cannot be negative")
    .test("min-monthly-price", "Minimum price not met", function (value) {
      const { permissions, billingCycle } = this.parent;
      if (billingCycle !== "monthly") return true;
      const minPrice = calculateMinMonthlyPrice(permissions || []);
      if ((value || 0) < minPrice) {
        return this.createError({ message: `Monthly price must be at least ₹ ${minPrice}` });
      }
      return true;
    })
    .when("billingCycle", {
      is: "monthly",
      then: (schema) => schema.required("Monthly price is required"),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  monOfferPrice: Yup.number()
    .typeError("Monthly Offer Price must be a number")
    .min(0, "Offer price cannot be negative")
    .optional()
    .nullable(),
  yerPrice: Yup.number()
    .typeError("Yearly Price must be a number")
    .min(0, "Price cannot be negative")
    .test("min-yearly-price", "Minimum price not met", function (value) {
      const { permissions, billingCycle } = this.parent;
      if (billingCycle !== "yearly") return true;
      const minPrice = calculateMinMonthlyPrice(permissions || []) * 12;
      if ((value || 0) < minPrice) {
        return this.createError({ message: `Yearly price must be at least ₹ ${minPrice}` });
      }
      return true;
    })
    .when("billingCycle", {
      is: "yearly",
      then: (schema) => schema.required("Yearly price is required"),
      otherwise: (schema) => schema.optional().nullable(),
    }),
  yerOfferPrice: Yup.number()
    .typeError("Yearly Offer Price must be a number")
    .min(0, "Offer price cannot be negative")
    .optional()
    .nullable(),
  billingCycle: Yup.string().required("Billing cycle is required"),
});
