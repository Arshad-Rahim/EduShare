import bcrypt from "bcrypt";

export const hashPassword = async (password: string): Promise<string> => {
  const hashedPassword = bcrypt.hash(password, 10);
  return hashedPassword;
};

export const comparePassword = async (
  currentPassword: string,
  orginalPassword: string
): Promise<boolean> => {
  const compared = await bcrypt.compare(currentPassword,orginalPassword);
  return compared
};