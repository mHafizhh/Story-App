import CONFIG from "../config";
import AuthService from "./auth-service";

const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function login(email, password) {
  const response = await fetch(ENDPOINTS.LOGIN, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      password,
    }),
  });

  return await response.json();
}

export async function register(name, email, password) {
  const response = await fetch(ENDPOINTS.REGISTER, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      email,
      password,
    }),
  });

  return await response.json();
}

export async function getStories({ location = 0 } = {}) {
  const token = AuthService.getToken();

  if (!token) {
    throw new Error("Tidak ada token autentikasi");
  }

  const url = new URL(ENDPOINTS.STORIES);

  if (location) {
    url.searchParams.append("location", location);
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}

export async function addStory({ description, photo, lat, lon }) {
  const token = AuthService.getToken();

  if (!token) {
    throw new Error("Tidak ada token autentikasi");
  }

  if (photo.size > 1024 * 1024) {
    throw new Error("Ukuran foto tidak boleh lebih dari 1MB");
  }

  const formData = new FormData();
  formData.append("description", description);
  formData.append("photo", photo);
  
  if (typeof lat === 'number' && !isNaN(lat)) {
    formData.append("lat", lat);
  }
  
  if (typeof lon === 'number' && !isNaN(lon)) {
    formData.append("lon", lon);
  }

  const response = await fetch(ENDPOINTS.STORIES, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const responseJson = await response.json();

  return {
    error: !response.ok,
    message: responseJson.message || "Terjadi kesalahan",
    data: responseJson.story
  };
}

export async function getStoryDetail(id) {
  const token = AuthService.getToken();

  if (!token) {
    throw new Error("Tidak ada token autentikasi");
  }

  const response = await fetch(`${ENDPOINTS.STORIES}/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseJson = await response.json();

  return {
    error: !response.ok,
    message: responseJson.message || "Terjadi kesalahan",
    story: responseJson.story
  };
}

export async function subscribePushNotification(subscription) {
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthService.getToken()}`,
    },
    body: JSON.stringify({
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }

  return responseJson;
}

export async function unsubscribePushNotification(endpoint) {
  const response = await fetch(`${CONFIG.BASE_URL}/notifications/subscribe`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AuthService.getToken()}`,
    },
    body: JSON.stringify({ endpoint }),
  });

  const responseJson = await response.json();

  if (!response.ok) {
    throw new Error(responseJson.message);
  }

  return responseJson;
}
