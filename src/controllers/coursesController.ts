import axios from "axios";
import Config from "@/config";

const getAllCourses = async () => {
  try {
    const response = await axios.get(`${Config.API_URL}/courses`);
    return response.data.courses;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export { getAllCourses };
