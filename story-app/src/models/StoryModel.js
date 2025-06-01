import {
  getAllStories,
  getStoryDetail,
  addStory,
  addStoryGuest,
} from "../data/api.js";

export class StoryModel {
  constructor(authModel) {
    this.authModel = authModel;
  }

  async getAllStories(page = 1, size = 10, withLocation = false) {
    try {
      const token = this.authModel.getToken();

      if (!token && this.authModel.isAuthenticated()) {
        return { success: false, message: "Authentication required" };
      }

      const response = await getAllStories(token, page, size, withLocation);

      if (!response.error) {
        return {
          success: true,
          stories: Array.isArray(response.listStory) ? response.listStory : [],
        };
      }

      return {
        success: false,
        message: response.message || "Failed to fetch stories",
      };
    } catch (error) {
      console.error("Get stories error:", error);
      return {
        success: false,
        message: error.message || "Network error while fetching stories",
      };
    }
  }

  async getStoryDetail(id) {
    try {
      const token = this.authModel.getToken();

      if (!token) {
        return { success: false, message: "Authentication required" };
      }

      const response = await getStoryDetail(id, token);

      if (!response.error) {
        return { success: true, story: response.story };
      }

      return {
        success: false,
        message: response.message || "Failed to fetch story",
      };
    } catch (error) {
      console.error("Get story detail error:", error);
      return {
        success: false,
        message: error.message || "Network error while fetching story",
      };
    }
  }

  async addStory(data) {
    try {
      const token = this.authModel.getToken();
      let response;

      // Validate required fields
      if (!data?.description || !data?.photo) {
        return {
          success: false,
          message: "Description and photo are required",
        };
      }

      if (token) {
        response = await addStory(data, token);
      } else {
        response = await addStoryGuest(data);
      }

      if (!response.error) {
        return {
          success: true,
          message: "Story added successfully",
          data: response,
        };
      }

      return {
        success: false,
        message: response.message || "Failed to add story",
      };
    } catch (error) {
      console.error("Add story error:", error);
      return {
        success: false,
        message: error.message || "Network error while adding story",
      };
    }
  }



  static async getStoriesByUser(userId) {
    const response = await api.get(`/stories?userId=${userId}`);
    return response.data;
  }
}
