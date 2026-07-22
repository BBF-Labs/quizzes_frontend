import axios, { AxiosError } from "axios";
import Config from "@/config";
import { ICourse, IPaginationMeta, IUpdateCoursePayload } from "@/interfaces";

const url = Config.API_URL;

interface IPaginatedCourses {
  courses: ICourse[];
  meta?: IPaginationMeta;
}

// The learning module's admin routes wrap responses as { success, message, data, meta },
// so the real payload is always response.data.data here — unlike a couple of older
// controllers in this app that read flat top-level fields instead.
const getAdminCourses = async (
  accessToken: string,
  page = 1,
  limit = 20
): Promise<IPaginatedCourses> => {
  try {
    const response = await axios.get(`${url}/admin/learning/courses`, {
      params: { page, limit },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return {
      courses: response.data.data ?? [],
      meta: response.data.meta,
    };
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message ?? "Couldn't load courses");
    }
    throw new Error("Couldn't load courses");
  }
};

const getAdminCourse = async (
  id: string,
  accessToken: string
): Promise<ICourse> => {
  try {
    const response = await axios.get(`${url}/admin/learning/courses/${id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    return response.data.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data?.message ?? "Couldn't load course");
    }
    throw new Error("Couldn't load course");
  }
};

const updateAdminCourse = async (
  id: string,
  payload: IUpdateCoursePayload,
  accessToken: string
): Promise<ICourse> => {
  try {
    const response = await axios.patch(
      `${url}/admin/learning/courses/${id}`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.data;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      const data = error.response?.data;
      const fieldErrors = data?.errors
        ?.map((e: { message: string }) => e.message)
        .join(", ");
      throw new Error(fieldErrors || data?.message || "Couldn't update course");
    }
    throw new Error("Couldn't update course");
  }
};

export { getAdminCourses, getAdminCourse, updateAdminCourse };
