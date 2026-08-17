import axios from "axios";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      } | null;
    };
  }
}

const API_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/";

export const api = axios.create({
  baseURL: API_URL,
});
api.interceptors.request.use(async (config) => {
  try {
    const token = await window.Clerk?.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // If we can't get a token (like no active Clerk session), send the
    // request unauthenticated and let the backend reject it if needed.
  }
  return config;
});
