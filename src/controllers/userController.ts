import Config from "@/config";
import { update, AppDispatch } from "@/lib";
import { sessionSet } from "@/lib/reducers";
import axios, { AxiosError } from "axios";

const createUser = async (user: any) => {
  try {
    const response = await axios.post(
      `${Config.API_URL}/user/register`,
      JSON.stringify(user),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error("Username or email already taken");
    }
    throw new Error("Something went wrong");
  }
};

const updateUser =
  (user: any, accessToken: string) => async (dispatch: AppDispatch) => {
    try {
      const response = await axios.put(
        `${Config.API_URL}/user/update`,
        JSON.stringify(user),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response) {
        const payload = {
          isAuthenticated: true,
          credentials: {
            accessToken: accessToken,
            refreshToken: "",
          },
          user: {
            email: response.data.user.email,
            name: response.data.user.name,
            password: "",
            credits: response.data.user.quizCredits,
            username: response.data.user.username,
            role: response.data.user.role,
          },
        };
        dispatch(update(payload));
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        if (error instanceof AxiosError) {
          if (
            error.response?.data.message ==
            "Error validating token: Multiple sessions detected. Please login again."
          ) {
            dispatch(sessionSet());
            return;
          }
          throw new Error("Update failed");
        }
      }
      throw new Error("Something went wrong");
    }
  };

export { createUser, updateUser };
