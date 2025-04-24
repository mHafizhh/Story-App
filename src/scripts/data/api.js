import CONFIG from '../config';
import { getToken } from '../utils/auth';

const ENDPOINTS = {
  GET_STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getAllStories() {
  try {
    const token = getToken(); 

    if (!token) {
      throw new Error('Token tidak ditemukan. Anda harus login terlebih dahulu.');
    }

    const response = await fetch(ENDPOINTS.GET_STORIES, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data cerita');
    }

    const result = await response.json();
    return result.listStory; 
  } catch (error) {
    console.error('Error fetching stories:', error);
    return [];
  }
}

export default {
  getAllStories,
};