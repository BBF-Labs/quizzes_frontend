import { ILoginResponse } from "@/interfaces";
import axios, { AxiosError } from "axios";
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

const loginUser = async (username: string, password: string) => {
    try {
      const response = await axios.post<ILoginResponse | any>(
        `${url}/auth/login`,
        JSON.stringify({ username, password }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.accessToken) {
        const user = await getUserInfo(response.data.accessToken);

        const expiryTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
        localStorage.setItem("aExpBff", expiryTime);

        // We return the payload structure so caller can handle state update
        return {
          isAuthenticated: true,
          hasMultipleSessions: false,
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
      }
      // If no accessToken, return null or throw an error, depending on desired behavior
      return null;
    } catch (error: any) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data.message);
      }
      throw new Error(error);
    }
  };

const logoutUser = () => {
  // Logic handled by context/hook
  return Promise.resolve();
};

const refreshToken = async (refreshToken: string) => {
  try {
    const data = qs.stringify({
      refreshToken,
    });

    const response = await axios.post(`${url}/auth/refresh`, data, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded", // Fix: qs.stringify usually implies urlencoded
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
