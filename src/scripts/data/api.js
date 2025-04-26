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
