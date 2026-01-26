import Config from "@/config";
import axios, { AxiosError } from "axios";

export interface IPackage {
  id: string; // Transformed from _id in backend controller
  name: string;
  price: number;
  duration: string;
  isUpgradable: boolean;
  numberOfCourses: number;
  numberOfQuizzes: number;
  discountCode?: string;
  discountPercentage?: number;
  description?: string; // May need to be added to model if not present, but using what's available
  features?: string[]; // May be inferred or added to model
  period?: string; // Inferred from duration
}

export const getAllPackages = async (): Promise<IPackage[]> => {
  try {
    const response = await axios.get(`${Config.API_URL}/packages`);
    // Backend returns { message: "Success", package: [...] }
    return response.data.package;
  } catch (error: any) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message || "Failed to fetch packages");
    }
    throw new Error(error.message);
  }
};
