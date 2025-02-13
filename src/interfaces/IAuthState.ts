interface IUser {
  email: string;
  name: string;
  password: string;
  username: string;
  credits: number;
  role: string;
}

interface IAuthState {
  isAuthenticated: boolean;
  credentials: {
    accessToken: string;
    refreshToken: string;
  };
  user: IUser;
}

export type { IUser, IAuthState };
