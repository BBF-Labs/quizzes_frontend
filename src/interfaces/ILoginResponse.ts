interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    username: string;
    role: string;
    isBanned: boolean;
  };
}

export default ILoginResponse;
