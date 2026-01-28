import axios from "axios";
import Config from "@/config";

export interface WaitlistData {
  name: string;
  email: string;
  university: string;
}

export interface EmailUpdate {
  _id: string;
  subject: string;
  content: string;
  context?: string;
  type: 'update' | 'promotional' | 'security' | 'general';
  links?: { label: string; url: string }[];
  status: 'draft' | 'approved' | 'sent';
  sentAt?: string;
  createdAt: string;
  updatedAt: string;
}

class WaitlistService {
  async addToWaitlist(data: WaitlistData) {
    const response = await axios.post(`${Config.API_URL}/waitlist`, data);
    return response.data;
  }

  async getWaitlist(accessToken: string, page = 1, limit = 50, search = "", university: string | string[] = "", showDeleted = false) {
    try {
      const response = await axios.get(`${Config.API_URL}/waitlist`, {
        params: { page, limit, search, university, showDeleted },
        headers: { Authorization: `Bearer ${accessToken}` },
        paramsSerializer: { indexes: null } // Ensures arrays are sent as university=A&university=B
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getUniversities(accessToken: string) {
    try {
      const response = await axios.get(`${Config.API_URL}/waitlist/universities`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers(accessToken: string) {
    try {
      const response = await axios.get(`${Config.API_URL}/waitlist/all`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async deleteUser(accessToken: string, id: string) {
    const response = await axios.delete(`${Config.API_URL}/waitlist/${id}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async restoreUser(accessToken: string, id: string) {
    const response = await axios.patch(`${Config.API_URL}/waitlist/restore/${id}`, {}, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async unsubscribe(email: string) {
    const response = await axios.get(`${Config.API_URL}/waitlist/unsubscribe`, {
      params: { email }
    });
    return response.data;
  }

  async generateDailyUpdate(accessToken: string, context: string, type = 'update', links: { label: string, url: string }[] = []) {
    const response = await axios.post(`${Config.API_URL}/waitlist/update/generate`, 
      { context, type, links },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async getPendingUpdate(accessToken: string) {
    const response = await axios.get(`${Config.API_URL}/waitlist/update/pending`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async getAllUpdates(accessToken: string, page = 1, limit = 10) {
    const response = await axios.get(`${Config.API_URL}/waitlist/updates`, {
      params: { page, limit },
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    return response.data;
  }

  async updateUpdate(accessToken: string, id: string, data: { subject?: string, content?: string }) {
    const response = await axios.patch(`${Config.API_URL}/waitlist/update/${id}`, 
      data,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async approveUpdate(accessToken: string, id: string) {
    const response = await axios.post(`${Config.API_URL}/waitlist/update/approve/${id}`, 
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }

  async sendDailyUpdate(accessToken: string, id: string, filters?: { type: 'all' | 'university' | 'specific', value?: string | string[] }) {
    const response = await axios.post(`${Config.API_URL}/waitlist/update/send/${id}`, 
      { filters },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    return response.data;
  }
}

export const waitlistService = new WaitlistService();
