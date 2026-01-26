import axios from "axios";
import Config from "@/config";

export interface WaitlistData {
  name: string;
  email: string;
  university: string;
}

class WaitlistService {
  async addToWaitlist(data: WaitlistData) {
    const response = await axios.post(`${Config.API_URL}/waitlist`, data);
    return response.data;
  }
}

export const waitlistService = new WaitlistService();
