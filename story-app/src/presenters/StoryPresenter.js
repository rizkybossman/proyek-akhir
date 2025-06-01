export class StoryPresenter {
  constructor(storyModel, storyView, router) {
    this.storyModel = storyModel;
    this.storyView = storyView;
    this.router = router;
    this.currentStoryId = null;
    this.isLoading = false;
    this.mapInitialized = false;

    this.initializeEventBindings();
  }

  initializeEventBindings() {
    if (this.storyView.bindLoadStories) {
      this.storyView.bindLoadStories(this.handleLoadStories.bind(this));
    }

    if (this.storyView.bindAddStory) {
      this.storyView.bindAddStory(this.handleAddStory.bind(this));
    }

    if (this.storyView.bindLoadStoryDetail) {
      this.storyView.bindLoadStoryDetail(this.handleLoadStoryDetail.bind(this));
    }
  }

  async handleLoadStories(page = 1, size = 10) {
    try {
      const result = await this.storyModel.getAllStories(page, size);

      if (result.success) {
        if (result.stories && result.stories.length > 0) {
          this.storyView.displayStories?.(result.stories);
        } else {
          this.storyView.displayStories?.([]);
          this.storyView.showError?.("No stories found");
        }
      } else {
        this.storyView.showError?.(result.message || "Failed to load stories");
      }
    } catch (error) {
      console.error("Load stories error:", error);
      this.storyView.showError?.("Failed to load stories. Please try again.");
    }
  }

  async handleLoadStoryDetail(id) {
    try {
      if (this.isLoading || this.currentStoryId === id) return;

      this.isLoading = true;
      this.currentStoryId = id;

      this.storyView.prepareMapContainer?.();

      const result = await this.storyModel.getStoryDetail(id);

      if (result.success) {
        await new Promise((resolve) => requestAnimationFrame(resolve));

        this.storyView.displayStoryDetail?.(result.story);
      } else {
        this.storyView.showError?.(result.message || "Story not found");
        this.router.navigateTo("/stories");
      }
    } catch (error) {
      console.error("Load story detail error:", error);
      this.storyView.showError?.("Failed to load story details");
      this.router.navigateTo("/stories");
    } finally {
      this.isLoading = false;
    }
  }

  async handleAddStory(data) {
    try {
      const result = await this.storyModel.addStory(data);

      if (result.success) {
        this.storyView.showSuccess?.("Story added successfully!");
        this.cleanup(); // Clean up before navigation
        setTimeout(() => {
          this.handleLoadStories();
          this.router.navigateTo("/stories");
        }, 1500);
      } else {
        this.storyView.showError?.(result.message || "Failed to add story");
      }
    } catch (error) {
      console.error("Add story error:", error);
      this.storyView.showError?.("Failed to add story. Please try again.");
    }
  }

  cleanup() {
    if (typeof this.storyView.cleanup === "function") {
      this.storyView.cleanup();
    }

    // Reset presenter state
    this.currentStoryId = null;
    this.isLoading = false;
  }
}
