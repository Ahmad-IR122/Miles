const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000/";

if (!API_BASE_URL) {
  throw new Error("VITE_API_URL is not configured");
}

export { API_BASE_URL };
