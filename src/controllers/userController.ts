import Config from "@/config";
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

const updateUser = async (user: any, accessToken: string) => {
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

      return response.data;
    } catch (error: any) {
      if (error instanceof AxiosError) {
          if (
            error.response?.data.message ==
            "Error validating token: Multiple sessions detected. Please login again."
          ) {
             // Let the caller handle session errors or use interceptors
             throw new Error(error.response?.data.message);
          }
          throw new Error("Update failed");
      }
      throw new Error("Something went wrong");
    }
  };

export { createUser, updateUser };
