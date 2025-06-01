export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("StoryAppDB", 1);

    request.onerror = (event) => {
      console.error("Database error:", event.target.error);
      reject("Database error");
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Create object store for stories
      if (!db.objectStoreNames.contains("stories")) {
        const storiesStore = db.createObjectStore("stories", { keyPath: "id" });
        storiesStore.createIndex("createdAt", "createdAt", { unique: false });
      }

      // Create object store for user data
      if (!db.objectStoreNames.contains("user")) {
        db.createObjectStore("user", { keyPath: "id" });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
  });
};

export const saveStories = async (stories) => {
  try {
    const db = await initDB();
    const transaction = db.transaction("stories", "readwrite");
    const store = transaction.objectStore("stories");

    stories.forEach((story) => {
      store.put(story);
    });

    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        resolve(true);
      };
    });
  } catch (error) {
    console.error("Failed to save stories:", error);
    return false;
  }
};

export const getStories = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction("stories", "readonly");
    const store = transaction.objectStore("stories");
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result || []);
      };
    });
  } catch (error) {
    console.error("Failed to get stories:", error);
    return [];
  }
};

export const saveUserData = async (userData) => {
  try {
    const db = await initDB();
    const transaction = db.transaction("user", "readwrite");
    const store = transaction.objectStore("user");

    store.put({ id: "currentUser", ...userData });

    return new Promise((resolve) => {
      transaction.oncomplete = () => {
        resolve(true);
      };
    });
  } catch (error) {
    console.error("Failed to save user data:", error);
    return false;
  }
};

export const getUserData = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction("user", "readonly");
    const store = transaction.objectStore("user");
    const request = store.get("currentUser");

    return new Promise((resolve) => {
      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  } catch (error) {
    console.error("Failed to get user data:", error);
    return null;
  }
};
