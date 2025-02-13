import axios, { AxiosError } from "axios";
import Config from "@/config";

const getAllCourses = async () => {
  try {
    const response = await axios.get(`${Config.API_URL}/courses`);

    if (response.status === 429) {
      throw new Error("Too many requests");
    }
    return response.data.courses;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error("Fetch failed, refresh");
    }
    throw new Error("Could load courses");
  }
};

export { getAllCourses };
