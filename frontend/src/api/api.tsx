import axios from "axios";
import { API_BASE_URL } from "../config/env";

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      } | null;
    };
  }
}

export const api = axios.create({
  baseURL: API_BASE_URL,
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
