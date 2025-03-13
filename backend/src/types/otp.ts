export type TOtp = {
  otp: number;
  email: string;
  expiredAt: Date;
};

export type TVerifyOtpToRegister = {
  otp: number;
  email: string;
};