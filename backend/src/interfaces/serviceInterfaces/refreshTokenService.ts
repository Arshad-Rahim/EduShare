export interface IRefreshTokenService {
  execute(refreshToken: string): {
    role: string;
    accessToken: string;
  };
}
