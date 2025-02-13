import { ILoginResponse } from "@/interfaces";
import { logout, login, AppDispatch } from "@/lib";
import axios from "axios";
import qs from "qs";
import Config from "@/config";

const url = Config.API_URL;

const getUserInfo = async (accessToken: string) => {
  try {
    const response = await axios.get(`${url}/user/profile`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

const loginUser =
  (username: string, password: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.post<ILoginResponse>(
        `${url}/auth/login`,
        JSON.stringify({ username, password }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        const user = await getUserInfo(response.data.accessToken);

        const payload = {
          isAuthenticated: true,
          credentials: {
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
          },
          user: {
            email: user.email,
            name: user.name,
            password: password,
            credits: user.quizCredits,
            username: user.username,
            role: user.role,
          },
        };

        dispatch(login(payload));
      }
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

const logoutUser = () => async (dispatch: AppDispatch) => {
  dispatch(logout());
};

const refreshToken = async (refreshToken: string) => {
  try {
    const data = qs.stringify({
      refreshToken,
    });

    const response = await axios.post(`${url}/auth/refresh`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response) {
      throw new Error("Invalid refresh token");
    }

    return response.data.accessToken;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export { loginUser, logoutUser, refreshToken };
