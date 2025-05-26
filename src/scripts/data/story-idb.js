import { openDB } from 'idb';
import { getStories } from './api';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const StoryIdb = {
  async initDb() {
    return openDB(DATABASE_NAME, DATABASE_VERSION, {
      upgrade(database) {
        // Buat object store jika belum ada
        if (!database.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          const objectStore = database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
          // Buat index untuk pencarian dan pengurutan
          objectStore.createIndex('name', 'name', { unique: false });
          objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      },
    });
  },

  async getDb() {
    return this.initDb();
  },

  async getAllStories() {
    // Hanya mengambil cerita yang tersimpan di IndexedDB
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const stories = await store.getAll();
    
    return stories;
  },

  async getStoryById(id) {
    if (!id) {
      return null;
    }

    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const story = await store.get(id);
    
    return story;
  },

  async saveStory(story) {
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    
    await store.put(story);
    await tx.done;
  },

  async deleteStory(id) {
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    
    await store.delete(id);
    await tx.done;
  },

  async searchStories(query) {
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const stories = await store.getAll();

    return stories.filter((story) => 
      story.description.toLowerCase().includes(query.toLowerCase()) ||
      story.name.toLowerCase().includes(query.toLowerCase())
    );
  },

  async clearStories() {
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    
    await store.clear();
    await tx.done;
  },

  async clearAllStories() {
    const db = await this.getDb();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    
    await store.clear();
    await tx.done;
  },
};

export default StoryIdb; 