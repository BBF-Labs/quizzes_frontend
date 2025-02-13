import Config from "@/config";
import { update, AppDispatch } from "@/lib";
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

    if (response.data.message === "Error creating user: User already exists") {
      throw new Error("User Already exist");
    }

    return response.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error("Update Failed");
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
            password: response.data.user.password,
            credits: response.data.user.quizCredits,
            username: response.data.user.username,
            role: response.data.user.role,
          },
        };
        dispatch(update(payload));
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        throw new Error("Update Failed");
      }
      throw new Error("Something went wrong");
    }
  };

export { createUser, updateUser };
