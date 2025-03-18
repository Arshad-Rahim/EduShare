import { Response } from "express";

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string,
  accessTokenName: string,
  refreshTokenName: string
) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.cookie(accessTokenName, accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });

  res.cookie(refreshTokenName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
  });
};
