export interface LoginInterface {
  email: string;
  password: string;
}

export interface OtpNumberInterface {
  code: string;
}

export interface SetPasswordInterface {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordInterface {
  newPassword: string;
  oldPassword: string;
  confirmPassword: string;
}

export interface EmailInterface {
  email: string;
}

export interface EmailChangeInterface {
  password: string;
  newEmail: string;
}